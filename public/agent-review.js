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

const routeForm = document.getElementById('agentRouteForm');
const routeComposePlaceholder = document.getElementById('agentComposePlaceholder');
const routeEmpty = document.getElementById('agentRouteEmpty');
const routeError = document.getElementById('agentRouteError');
const routeSubmit = document.getElementById('agentRouteSubmit');
const routeCancel = document.getElementById('agentRouteCancel');
const routeTo = document.getElementById('agentRouteTo');
const routeCc = document.getElementById('agentRouteCc');
const routeSubject = document.getElementById('agentRouteSubject');
const routeBody = document.getElementById('agentRouteBody');
const routeFlowStatus = document.getElementById('agentFlowStatus');
const routeHeroTitle = document.getElementById('agentHeroTitle');
const routeHeroSub = document.getElementById('agentHeroSub');
const routeFlowSummary = document.getElementById('agentFlowSummary');
const routeAttachmentReason = document.getElementById('agentRouteAttachmentReason');
const routeAssetList = document.getElementById('agentRouteAssetList');
const routeIncludeResume = document.getElementById('agentRouteIncludeResume');
const routeIncludeTranscript = document.getElementById('agentRouteIncludeTranscript');
const routeIncludePortfolioLink = document.getElementById('agentRouteIncludePortfolioLink');
const routeToneGrid = document.getElementById('agentRouteToneGrid');
const routeToneStatus = document.getElementById('agentRouteToneStatus');
const routeSafetyNote = document.getElementById('agentRouteSafetyNote');
const routeSignals = document.getElementById('agentRouteSignals');
const routeAngles = document.getElementById('agentRouteAngles');
const routeWarnings = document.getElementById('agentRouteWarnings');
const routeSources = document.getElementById('agentRouteSources');
const routeManualAttachmentNote = document.getElementById('agentManualAttachmentNote');
const routeDecisionHint = document.getElementById('agentDecisionHint');
const routeSendLabel = document.getElementById('agentRouteSendLabel');
const routeDraftLabel = document.getElementById('agentRouteDraftLabel');
const routeCancelLabel = document.getElementById('agentRouteCancelLabel');
const routeStageList = document.getElementById('agentStageList');
const routeStageSummary = document.getElementById('agentStageSummary');
const routeStageElapsed = document.getElementById('agentStageElapsed');
const routeTimeline = document.getElementById('agentTimeline');
const routeLogStatus = document.getElementById('agentLogStatus');
const routeRetryBtn = document.getElementById('agentRetryBtn');
const routeEmptyCopy = document.getElementById('agentEmptyCopy');

let reviewState = null;
let elapsedTimer = null;

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

function setError(message = '') {
  if (!routeError) return;
  routeError.hidden = !message;
  routeError.textContent = message;
}

