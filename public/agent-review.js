const REVIEW_STATE_KEY = 'staj-agent-review-state-v1';
const THEME_KEY = 'staj-theme';
const API_KEY_STORAGE_KEY = 'staj-apikey';

const PREP_STAGES = [
  { key: 'queued', label: 'Queueing workspace', copy: 'Opening the route and loading the company context.' },
  { key: 'research', label: 'Researching company', copy: 'Finding company signals, public sources, and the best contact path.' },
  { key: 'shape', label: 'Structuring draft', copy: 'Normalizing the research result into a first-pass outreach draft.' },
  { key: 'polish', label: 'Polishing copy', copy: 'Sharpening the draft into a cleaner final message.' },
  { key: 'ready', label: 'Ready for review', copy: 'The email is ready for editing, opening, or sending.' }
];

const STALL_LIMITS_MS = {
  queued: 30000,
  research: 180000,
  shape: 30000,
  polish: 180000,
  ready: Infinity
};

const routeForm = document.getElementById('agentRouteForm');
const routeComposePlaceholder = document.getElementById('agentComposePlaceholder');
const routeEmpty = document.getElementById('agentRouteEmpty');
const routeError = document.getElementById('agentRouteError');
const routeSubmit = null; // removed — actions handled by dedicated buttons
const routeCancel = document.getElementById('agentRouteCancel');
const routeGmailBtn = document.getElementById('agentRouteGmailBtn');
const routeSendBtn = document.getElementById('agentRouteSendBtn');
const routeTo = document.getElementById('agentRouteTo');
const routeCc = document.getElementById('agentRouteCc');
const routeSubject = document.getElementById('agentRouteSubject');
const routeBody = document.getElementById('agentRouteBody');
const routeFlowStatus = document.getElementById('agentFlowStatus');
const routeHeroTitle = document.getElementById('agentHeroTitle');
const routeHeroSub = document.getElementById('agentHeroSub');
const routeFlowSummary = null; // removed from layout
const routeAttachmentReason = document.getElementById('agentRouteAttachmentReason');
const routeAssetList = document.getElementById('agentRouteAssetList');
const routeIncludeResume = document.getElementById('agentRouteIncludeResume');
const routeIncludeTranscript = document.getElementById('agentRouteIncludeTranscript');
const routeIncludePortfolioLink = document.getElementById('agentRouteIncludePortfolioLink');
const routeToneGrid = document.getElementById('agentRouteToneGrid');
const routeToneStatus = document.getElementById('agentRouteToneStatus');
const routeSafetyNote = document.getElementById('agentRouteSafetyNote');
const routeManualAttachmentNote = document.getElementById('agentManualAttachmentNote');
const routeStageList = document.getElementById('agentStageList');
const routeStageSummary = document.getElementById('agentStageSummary');
const routeStageElapsed = document.getElementById('agentStageElapsed');
const routeRetryBtn = document.getElementById('agentRetryBtn');
const routeStreamLog = document.getElementById('agentStreamLog');
const routeStreamStatus = document.getElementById('agentStreamStatus');
const routeEmptyCopy = document.getElementById('agentEmptyCopy');

const MAX_STREAM_LOG_ITEMS = 24;

let reviewState = null;
let elapsedTimer = null;
let draftSyncTimer = null;
let activeFlowRunId = '';

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeMailtoValue(value) {
  return encodeURIComponent(String(value || ''));
}

function formatClock(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function formatDuration(ms) {
  if (!Number.isFinite(ms) || ms < 0) return '0s';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (!minutes) return `${seconds}s`;
  return `${minutes}m ${seconds}s`;
}

function getStageLabel(stepKey) {
  return PREP_STAGES.find((item) => item.key === stepKey)?.label || 'Preparing';
}

function getStageTiming() {
  const startedAt = new Date(reviewState?.stageState?.startedAt || reviewState?.startedAt || '').getTime();
  const lastEventAt = new Date(reviewState?.stageState?.lastEventAt || reviewState?.stageState?.startedAt || '').getTime();
  return {
    elapsedMs: Number.isNaN(startedAt) ? 0 : Math.max(0, Date.now() - startedAt),
    idleMs: Number.isNaN(lastEventAt) ? 0 : Math.max(0, Date.now() - lastEventAt)
  };
}

function buildStuckMessage() {
  const stageState = reviewState?.stageState || {};
  const currentLabel = getStageLabel(stageState.currentStep);
  const { elapsedMs, idleMs } = getStageTiming();
  const stallLimit = STALL_LIMITS_MS[stageState.currentStep] ?? 30000;
  const lastUpdate = String(stageState.summary || 'No progress update arrived before the flow stalled.')
    .replace(/[.\s]+$/, '');

  return `Preparation stalled during ${currentLabel} after ${formatDuration(elapsedMs)}. No new stage events arrived for ${formatDuration(idleMs)} even though the wait limit is ${formatDuration(stallLimit)}, so the flow could not move forward. Last successful update: ${lastUpdate}. Retry will restart the flow from the beginning.`;
}

function getRouteIssueMessage() {
  const stageState = reviewState?.stageState || {};
  if (stageState.status === 'stuck') return stageState.error || buildStuckMessage();
  if (stageState.status === 'error') return stageState.error || stageState.summary || 'Preparation failed.';
  return stageState.error || '';
}

function normalizeStreamPayload(data) {
  if (data == null) return '';
  if (typeof data === 'string') return data;
  if (typeof data !== 'object') return String(data);
  try {
    return JSON.stringify(data);
  } catch {
    return '[unserializable payload]';
  }
}

function summarizeStreamEvent(eventType, data) {
  switch (eventType) {
    case 'stage':
      return {
        label: `stage · ${data?.step || 'unknown'} · ${data?.status || 'unknown'}`,
        copy: data?.summary || normalizeStreamPayload(data)
      };
    case 'search':
      return {
        label: `search · ${data?.status || 'unknown'}`,
        copy: data?.query ? `Query: ${data.query}` : normalizeStreamPayload(data)
      };
    case 'heartbeat':
      return {
        label: `heartbeat · ${data?.step || 'unknown'}`,
        copy: data?.summary ? `${data.summary} · ${formatClock(data.at)}` : normalizeStreamPayload(data)
      };
    case 'text_delta':
      return {
        label: 'text_delta',
        copy: String(data?.delta || '').trim() || '[empty delta]'
      };
    case 'draft':
      return {
        label: 'draft',
        copy: `Draft received for ${data?.draft?.companyName || reviewState?.company || 'company'}`
      };
    case 'error':
      return {
        label: 'error',
        copy: data?.message || normalizeStreamPayload(data)
      };
    default:
      return {
        label: eventType || 'event',
        copy: normalizeStreamPayload(data)
      };
  }
}

function appendStreamLog(eventType, data) {
  if (!reviewState) return;
  if (!Array.isArray(reviewState.streamLog)) {
    reviewState.streamLog = [];
  }
  const { label, copy } = summarizeStreamEvent(eventType, data);
  reviewState.streamLog.push({
    id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    at: new Date().toISOString(),
    label,
    copy
  });
  if (reviewState.streamLog.length > MAX_STREAM_LOG_ITEMS) {
    reviewState.streamLog = reviewState.streamLog.slice(-MAX_STREAM_LOG_ITEMS);
  }
  persistState();
}

function renderStreamLog() {
  if (!routeStreamLog) return;
  const items = Array.isArray(reviewState?.streamLog) ? reviewState.streamLog : [];
  if (!items.length) {
    routeStreamLog.innerHTML = '<div class="agent-stream-empty">Waiting for events...</div>';
    return;
  }
  routeStreamLog.innerHTML = items.map((item) => `
    <div class="agent-stream-row">
      <div class="agent-stream-row-head">
        <span class="agent-stream-label">${escapeHtml(item.label || 'event')}</span>
        <span class="agent-stream-time">${escapeHtml(formatClock(item.at) || '')}</span>
      </div>
      <div class="agent-stream-copy-text">${escapeHtml(item.copy || '')}</div>
    </div>
  `).join('');
  routeStreamLog.scrollTop = routeStreamLog.scrollHeight;
}

function setError(message = '') {
  if (!routeError) return;
  routeError.hidden = !message;
  routeError.textContent = message;
}

function touchStageActivity() {
  if (!reviewState?.stageState) return;
  reviewState.stageState.lastEventAt = new Date().toISOString();
  persistState();
}

function readState() {
  const storages = [window.sessionStorage, window.localStorage];
  for (const storage of storages) {
    try {
      const raw = storage.getItem(REVIEW_STATE_KEY);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed;
    } catch {
      try {
        storage.removeItem(REVIEW_STATE_KEY);
      } catch {
        // Ignore storage cleanup failures.
      }
    }
  }
  return null;
}

function hydrateStateFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const company = params.get('company') || '';
  if (!company) return null;
  return {
    entryId: Number(params.get('entryId') || 0) || null,
    company,
    location: params.get('location') || '',
    notes: params.get('notes') || '',
    website: params.get('website') || '',
    startedAt: new Date().toISOString(),
    stageState: {
      status: 'queued',
      currentStep: 'queued',
      timeline: []
    }
  };
}

function normalizeReviewState(state) {
  if (!state || typeof state !== 'object') return null;
  const normalized = {
    ...state,
    entryId: Number(state.entryId || 0) || null,
    company: String(state.company || '').trim(),
    location: String(state.location || ''),
    notes: String(state.notes || ''),
    website: String(state.website || ''),
    startedAt: state.startedAt || new Date().toISOString(),
    stageState: {
      ...(state.stageState && typeof state.stageState === 'object' ? state.stageState : {}),
      timeline: Array.isArray(state?.stageState?.timeline) ? state.stageState.timeline : []
    }
  };

  if (!normalized.stageState.status) {
    normalized.stageState.status = normalized.draft ? 'ready' : 'queued';
  }
  if (!normalized.stageState.currentStep) {
    normalized.stageState.currentStep = normalized.draft ? 'ready' : 'queued';
  }
  if (!normalized.stageState.startedAt) {
    normalized.stageState.startedAt = normalized.startedAt;
  }

  if (normalized.draft && typeof normalized.draft === 'object') {
    normalized.draft = {
      ...normalized.draft,
      companyName: normalized.draft.companyName || normalized.company,
      cc: String(normalized.draft.cc || ''),
      subject: String(normalized.draft.subject || ''),
      body: String(normalized.draft.body || '')
    };
    if (!normalized.draft.recommendedAttachments || typeof normalized.draft.recommendedAttachments !== 'object') {
      normalized.draft.recommendedAttachments = {
        resume: true,
        transcript: false,
        portfolioLink: false,
        combinationLabel: '',
        rationale: ''
      };
    }
  }

  if (!Array.isArray(normalized.streamLog)) {
    normalized.streamLog = [];
  }

  return normalized;
}