function readState() {
  try {
    const raw = sessionStorage.getItem(REVIEW_STATE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
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

function persistState() {
  try {
    if (!reviewState) {
      sessionStorage.removeItem(REVIEW_STATE_KEY);
      return;
    }
    sessionStorage.setItem(REVIEW_STATE_KEY, JSON.stringify(reviewState));
  } catch {
    // Ignore storage failures and keep going.
  }
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
        <div>
          <div class="agent-stage-title">${escapeHtml(stage.label)}</div>
          <div class="agent-stage-copy">${escapeHtml(stage.copy)}</div>
        </div>
        <div class="agent-stage-meta">${escapeHtml(status)}</div>
      </div>
    `;
  }).join('');
}

function renderTimeline() {
  if (!routeTimeline || !routeLogStatus || !reviewState) return;
  ensureStageState();
  const timeline = reviewState.stageState.timeline || [];
  routeLogStatus.textContent = timeline.length ? `${timeline.length} events` : 'No events yet';
  routeTimeline.innerHTML = timeline.length
    ? timeline.slice().reverse().map((item) => `
        <div class="agent-timeline-row">
          <div class="agent-timeline-time">${escapeHtml(formatClock(item.at))}</div>
          <div class="agent-timeline-title">${escapeHtml(item.title)}</div>
          <div class="agent-timeline-copy">${escapeHtml(item.copy || '')}</div>
        </div>
      `).join('')
    : '<div class="muted">Preparation events will appear here in real time.</div>';
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
  if (status === 'ready') {
    routeStageElapsed.textContent = `Completed in ${formatDuration(elapsed)}`;
    return;
  }
  if (staleFor > 20000 && status === 'running') {
    reviewState.stageState.status = 'stuck';
    persistState();
    renderStageList();
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

function selectedAction() {
  const input = document.querySelector('input[name="agentRouteAction"]:checked');
  return input?.value || 'draft';
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
  const sendInput = document.querySelector('input[name="agentRouteAction"][value="send"]');
  const draftInput = document.querySelector('input[name="agentRouteAction"][value="draft"]');
  const allowDirectSend = Boolean(reviewState?.draft?.safety?.allowDirectSend) && Boolean(reviewState?.smtpConfigured);

  if (sendInput) sendInput.disabled = !allowDirectSend;
  if (!allowDirectSend && draftInput) draftInput.checked = true;

  if (routeManualAttachmentNote) {
    routeManualAttachmentNote.hidden = selectedAction() !== 'draft';
  }
  if (routeDecisionHint) {
    routeDecisionHint.textContent = allowDirectSend
      ? 'Send directly with SMTP or open in Gmail compose.'
      : 'Direct send is unavailable — open in Gmail compose to send from there.';
  }
}

function renderState() {
  ensureStageState();
  const hasContext = Boolean(reviewState?.company || reviewState?.draft);
  const hasDraft = Boolean(reviewState?.draft);
  if (routeForm) routeForm.hidden = !hasDraft;
  if (routeComposePlaceholder) routeComposePlaceholder.hidden = hasDraft || !hasContext;
  if (routeEmpty) routeEmpty.hidden = hasContext;
  setError(reviewState?.stageState?.error || '');

  if (!hasContext) {
    if (routeEmptyCopy) routeEmptyCopy.innerHTML = 'Go back to the tracker, pick a company, and run <strong>Prepare Agent Mail</strong> again.';
    stopElapsedTicker();
    return;
  }

  if (routeFlowStatus) routeFlowStatus.textContent = hasDraft ? (reviewState.smtpConfigured ? 'Review and send' : 'Review and open') : 'Preparing draft';
  if (routeHeroTitle) {
    routeHeroTitle.textContent = hasDraft
      ? `Review the outreach draft for ${reviewState.draft.companyName || reviewState.company}.`
      : `Preparing outreach for ${reviewState.company || 'this company'}.`;
  }
  if (routeHeroSub) {
    routeHeroSub.textContent = hasDraft
      ? 'Everything is laid out in one calm workspace so you can refine the email before it reaches the company.'
      : 'You can watch the real preparation steps here while research and copy generation are still running.';
  }
  if (routeFlowSummary) {
    routeFlowSummary.textContent = reviewState?.stageState?.summary || 'Research, polish, then decide.';
  }

  if (routeRetryBtn) {
    routeRetryBtn.hidden = !['error', 'stuck'].includes(reviewState?.stageState?.status);
  }

  if (routeStageSummary) {
    routeStageSummary.textContent = reviewState?.stageState?.summary || 'The route will show real preparation stages here.';
  }

  renderStageList();
  renderTimeline();
  startElapsedTicker();

  if (!hasDraft) {
    if (routeEmptyCopy) {
      routeEmptyCopy.innerHTML = `Preparing outreach for <strong>${escapeHtml(reviewState.company || 'this company')}</strong>. You can already see where the flow is, whether it is still moving, and if it fails, the exact error.`;
    }
    return;
  }

  const { draft, sources, assets } = reviewState;
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
  if (routeSendLabel) routeSendLabel.textContent = `Send to ${draft.companyName || reviewState.company} now`;
  if (routeDraftLabel) routeDraftLabel.textContent = `Open ${draft.companyName || reviewState.company} in Gmail`;
  if (routeCancelLabel) routeCancelLabel.textContent = `Pause outreach to ${draft.companyName || reviewState.company}`;
  if (routeSignals) routeSignals.innerHTML = buildListMarkup(draft.companySignals, 'No company signal captured.');
  if (routeAngles) routeAngles.innerHTML = buildListMarkup(draft.personalAngles, 'No personal angle captured.');
  if (routeWarnings) routeWarnings.innerHTML = buildListMarkup(draft.warnings, 'No warnings.');
  if (routeSources) {
    routeSources.innerHTML = (sources || []).length
      ? sources.map((source) => `
          <a class="analysis-source" href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer noopener">
            <span class="analysis-source-title">${escapeHtml(source.title || source.url)}</span>
            <span class="analysis-source-meta">${escapeHtml(source.page_age || '')}</span>
          </a>
        `).join('')
      : '<div class="muted">No sources returned.</div>';
  }

  updateToneButtons(draft.tonePreset || 'balanced');
  renderAssetList();
  updateSafetyUi();
  syncActionUi();
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

async function runPreparationPipeline({ retry = false } = {}) {
  if (!reviewState?.company) return;
  const apiKey = getStoredApiKey();
  if (!apiKey) {
    setStage('queued', 'error', 'The route cannot start without an OpenAI API key.', { error: 'OpenAI API key is missing.' });
    appendTimeline('Preparation blocked', 'OpenAI API key is missing. Add it from the tracker and retry.', 'error');
    renderState();
    return;
  }

  if (retry) {
    reviewState.draft = null;
    reviewState.researchedDraft = null;
    appendTimeline('Retry requested', `Restarting the preparation flow for ${reviewState.company}.`);
  } else if (reviewState.draft || reviewState.stageState?.status === 'running') {
    return;
  }

  ensureStageState();
  reviewState.stageState.startedAt = new Date().toISOString();
  setStage('queued', 'queued', `Opening the workspace for ${reviewState.company}.`, { clearError: true });
  appendTimeline('Workspace ready', `Loaded ${reviewState.company} into the agent review route.`);
  renderState();

  try {
    setStage('research', 'running', `Researching ${reviewState.company} across public web sources.`, { clearError: true });
    appendTimeline('Research started', 'Looking for the best company signals, contact path, and credible public links.');
    renderState();

    const researchRes = await fetch('/api/application-agent/research', {
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
    const researchPayload = await researchRes.json().catch(() => ({}));
    if (!researchRes.ok) throw new Error(researchPayload?.error || 'Research failed.');

    reviewState.researchedDraft = researchPayload.draft || {};
    reviewState.assets = researchPayload.assets || {};
    reviewState.recommendedAttachments = researchPayload.recommendedAttachments || {};
    reviewState.smtpConfigured = Boolean(researchPayload.smtpConfigured);
    reviewState.sources = researchPayload.sources || [];
    reviewState.profileContext = researchPayload.profileContext || {};
    reviewState.meta = {
      companyName: researchPayload.companyName || reviewState.company,
      companyWebsite: researchPayload.companyWebsite || reviewState.website || '',
      careersUrl: researchPayload.careersUrl || '',
      contactEmail: researchPayload.contactEmail || '',
      contactReason: researchPayload.contactReason || '',
      confidence: researchPayload.confidence || 'low',
      hookType: researchPayload.hookType || 'general',
      companySignals: researchPayload.companySignals || [],
      personalAngles: researchPayload.personalAngles || [],
      warnings: researchPayload.warnings || []
    };
    persistState();

    setStage('shape', 'running', 'Structuring the raw research into a usable first-pass draft.');
    appendTimeline('Research finished', `Found ${reviewState.sources.length} source${reviewState.sources.length === 1 ? '' : 's'} and built the first outreach structure.`);
    renderState();

    setStage('polish', 'running', 'Polishing the message into a cleaner final outreach email.');
    appendTimeline('Polish started', 'Turning the researched structure into a readable final draft.');
    renderState();

    const polishRes = await fetch('/api/application-agent/polish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey,
        company: reviewState.meta.companyName || reviewState.company || '',
        draft: reviewState.researchedDraft,
        tonePreset: 'balanced',
        includePortfolioLink: Boolean(reviewState.recommendedAttachments?.portfolioLink)
      })
    });
    const polishPayload = await polishRes.json().catch(() => ({}));
    if (!polishRes.ok) throw new Error(polishPayload?.error || 'Polish failed.');

    const warnings = Array.isArray(polishPayload.warnings) ? polishPayload.warnings : (reviewState.meta.warnings || []);
    const allowDirectSend = Boolean(reviewState.smtpConfigured) && Boolean(reviewState.meta.contactEmail) && warnings.length === 0;
    const reasons = [
      !reviewState.smtpConfigured ? 'SMTP is not configured.' : null,
      !reviewState.meta.contactEmail ? 'No public contact email found.' : null,
      ...warnings
    ].filter(Boolean);

    reviewState.draft = {
      companyName: reviewState.meta.companyName || reviewState.company,
      companyWebsite: reviewState.meta.companyWebsite || reviewState.website || '',
      careersUrl: reviewState.meta.careersUrl || '',
      contactEmail: reviewState.meta.contactEmail || '',
      contactReason: reviewState.meta.contactReason || '',
      confidence: reviewState.meta.confidence || 'low',
      subject: polishPayload.subject || reviewState.researchedDraft.subject || `Internship Application - ${reviewState.company}`,
      introLines: Array.isArray(polishPayload.introLines) ? polishPayload.introLines : (reviewState.researchedDraft.introLines || []),
      bodyLines: Array.isArray(polishPayload.bodyLines) ? polishPayload.bodyLines : (reviewState.researchedDraft.bodyLines || []),
      signatureLines: Array.isArray(polishPayload.signatureLines) ? polishPayload.signatureLines : [],
      body: polishPayload.body || reviewState.researchedDraft.body || '',
      hookType: reviewState.meta.hookType || 'general',
      companySignals: reviewState.meta.companySignals || [],
      personalAngles: reviewState.meta.personalAngles || [],
      warnings,
      recommendedAttachments: reviewState.recommendedAttachments || {},
      safety: {
        allowDirectSend,
        reasons
      },
      tonePreset: polishPayload.tonePreset || 'balanced',
      cc: reviewState.researchedDraft.cc || ''
    };
    persistState();

    setStage('ready', 'ready', `Draft ready for ${reviewState.draft.companyName || reviewState.company}.`);
    appendTimeline('Draft ready', 'The route finished research and polish successfully. You can review the draft now.');
    renderState();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Preparation failed.';
    setStage(reviewState?.stageState?.currentStep || 'queued', 'error', message, { error: message });
    appendTimeline('Preparation failed', message, 'error');
    setError(message);
    renderState();
  }
}

async function submitReview(event) {
  event.preventDefault();
  if (!reviewState?.draft) return;

  const action = selectedAction();
  const to = routeTo?.value.trim() || '';
  const cc = routeCc?.value.trim() || '';
  const subject = routeSubject?.value.trim() || '';
  const body = routeBody?.value || '';
  const includeResume = Boolean(routeIncludeResume?.checked);
  const includeTranscript = Boolean(routeIncludeTranscript?.checked);
  const includePortfolioLink = Boolean(routeIncludePortfolioLink?.checked);
  const safety = reviewState?.draft?.safety || { allowDirectSend: false, reasons: [] };

  if (action === 'cancel') {
    await logAction('cancelled', {
      confidence: reviewState?.draft?.confidence || 'low',
      reasons: reviewState?.draft?.safety?.reasons || []
    });
    sessionStorage.removeItem(REVIEW_STATE_KEY);
    window.location.href = '/';
    return;
  }

  if (!to || !subject || !body.trim()) {
    setError('Recipient, subject, and body must be filled before continuing.');
    return;
  }

  reviewState.draft.subject = subject;
  reviewState.draft.body = body;
  reviewState.draft.cc = cc;
  persistState();
  setError('');

  if (routeSubmit) {
    routeSubmit.disabled = true;
    routeSubmit.textContent = action === 'send' ? 'Sending...' : 'Opening...';
  }

  try {
    if (action === 'draft') {
      await logAction('draft-opened', {
        to,
        subject,
        tonePreset: reviewState?.draft?.tonePreset || 'balanced',
        attachmentCombo: [
          includeResume ? 'Resume' : null,
          includeTranscript ? 'Transcript' : null,
          includePortfolioLink ? 'Portfolio link' : null
        ].filter(Boolean).join(' + ') || 'None'
      });
      appendTimeline('Gmail draft opened', 'Opened the prepared email in Gmail compose.');
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${escapeMailtoValue(to)}&su=${escapeMailtoValue(subject)}&body=${escapeMailtoValue(body)}${cc ? `&cc=${escapeMailtoValue(cc)}` : ''}`;
      window.open(gmailUrl, '_blank');
      return;
    }

    if (!safety.allowDirectSend) {
      await logAction('send-blocked', {
        reasons: safety.reasons || [],
        confidence: reviewState?.draft?.confidence || 'low'
      });
      throw new Error(`Direct send locked: ${(safety.reasons || []).join(' | ') || 'Human-reviewed draft required.'}`);
    }

    const res = await fetch('/api/application-agent/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        internshipId: reviewState.entryId,
        to,
        cc,
        subject,
        body,
        includeResume,
        includeTranscript,
        includePortfolioLink,
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
    sessionStorage.removeItem(REVIEW_STATE_KEY);
    window.alert(`Message sent. Message ID: ${payload.messageId || 'n/a'}`);
    window.location.href = '/';
  } catch (error) {
    appendTimeline('Send failed', error instanceof Error ? error.message : 'Agent action failed.', 'error');
    setError(error instanceof Error ? error.message : 'Agent action failed.');
  } finally {
    if (routeSubmit) {
      routeSubmit.disabled = false;
      routeSubmit.textContent = 'Apply decision';
    }
  }
}

function initTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  document.documentElement.setAttribute('data-theme', savedTheme === 'light' ? 'light' : 'dark');
}

function bindEvents() {
  routeForm?.addEventListener('submit', submitReview);
  routeCancel?.addEventListener('click', () => {
    window.location.href = '/';
  });
  routeToneGrid?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-tone-preset]');
    if (!button) return;
    applyTonePreset(button.getAttribute('data-tone-preset') || 'balanced');
  });
  [routeIncludeResume, routeIncludeTranscript, routeIncludePortfolioLink].forEach((input) => {
    input?.addEventListener('change', () => {
      renderAssetList();
      syncActionUi();
    });
  });
  document.querySelectorAll('input[name="agentRouteAction"]').forEach((input) => {
    input.addEventListener('change', syncActionUi);
  });
  routeRetryBtn?.addEventListener('click', () => {
    runPreparationPipeline({ retry: true });
  });
}

function boot() {
  initTheme();
  reviewState = readState() || hydrateStateFromQuery();
  if (reviewState) persistState();
  bindEvents();
  renderState();
  if (reviewState?.company && !reviewState?.draft) {
    runPreparationPipeline();
  }
  window.requestAnimationFrame(() => {
    document.body.classList.add('is-ready');
  });
}

boot();