function mergeQueryState(baseState) {
  const params = new URLSearchParams(window.location.search);
  const company = params.get('company') || '';
  if (!company) return baseState;

  const nextState = baseState && typeof baseState === 'object' ? { ...baseState } : {};
  const queryEntryId = Number(params.get('entryId') || 0) || null;
  const storedCompany = String(nextState.company || '');
  const storedEntryId = Number(nextState.entryId || 0) || null;
  const companyChanged = storedCompany && storedCompany !== company;
  const entryChanged = Boolean(queryEntryId && (!storedEntryId || storedEntryId !== queryEntryId));

  nextState.entryId = companyChanged || entryChanged ? queryEntryId : (queryEntryId ?? nextState.entryId ?? null);
  nextState.company = company;
  nextState.location = params.get('location') || nextState.location || '';
  nextState.notes = params.get('notes') || nextState.notes || '';
  nextState.website = params.get('website') || nextState.website || '';

  if (companyChanged || entryChanged || !nextState.draft) {
    nextState.draft = null;
    nextState.researchedDraft = null;
    nextState.assets = null;
    nextState.profileContext = {};
    nextState.sources = [];
    nextState.smtpConfigured = false;
    nextState.searchFeed = [];
    nextState.streamLog = [];
    nextState.stageState = {
      status: 'queued',
      currentStep: 'queued',
      timeline: [],
      summary: ''
    };
    nextState.startedAt = new Date().toISOString();
  }

  return nextState;
}

function saveStateTo(storage) {
  if (!storage) return;
  try {
    if (!reviewState) {
      storage.removeItem(REVIEW_STATE_KEY);
      return;
    }
    storage.setItem(REVIEW_STATE_KEY, JSON.stringify(reviewState));
  } catch {
    // Keep going if storage is unavailable.
  }
}

function clearPersistedState() {
  [window.sessionStorage, window.localStorage].forEach((storage) => {
    try {
      storage.removeItem(REVIEW_STATE_KEY);
    } catch {
      // Ignore storage cleanup failures.
    }
  });
}

function persistState() {
  saveStateTo(window.sessionStorage);
  saveStateTo(window.localStorage);
}

function ensureStageState() {
  if (!reviewState) return;
  if (!reviewState.stageState || typeof reviewState.stageState !== 'object') {
    reviewState.stageState = {};
  }
  if (!Array.isArray(reviewState.stageState.timeline)) {
    reviewState.stageState.timeline = [];
  }
  if (!reviewState.stageState.status) {
    reviewState.stageState.status = reviewState.draft ? 'ready' : 'idle';
  }
  if (!reviewState.stageState.currentStep) {
    reviewState.stageState.currentStep = reviewState.draft ? 'ready' : 'queued';
  }
  if (!reviewState.stageState.startedAt) {
    reviewState.stageState.startedAt = reviewState.startedAt || new Date().toISOString();
  }
}

function appendTimeline(title, copy, type = 'info') {
  if (!reviewState) return;
  ensureStageState();
  reviewState.stageState.timeline.push({
    id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    title,
    copy,
    type,
    at: new Date().toISOString()
  });
  persistState();
}

function setStage(stepKey, status, summary, options = {}) {
  if (!reviewState) return;
  ensureStageState();
  reviewState.stageState.currentStep = stepKey;
  reviewState.stageState.status = status;
  reviewState.stageState.summary = summary || reviewState.stageState.summary || '';
  reviewState.stageState.lastEventAt = new Date().toISOString();
  if (options.error) reviewState.stageState.error = options.error;
  if (options.clearError) delete reviewState.stageState.error;
  persistState();
}

function stageStatusFor(stepKey) {
  ensureStageState();
  const order = PREP_STAGES.map((item) => item.key);
  const currentIndex = order.indexOf(reviewState?.stageState?.currentStep);
  const stepIndex = order.indexOf(stepKey);
  const currentStatus = reviewState?.stageState?.status;

  if (currentStatus === 'error' && reviewState.stageState.currentStep === stepKey) return 'error';
  if (currentStatus === 'stuck' && reviewState.stageState.currentStep === stepKey) return 'stuck';
  if (currentStatus === 'ready' && stepKey === 'ready') return 'done';
  if (stepIndex < currentIndex) return 'done';
  if (stepIndex === currentIndex && ['queued', 'running'].includes(currentStatus)) return 'running';
  if (stepIndex === currentIndex && currentStatus === 'ready') return 'done';
  return 'pending';
}

function renderStageList() {
  if (!routeStageList || !reviewState) return;
  routeStageList.innerHTML = PREP_STAGES.map((stage) => {
    const status = stageStatusFor(stage.key);
    return `
      <div class="agent-stage-row" data-status="${escapeHtml(status)}">
        <span class="agent-stage-dot" aria-hidden="true"></span>
        <div class="agent-stage-title">${escapeHtml(stage.label)}</div>
        <div class="agent-stage-meta">${status === 'running' ? '●' : status === 'done' ? '✓' : ''}</div>
      </div>
    `;
  }).join('');

  // Update horizontal stepper
  const stepperEl = document.getElementById('agentStepper');
  if (!stepperEl) return;
  const parts = [];
  PREP_STAGES.forEach((stage, i) => {
    const status = stageStatusFor(stage.key);
    parts.push(`<div class="agent-stepper-step" data-status="${escapeHtml(status)}"><span class="agent-stepper-dot"></span><span class="agent-stepper-label">${escapeHtml(stage.label)}</span></div>`);
    if (i < PREP_STAGES.length - 1) parts.push('<div class="agent-stepper-line"></div>');
  });
  stepperEl.innerHTML = parts.join('');
}

function renderTimeline() {
  // Timeline UI removed — events still tracked in reviewState for persistence
}

function refreshElapsedLabel() {
  if (!routeStageElapsed || !reviewState?.stageState?.startedAt) return;
  const startedAt = new Date(reviewState.stageState.startedAt).getTime();
  if (Number.isNaN(startedAt)) {
    routeStageElapsed.textContent = 'Waiting to start';
    return;
  }
  const currentLabel = PREP_STAGES.find((item) => item.key === reviewState.stageState.currentStep)?.label || 'Preparing';
  const elapsed = Date.now() - startedAt;
  const status = reviewState.stageState.status;
  const lastEventAt = new Date(reviewState.stageState.lastEventAt || reviewState.stageState.startedAt).getTime();
  const staleFor = Date.now() - lastEventAt;

  if (status === 'error') {
    routeStageElapsed.textContent = `Stopped at ${currentLabel}`;
    return;
  }
  if (status === 'stuck') {
    routeStageElapsed.textContent = `Stalled at ${currentLabel} · ${formatDuration(elapsed)}`;
    return;
  }
  if (status === 'ready') {
    const completedAt = new Date(reviewState.stageState.lastEventAt || reviewState.stageState.startedAt).getTime();
    const completedElapsed = Number.isNaN(completedAt) ? elapsed : Math.max(0, completedAt - startedAt);
    routeStageElapsed.textContent = `Completed in ${formatDuration(completedElapsed)}`;
    return;
  }
  const stallLimit = STALL_LIMITS_MS[reviewState.stageState.currentStep] ?? 30000;
  if (status === 'running' && Number.isFinite(stallLimit) && staleFor > stallLimit) {
    reviewState.stageState.status = 'stuck';
    reviewState.stageState.error = buildStuckMessage();
    reviewState.stageState.lastEventAt = new Date().toISOString();
    appendTimeline('Preparation stalled', reviewState.stageState.error, 'error');
    persistState();
    renderState();
    routeStageElapsed.textContent = `Still on ${currentLabel} after ${formatDuration(elapsed)}`;
    return;
  }
  routeStageElapsed.textContent = `${currentLabel} · ${formatDuration(elapsed)}`;
}

function startElapsedTicker() {
  window.clearInterval(elapsedTimer);
  refreshElapsedLabel();
  elapsedTimer = window.setInterval(refreshElapsedLabel, 1000);
}

function stopElapsedTicker() {
  window.clearInterval(elapsedTimer);
  elapsedTimer = null;
}

function getStoredApiKey() {
  try {
    return localStorage.getItem(API_KEY_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

function updateToneButtons(activeTone) {
  routeToneGrid?.querySelectorAll('[data-tone-preset]').forEach((button) => {
    button.classList.toggle('active', button.getAttribute('data-tone-preset') === activeTone);
  });
}

function buildListMarkup(items, emptyText) {
  const normalized = Array.isArray(items) ? items.filter(Boolean) : [];
  return normalized.length
    ? normalized.map((item) => `<li>${escapeHtml(item)}</li>`).join('')
    : `<li>${escapeHtml(emptyText)}</li>`;
}

function renderAssetList() {
  if (!routeAssetList || !reviewState) return;
  const assets = reviewState.assets || {};
  const rows = [
    { label: 'Resume', item: assets.resume, checked: routeIncludeResume?.checked !== false },
    { label: 'Transcript', item: assets.transcript, checked: Boolean(routeIncludeTranscript?.checked) },
    {
      label: 'Portfolio',
      item: {
        exists: Boolean(reviewState?.profileContext?.portfolioUrl),
        name: reviewState?.profileContext?.portfolioUrl || '',
        error: 'Missing portfolio URL'
      },
      checked: Boolean(routeIncludePortfolioLink?.checked)
    }
  ];

  routeAssetList.innerHTML = rows.map((row) => {
    const status = row.item?.exists ? (row.checked ? 'Included' : 'Ready') : row.item?.error || 'Missing';
    const tone = row.item?.exists ? 'ok' : 'warn';
    return `
      <div class="agent-asset-row ${tone}">
        <span>${escapeHtml(row.label)}</span>
        <span>${escapeHtml(row.item?.name || row.item?.path || status)}</span>
        <span>${escapeHtml(status)}</span>
      </div>
    `;
  }).join('');
}

function updateSafetyUi() {
  if (!routeSafetyNote || !reviewState) return;
  const safety = reviewState?.draft?.safety || { allowDirectSend: false, reasons: [] };
  const reasons = Array.isArray(safety.reasons) ? safety.reasons.filter(Boolean) : [];
  if (safety.allowDirectSend) {
    routeSafetyNote.textContent = reviewState.smtpConfigured
      ? 'Direct send is available. Safety checks and SMTP are both ready.'
      : 'Direct send looks safe, but SMTP is off. Use the Gmail draft flow.';
  } else {
    routeSafetyNote.textContent = `Direct send locked: ${reasons.join(' | ') || 'Human-reviewed draft required.'}`;
  }
}

function syncActionUi() {
  if (!reviewState) return;
  const allowDirectSend = Boolean(reviewState?.draft?.safety?.allowDirectSend) && Boolean(reviewState?.smtpConfigured);
  if (routeSendBtn) routeSendBtn.hidden = !allowDirectSend;
  if (routeManualAttachmentNote) routeManualAttachmentNote.hidden = false;
}

function renderState() {
  ensureStageState();
  const hasContext = Boolean(reviewState?.company || reviewState?.draft);
  const hasDraft = Boolean(reviewState?.draft);
  const issueMessage = getRouteIssueMessage();
  if (routeForm) routeForm.hidden = !hasDraft;
  if (routeComposePlaceholder) routeComposePlaceholder.hidden = hasDraft || !hasContext;
  if (routeEmpty) routeEmpty.hidden = hasContext;
  setError(issueMessage);

  if (!hasContext) {
    if (routeEmptyCopy) routeEmptyCopy.innerHTML = 'Go back to the tracker, pick a company, and run <strong>Prepare Agent Mail</strong> again.';
    stopTimers();
    return;
  }

  if (routeFlowStatus) routeFlowStatus.textContent = hasDraft ? (reviewState.smtpConfigured ? 'Review and send' : 'Review and open') : 'Preparing draft';
  if (routeHeroTitle) {
    routeHeroTitle.textContent = hasDraft
      ? (reviewState.draft.companyName || reviewState.company)
      : (reviewState.company || 'Outreach review');
  }
  if (routeHeroSub) {
    routeHeroSub.textContent = hasDraft
      ? 'Edit the draft below, then open it in Gmail or send directly.'
      : 'Watching the agent research and write. Search queries appear below as they run.';
  }
  if (routeFlowSummary) {
    routeFlowSummary.textContent = reviewState?.stageState?.summary || 'Research, polish, then decide.';
  }

  if (routeRetryBtn) {
    routeRetryBtn.hidden = !['error', 'stuck'].includes(reviewState?.stageState?.status);
  }

  if (routeStageSummary) {
    routeStageSummary.textContent = issueMessage || reviewState?.stageState?.summary || 'The route will show real preparation stages here.';
  }
  if (routeStreamStatus) {
    routeStreamStatus.textContent = hasDraft ? 'Live / complete' : 'Live';
  }

  renderStageList();
  renderTimeline();
  renderStreamLog();
  startElapsedTicker();

  if (!hasDraft) {
    clearDraftUi();
    if (routeEmptyCopy) {
      routeEmptyCopy.innerHTML = `Preparing outreach for <strong>${escapeHtml(reviewState.company || 'this company')}</strong>. You can already see where the flow is, whether it is still moving, and if it fails, the exact error.`;
    }
    return;
  }

  const { draft, assets } = reviewState;
  document.title = `${draft.companyName || reviewState.company} Review`;

  if (routeTo) routeTo.value = draft.contactEmail || '';
  if (routeCc) routeCc.value = draft.cc || '';
  if (routeSubject) routeSubject.value = draft.subject || '';
  if (routeBody) routeBody.value = draft.body || '';
  if (routeAttachmentReason) routeAttachmentReason.textContent = draft.recommendedAttachments?.rationale || 'No attachment recommendation returned.';
  if (routeIncludeResume) routeIncludeResume.checked = draft.recommendedAttachments?.resume !== false && Boolean(assets?.resume?.exists);
  if (routeIncludeTranscript) routeIncludeTranscript.checked = Boolean(draft.recommendedAttachments?.transcript) && Boolean(assets?.transcript?.exists);
  if (routeIncludePortfolioLink) routeIncludePortfolioLink.checked = Boolean(draft.recommendedAttachments?.portfolioLink) && Boolean(reviewState?.profileContext?.portfolioUrl);
  if (routeToneStatus) routeToneStatus.textContent = `Active tone: ${draft.tonePreset || 'balanced'}`;

  updateToneButtons(draft.tonePreset || 'balanced');
  renderAssetList();
  updateSafetyUi();
  syncActionUi();
  renderStreamLog();
}

function scheduleDraftSync() {
  if (!reviewState?.draft) return;
  window.clearTimeout(draftSyncTimer);
  draftSyncTimer = window.setTimeout(() => {
    persistState();
  }, 120);
}

function syncDraftFieldsFromUi() {
  if (!reviewState?.draft) return;
  reviewState.draft = {
    ...reviewState.draft,
    contactEmail: routeTo?.value.trim() || '',
    cc: routeCc?.value.trim() || '',
    subject: routeSubject?.value || '',
    body: routeBody?.value || ''
  };
  persistState();
}

function syncAttachmentChoices() {
  if (!reviewState?.draft) return;
  reviewState.draft.recommendedAttachments = {
    ...(reviewState.draft.recommendedAttachments || {}),
    resume: Boolean(routeIncludeResume?.checked),
    transcript: Boolean(routeIncludeTranscript?.checked),
    portfolioLink: Boolean(routeIncludePortfolioLink?.checked)
  };
  persistState();
}

function clearDraftUi() {
  if (routeTo) routeTo.value = '';
  if (routeCc) routeCc.value = '';
  if (routeSubject) routeSubject.value = '';
  if (routeBody) routeBody.value = '';
  if (routeAttachmentReason) routeAttachmentReason.textContent = '-';
  if (routeAssetList) routeAssetList.innerHTML = '';
  if (routeIncludeResume) routeIncludeResume.checked = false;
  if (routeIncludeTranscript) routeIncludeTranscript.checked = false;
  if (routeIncludePortfolioLink) routeIncludePortfolioLink.checked = false;
  if (routeToneStatus) routeToneStatus.textContent = 'Balanced';
  if (routeSafetyNote) routeSafetyNote.textContent = '-';
  if (routeManualAttachmentNote) routeManualAttachmentNote.hidden = true;
  if (routeSendBtn) routeSendBtn.hidden = true;
  routeToneGrid?.querySelectorAll('[data-tone-preset]').forEach((button) => {
    button.classList.remove('active');
  });
}

function shouldAutoResume() {
  if (!reviewState?.company || reviewState?.draft) return false;
  const status = reviewState?.stageState?.status;
  return ['queued', 'running'].includes(status);
}

function startNewFlowRun() {
  if (!reviewState) return '';
  ensureStageState();
  activeFlowRunId = `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
  reviewState.stageState.runId = activeFlowRunId;
  reviewState.stageState.startedAt = new Date().toISOString();
  reviewState.stageState.lastEventAt = reviewState.stageState.startedAt;
  persistState();
  return activeFlowRunId;
}

function isCurrentFlowRun(runId) {
  return Boolean(runId && reviewState?.stageState?.runId === runId && activeFlowRunId === runId);
}

function stopTimers() {
  stopElapsedTicker();
  window.clearTimeout(draftSyncTimer);
  draftSyncTimer = null;
}

async function logAction(action, meta = {}) {
  if (!reviewState?.entryId) return;
  try {
    await fetch('/api/application-agent/log-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        internshipId: reviewState.entryId,
        action,
        meta
      })
    });
  } catch {
    // Non-blocking analytics signal.
  }
}

async function applyTonePreset(tonePreset) {
  if (!reviewState?.draft) return;
  const apiKey = getStoredApiKey();
  if (!apiKey) {
    setError('OpenAI API key is missing. Add it from the tracker before polishing again.');
    return;
  }

  if (routeToneStatus) routeToneStatus.textContent = 'Updating tone...';
  appendTimeline('Tone update started', `Requested ${tonePreset} tone for the current draft.`);
  updateToneButtons(tonePreset);

  try {
    const res = await fetch('/api/application-agent/polish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey,
        company: reviewState?.draft?.companyName || reviewState.company || '',
        draft: reviewState?.researchedDraft || reviewState?.draft,
        tonePreset,
        includePortfolioLink: Boolean(routeIncludePortfolioLink?.checked)
      })
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(payload?.error || 'Tone update failed.');

    reviewState.draft = {
      ...reviewState.draft,
      subject: payload.subject || reviewState.draft.subject,
      introLines: Array.isArray(payload.introLines) ? payload.introLines : reviewState.draft.introLines,
      bodyLines: Array.isArray(payload.bodyLines) ? payload.bodyLines : reviewState.draft.bodyLines,
      body: payload.body || reviewState.draft.body,
      warnings: Array.isArray(payload.warnings) ? payload.warnings : reviewState.draft.warnings,
      tonePreset: payload.tonePreset || tonePreset,
      signatureLines: Array.isArray(payload.signatureLines) ? payload.signatureLines : reviewState.draft.signatureLines
    };
    if (routeSubject) routeSubject.value = reviewState.draft.subject || '';
    if (routeBody) routeBody.value = reviewState.draft.body || '';
    appendTimeline('Tone updated', `The draft was repolished with the ${tonePreset} tone.`);
    persistState();
    renderState();
  } catch (error) {
    appendTimeline('Tone update failed', error instanceof Error ? error.message : 'Tone update failed.', 'error');
    setError(error instanceof Error ? error.message : 'Tone update failed.');
    if (routeToneStatus) routeToneStatus.textContent = 'Tone update failed.';
  }
}

async function markEntryApplied() {
  if (!reviewState?.entryId) return;
  const res = await fetch('/api/internships');
  const entries = await res.json().catch(() => []);
  const entry = Array.isArray(entries) ? entries.find((item) => Number(item.id) === Number(reviewState.entryId)) : null;
  if (!entry) return;

  await fetch(`/api/internships/${entry.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      company: entry.company || '',
      status: 'Applied',
      notes: entry.notes || '',
      website: entry.website || '',
      tag: entry.tag || '',
      priority: entry.priority || 'Medium',
      applied_at: entry.applied_at || new Date().toISOString().slice(0, 10),
      followup_at: entry.followup_at || '',
      reply_received_at: entry.reply_received_at || '',
      reply_outcome: entry.reply_outcome || '',
      focus_tags: entry.focus_tags || ''
    })
  });
}

function handleSearchEvent({ status, query }) {
  if (!reviewState) return;
  if (!Array.isArray(reviewState.searchFeed)) reviewState.searchFeed = [];
  if (query) {
    reviewState.searchFeed.push({ status, query });
  } else if (status === 'completed') {
    // Mark last searching chip as done
    const last = reviewState.searchFeed.findLast
      ? reviewState.searchFeed.findLast((c) => c.status === 'in_progress')
      : [...reviewState.searchFeed].reverse().find((c) => c.status === 'in_progress');
    if (last) last.status = 'completed';
  }
  renderSearchFeed();
}

function renderSearchFeed() {
  const feedEl = document.getElementById('agentSearchFeed');
  if (!feedEl || !reviewState) return;
  const chips = reviewState.searchFeed || [];
  if (!chips.length) {
    feedEl.innerHTML = '';
    return;
  }
  feedEl.innerHTML = chips.map((chip) => {
    const stateClass = chip.status === 'completed' ? 'is-done' : 'is-searching';
    return `
      <div class="agent-search-chip ${stateClass}">
        <span class="agent-search-chip-dot" aria-hidden="true"></span>
        <span>${escapeHtml(chip.query || 'Searching…')}</span>
      </div>
    `;
  }).join('');
}

async function runPreparationPipeline({ retry = false } = {}) {
  if (!reviewState?.company) return;
  const apiKey = getStoredApiKey();
  if (!apiKey) {
    setStage('queued', 'error', 'The route cannot start without an OpenAI API key.', { error: 'OpenAI API key is missing.' });
    appendTimeline('Preparation blocked', 'OpenAI API key is missing. Add it from the tracker and retry.', 'error');
    renderState();
    return;
  }

  const flowRunId = startNewFlowRun();

  if (retry) {
    reviewState.draft = null;
    reviewState.researchedDraft = null;
    reviewState.searchFeed = [];
    reviewState.streamLog = [];
    appendTimeline('Retry requested', `Restarting the preparation flow for ${reviewState.company}.`);
  } else if (reviewState.draft || reviewState.stageState?.status === 'running') {
    return;
  }

  ensureStageState();
  reviewState.stageState.startedAt = new Date().toISOString();
  reviewState.searchFeed = [];
  reviewState.streamLog = [];
  setStage('queued', 'queued', `Opening the workspace for ${reviewState.company}.`, { clearError: true });
  appendTimeline('Workspace ready', `Loaded ${reviewState.company} into the agent review route.`);
  renderState();

  // Add researching class to compose panel for animated gradient mesh
  const composeEl = document.querySelector('.agent-compose');
  if (composeEl) composeEl.classList.add('is-researching');

  try {
    setStage('research', 'running', `Researching ${reviewState.company} across public web sources.`, { clearError: true });
    appendTimeline('Research started', 'Looking for the best company signals, contact path, and credible public links.');
    renderState();

    const response = await fetch('/api/application-agent/stream-research', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey,
        company: reviewState.company || '',
        location: reviewState.location || '',
        notes: reviewState.notes || '',
        website: reviewState.website || ''
      })
    });

    if (!response.ok) {
      const errPayload = await response.json().catch(() => ({}));
      throw new Error(errPayload?.error || 'Streaming research failed.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    const processEvent = (eventType, data) => {
      if (!isCurrentFlowRun(flowRunId)) return;
      appendStreamLog(eventType, data);
      renderStreamLog();
      switch (eventType) {
        case 'stage': {
          const step = data.step || 'research';
          const status = data.status || 'running';
          const summary = data.summary || '';
          setStage(step, status, summary);
          if (step === 'research' && status === 'running') {
            appendTimeline('Research running', summary);
          } else if (step === 'shape' && status === 'running') {
            appendTimeline('Research finished', 'Structuring the raw research into a first-pass draft.');
          } else if (step === 'polish' && status === 'running') {
            appendTimeline('Polish started', 'Turning the researched structure into a readable final draft.');
          } else if (step === 'ready' && status === 'ready') {
            appendTimeline('Draft ready', 'The route finished research and polish successfully. You can review the draft now.');
          }
          renderState();
          break;
        }
        case 'search':
          handleSearchEvent({ status: data.status, query: data.query || '' });
          touchStageActivity();
          break;
        case 'heartbeat':
          touchStageActivity();
          if (data?.step && data?.summary && ['queued', 'running'].includes(data?.status || 'running')) {
            setStage(data.step, data.status || 'running', data.summary, { clearError: true });
            renderState();
          }
          break;
        case 'text_delta':
          // Accumulate silently — no UI needed for raw text
          touchStageActivity();
          break;
        case 'draft':
          reviewState.draft = data.draft || null;
          reviewState.sources = data.sources || [];
          reviewState.assets = data.assets || {};
          reviewState.smtpConfigured = Boolean(data.smtpConfigured);
          reviewState.profileContext = data.profileContext || {};
          touchStageActivity();
          persistState();
          if (composeEl) composeEl.classList.remove('is-researching');
          renderSearchFeed();
          renderState();
          break;
        case 'error':
          throw new Error(data.message || 'Streaming preparation failed.');
        default:
          break;
      }
    };

    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (!isCurrentFlowRun(flowRunId)) break;
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split('\n\n');
      buffer = parts.pop() ?? '';
      for (const part of parts) {
        const trimmed = part.trim();
        if (!trimmed) continue;
        const eventLineMatch = trimmed.match(/^event:\s*(.+)$/m);
        const dataLineMatch = trimmed.match(/^data:\s*(.+)$/m);
        if (!dataLineMatch) continue;
        let data;
        try {
          data = JSON.parse(dataLineMatch[1].trim());
        } catch {
          continue;
        }
        const eventType = eventLineMatch ? eventLineMatch[1].trim() : (data?.type || 'unknown');
        processEvent(eventType, data);
      }
    }

    // Handle any remaining buffer
    if (buffer.trim()) {
      const trimmed = buffer.trim();
      const eventLineMatch = trimmed.match(/^event:\s*(.+)$/m);
      const dataLineMatch = trimmed.match(/^data:\s*(.+)$/m);
      if (dataLineMatch) {
        try {
          const data = JSON.parse(dataLineMatch[1].trim());
          const eventType = eventLineMatch ? eventLineMatch[1].trim() : (data?.type || 'unknown');
          processEvent(eventType, data);
        } catch { /* ignore */ }
      }
    }

  } catch (error) {
    if (composeEl) composeEl.classList.remove('is-researching');
    if (!isCurrentFlowRun(flowRunId)) return;
    const message = error instanceof Error ? error.message : 'Preparation failed.';
    setStage(reviewState?.stageState?.currentStep || 'queued', 'error', message, { error: message });
    appendTimeline('Preparation failed', message, 'error');
    setError(message);
    renderState();
  }
}

async function openInGmail() {
  if (!reviewState?.draft) return;
  const to = routeTo?.value.trim() || '';
  const cc = routeCc?.value.trim() || '';
  const subject = routeSubject?.value.trim() || '';
  const body = routeBody?.value || '';

  if (!to || !subject || !body.trim()) {
    setError('Recipient, subject, and body must be filled before opening Gmail.');
    return;
  }

  reviewState.draft.subject = subject;
  reviewState.draft.body = body;
  reviewState.draft.cc = cc;
  persistState();
  setError('');

  // Open synchronously before any await — popup blockers fire after async work
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${escapeMailtoValue(to)}&su=${escapeMailtoValue(subject)}&body=${escapeMailtoValue(body)}${cc ? `&cc=${escapeMailtoValue(cc)}` : ''}`;
  const gmailWin = window.open(gmailUrl, '_blank');
  if (!gmailWin) window.location.href = gmailUrl;

  appendTimeline('Gmail draft opened', 'Opened the prepared email in Gmail compose.');
  await logAction('draft-opened', {
    to,
    subject,
    tonePreset: reviewState?.draft?.tonePreset || 'balanced',
    attachmentCombo: [
      routeIncludeResume?.checked ? 'Resume' : null,
      routeIncludeTranscript?.checked ? 'Transcript' : null,
      routeIncludePortfolioLink?.checked ? 'Portfolio link' : null
    ].filter(Boolean).join(' + ') || 'None'
  });
}

async function sendDirectly() {
  if (!reviewState?.draft) return;
  const to = routeTo?.value.trim() || '';
  const cc = routeCc?.value.trim() || '';
  const subject = routeSubject?.value.trim() || '';
  const body = routeBody?.value || '';
  const safety = reviewState?.draft?.safety || { allowDirectSend: false, reasons: [] };

  if (!to || !subject || !body.trim()) {
    setError('Recipient, subject, and body must be filled before sending.');
    return;
  }

  if (!safety.allowDirectSend) {
    await logAction('send-blocked', { reasons: safety.reasons || [], confidence: reviewState?.draft?.confidence || 'low' });
    setError(`Direct send locked: ${(safety.reasons || []).join(' | ') || 'Human-reviewed draft required.'}`);
    return;
  }

  reviewState.draft.subject = subject;
  reviewState.draft.body = body;
  reviewState.draft.cc = cc;
  persistState();
  setError('');

  if (routeSendBtn) { routeSendBtn.disabled = true; routeSendBtn.textContent = 'Sending...'; }

  try {
    const res = await fetch('/api/application-agent/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        internshipId: reviewState.entryId,
        to, cc, subject, body,
        includeResume: Boolean(routeIncludeResume?.checked),
        includeTranscript: Boolean(routeIncludeTranscript?.checked),
        includePortfolioLink: Boolean(routeIncludePortfolioLink?.checked),
        confidence: reviewState?.draft?.confidence || 'low',
        warnings: reviewState?.draft?.warnings || [],
        tonePreset: reviewState?.draft?.tonePreset || 'balanced',
        hookType: reviewState?.draft?.hookType || 'general'
      })
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(payload?.error || 'Send failed.');

    appendTimeline('Mail sent', `Direct send completed. Message ID: ${payload.messageId || 'n/a'}.`);
    await markEntryApplied();
    clearPersistedState();
    stopTimers();
    reviewState = null;
    activeFlowRunId = '';
    window.alert(`Message sent. Message ID: ${payload.messageId || 'n/a'}`);
    window.location.href = '/';
  } catch (error) {
    appendTimeline('Send failed', error instanceof Error ? error.message : 'Send failed.', 'error');
    setError(error instanceof Error ? error.message : 'Send failed.');
  } finally {
    if (routeSendBtn) { routeSendBtn.disabled = false; routeSendBtn.textContent = 'Send directly'; }
  }
}

function initTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  document.documentElement.setAttribute('data-theme', savedTheme === 'light' ? 'light' : 'dark');
}

function bindEvents() {
  routeCancel?.addEventListener('click', () => {
    clearPersistedState();
    stopTimers();
    reviewState = null;
    activeFlowRunId = '';
    window.location.href = '/';
  });
  routeGmailBtn?.addEventListener('click', openInGmail);
  routeSendBtn?.addEventListener('click', sendDirectly);
  routeToneGrid?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-tone-preset]');
    if (!button) return;
    applyTonePreset(button.getAttribute('data-tone-preset') || 'balanced');
  });
  [routeIncludeResume, routeIncludeTranscript, routeIncludePortfolioLink].forEach((input) => {
    input?.addEventListener('change', () => {
      renderAssetList();
      syncActionUi();
      syncAttachmentChoices();
    });
  });
  [routeTo, routeCc, routeSubject, routeBody].forEach((input) => {
    input?.addEventListener('input', () => {
      syncDraftFieldsFromUi();
      scheduleDraftSync();
    });
    input?.addEventListener('change', syncDraftFieldsFromUi);
  });
  routeRetryBtn?.addEventListener('click', () => {
    runPreparationPipeline({ retry: true });
  });
  window.addEventListener('beforeunload', persistState);
  window.addEventListener('pagehide', persistState);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') persistState();
  });
}

function boot() {
  initTheme();
  reviewState = normalizeReviewState(mergeQueryState(readState() || hydrateStateFromQuery()));
  if (reviewState) persistState();
  bindEvents();
  renderState();
  if (shouldAutoResume()) {
    runPreparationPipeline({
      retry: reviewState?.stageState?.status === 'running'
    });
  }
  window.requestAnimationFrame(() => {
    document.body.classList.add('is-ready');
  });
}

boot();
