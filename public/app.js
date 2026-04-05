const el = (id) => document.getElementById(id);

const form = el('entryForm');
const entryId = el('entryId');
const companyInput = el('company');
const statusInput = el('status');
const notesInput = el('notes');
const websiteInput = el('website');
const tagInput = el('tag');
const list = el('list');
const count = el('count');
const search = el('search');
const exportBtn = el('exportBtn');
const importBtn = el('importBtn');
const importFileInput = el('importFileInput');
const importFeedback = el('importFeedback');
const cancelBtn = el('cancelBtn');
const filterChips = el('filterChips');
const followupChip = el('followupChip');
const pageTitle = el('pageTitle');
const statusNav = el('statusNav');
const quickAddBtn = el('quickAddBtn');
const quickAddPanel = el('quickAddPanel');
const quickAddClose = el('quickAddClose');
const countryFilter = el('countryFilter');
const priorityFilter = el('priorityFilter');
const priorityInput = el('priority');
const appliedAtInput = el('appliedAt');
const followupAtInput = el('followupAt');
const tagFieldset = el('quickAddTags');
const emptyState = el('emptyState');
const emptyAddBtn = el('emptyAddBtn');
const drawerBackdrop = el('drawerBackdrop');
const detailDrawer = el('detailDrawer');
const drawerClose = el('drawerClose');
const drawerCancel = el('drawerCancel');
const drawerDeleteBtn = el('drawerDeleteBtn');
const drawerForm = el('drawerForm');
const drawerId = el('drawerId');
const drawerCompany = el('drawerCompany');
const drawerStatus = el('drawerStatus');
const drawerPriority = el('drawerPriority');
const drawerAppliedAt = el('drawerAppliedAt');
const drawerFollowupAt = el('drawerFollowupAt');
const drawerReplyReceivedAt = el('drawerReplyReceivedAt');
const drawerReplyOutcome = el('drawerReplyOutcome');
const drawerWebsite = el('drawerWebsite');
const drawerTag = el('drawerTag');
const drawerNotes = el('drawerNotes');
const drawerAnalyzeBtn = el('drawerAnalyzeBtn');
const prepareAgentBtn = el('prepareAgentBtn');
const copyMailHookBtn = el('copyMailHookBtn');
const analysisPanel = el('analysisPanel');
const analysisEmpty = el('analysisEmpty');
const analysisLoading = el('analysisLoading');
const analysisLoadingText = el('analysisLoadingText');
const analysisError = el('analysisError');
const analysisResult = el('analysisResult');
const drawerActivityList = el('activityList');
const activityCount = el('activityCount');
const mailDraftList = el('mailDraftList');
const mailDraftCount = el('mailDraftCount');
const savedViewSelect = el('savedViewSelect');
const savedViewNav = el('savedViewNav');
const saveViewBtn = el('saveViewBtn');
const commandPalette = el('commandPalette');
const commandInput = el('commandInput');
const commandList = el('commandList');
const apiKeyBtn = el('apiKeyBtn');
const apiKeyModal = el('apiKeyModal');
const apiKeyForm = el('apiKeyForm');
const apiKeyInput = el('apiKeyInput');
const apiKeyClose = el('apiKeyClose');
const apiKeyCancel = el('apiKeyCancel');
const themeToggleBtn = el('themeToggleBtn');
const searchTrigger = el('searchTrigger');
const inlineSearch = el('inlineSearch');
const viewToggle = el('viewToggle');
const listView = el('listView');
const boardView = el('boardView');
const board = el('board');
const emptyIcon = el('emptyIcon');
const emptyTitle = el('emptyTitle');
const emptySub = el('emptySub');
const onboarding = el('onboarding');
const obStep = el('obStep');
const obNext = el('obNext');
const obSkip = el('obSkip');
const agentReviewModal = el('agentReviewModal');
const agentReviewForm = el('agentReviewForm');
const agentReviewClose = el('agentReviewClose');
const agentReviewCancel = el('agentReviewCancel');
const agentReviewSubmit = el('agentReviewSubmit');
const agentToInput = el('agentToInput');
const agentCcInput = el('agentCcInput');
const agentSubjectInput = el('agentSubjectInput');
const agentBodyInput = el('agentBodyInput');
const agentContactReason = el('agentContactReason');
const agentConfidence = el('agentConfidence');
const agentDecisionQuestion = el('agentDecisionQuestion');
const agentSendLabel = el('agentSendLabel');
const agentDraftLabel = el('agentDraftLabel');
const agentCancelLabel = el('agentCancelLabel');
const agentIncludeResume = el('agentIncludeResume');
const agentIncludeTranscript = el('agentIncludeTranscript');
const agentIncludePortfolioLink = el('agentIncludePortfolioLink');
const agentAttachmentReason = el('agentAttachmentReason');
const agentAssetList = el('agentAssetList');
const agentToneGrid = el('agentToneGrid');
const agentToneStatus = el('agentToneStatus');
const agentSafetyBlock = el('agentSafetyBlock');
const agentSafetyNote = el('agentSafetyNote');
const agentSignals = el('agentSignals');
const agentAngles = el('agentAngles');
const agentWarnings = el('agentWarnings');
const agentSources = el('agentSources');
const agentReviewError = el('agentReviewError');
const statusCountEls = Array.from(document.querySelectorAll('[data-status-count]'));

const themeKey = 'staj-theme';
const onboardingKey = 'staj-onboarded';
const viewModeKey = 'staj-viewmode';
const apiKeyStorageKey = 'staj-apikey';
// Purpose: after saving key on /api-key, resume analyze on main app load
const PENDING_ANALYZE_KEY = 'staj-pending-analyze';
const PENDING_AGENT_REVIEW_KEY = 'staj-pending-agent-review';
const analysisCacheKey = 'staj-analysis-cache-v1';
const agentReviewStateKey = 'staj-agent-review-state-v2';
const STATUS_FLOW = ['Researching', 'Ready to Apply', 'Applied', 'Interview', 'Offer', 'Rejected', 'Paused'];
const PRIORITY_ORDER = { High: 3, Medium: 2, Low: 1 };
const CV_TEXT = `Emre Ilhan
emreilhn15@gmail.com | github.com/emreeilhan | emreilhan.pages.dev | Antalya, Turkey
Turkish & German Citizen

PROFILE
Security-oriented Computer Engineering student with a strong system-level mindset. Focused on embedded systems, cybersecurity engineering, and embedded security. Interested in real-world systems, hardware-software interaction, and defensive security roles.

EDUCATION
Antalya Bilim University 2024 - Present
B.Sc. in Computer Engineering (English) Antalya, Turkey
GPA: 3.01 / 4.00 Honor Student
Relevant coursework: Data Structures, Algorithms, Operating Systems, Computer Organization, Digital Systems & Lab, Microcontrollers, Systems Programming, Databases

EXPERIENCE
Security Learning & Hands-on Labs 2024 - Present
Detection-Oriented Cybersecurity Practice
- Completed structured cybersecurity labs focused on defensive security, SOC workflows, and incident fundamentals
- Performed hands-on analysis of alerts, logs, and common attack scenarios in simulated environments
- Maintained consistent hands-on practice; ranked within the global top 3% on TryHackMe

PROJECTS
ESP32 Embedded Development
- Configured and flashed ESP32 microcontroller; developed basic firmware using Arduino-based tooling
- Worked with GPIO and peripheral interfaces; observed timing, memory, and resource constraints
- Explored hardware-software interaction and execution behavior in resource-constrained embedded systems

Academic System-Oriented Projects
- Developed Java-based OOP projects with emphasis on clean architecture and modular design
- Applied operating systems and computer organization concepts in coursework and laboratory assignments

CERTIFICATIONS
Google Cybersecurity Professional Certificate - Completed
CompTIA Security+ - In Progress

SKILLS
Programming: Java (strong), Python
Embedded Systems: ESP32, microcontrollers, firmware development, peripheral interaction
Systems: Operating systems fundamentals, memory concepts, hardware-software interaction
Security: Detection-oriented security mindset, SOC fundamentals, alert and incident analysis
Tools: Git, Linux, Arduino IDE

LANGUAGES
Turkish (Native) English (B2) German (B1)`;

/* Per-stage empty state content — icon keys map to StajIcons (see /js/ui-icons.js) */
const STAGE_EMPTY = {
  '': { icon: 'pin', title: 'No applications yet', sub: 'Add your first internship to start tracking your pipeline.' },
  'Researching': { icon: 'search', title: 'No companies being researched', sub: 'Start exploring roles and companies — add them here as you discover opportunities.' },
  'Ready to Apply': { icon: 'clipboardCheck', title: 'Nothing ready to apply', sub: 'When you\'ve done your research & prep, move entries here to submit.' },
  'Applied': { icon: 'mail', title: 'No applications sent yet', sub: 'Once you submit, track them here. Good luck!' },
  'Interview': { icon: 'calendar', title: 'No interviews scheduled', sub: 'Keep applying — interviews will come. Prepare notes when they do.' },
  'Offer': { icon: 'star', title: 'No offers yet', sub: 'Stay focused on the pipeline. Your offer is coming!' },
  'Rejected': { icon: 'fileX', title: 'No rejections yet', sub: 'Every "no" is one step closer to a "yes." Keep going.' },
  'Paused': { icon: 'pauseCircle', title: 'Nothing paused', sub: 'Use this stage for opportunities you want to revisit later.' }
};

/* Board-level empty messages */
const BOARD_EMPTY = {
  'Researching': { icon: 'search', msg: 'Start by adding companies to research.' },
  'Ready to Apply': { icon: 'clipboardCheck', msg: 'Move researched companies here when ready.' },
  'Applied': { icon: 'mail', msg: 'Applications will appear here.' },
  'Interview': { icon: 'calendar', msg: 'Interview invites show up here.' },
  'Offer': { icon: 'star', msg: 'Offers land here.' },
  'Rejected': { icon: 'fileX', msg: 'Rejections tracked here.' },
  'Paused': { icon: 'pauseCircle', msg: 'Paused items rest here.' }
};

/** Purpose: Resolve shared SVG markup for empty states (falls back if script order is wrong). */
function emptyIconMarkup(key) {
  const icons = typeof window !== 'undefined' ? window.StajIcons : null;
  const fn = icons && typeof icons[key] === 'function' ? icons[key] : null;
  return fn ? fn() : (icons && icons.pin ? icons.pin() : '');
}

let entries = [];
let savedViews = [];
let followupOnly = false;
let lastFiltered = [];
let activeEntryId = null;
let activityCache = new Map();
let mailDraftCache = new Map();
let analysisErrors = new Map();
let rowMenuId = null;
let activeViewId = null;
let openSavedViewMenuId = null;
let editingSavedViewId = null;
let currentViewMode = localStorage.getItem(viewModeKey) || 'list';
let onboardingStep = 0;
let analysisLoadingId = null;
let agentDraftState = null;
let agentLoadingId = null;

function escapeHtml(value) {
  return String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function normalizeUrl(url) {
  if (!url) return '';
  const candidate = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
  try {
    const parsed = new URL(candidate);
    const hostname = parsed.hostname || '';
    const looksValidHost = hostname === 'localhost' || hostname.includes('.') || hostname.startsWith('xn--');
    return looksValidHost ? parsed.toString() : '';
  } catch {
    return '';
  }
}

function safeJsonParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function getStoredApiKey() {
  return localStorage.getItem(apiKeyStorageKey) || '';
}

function setStoredApiKey(value) {
  const normalized = String(value || '').trim();
  if (!normalized) {
    localStorage.removeItem(apiKeyStorageKey);
    return;
  }
  localStorage.setItem(apiKeyStorageKey, normalized);
}

function getAnalysisCacheMap() {
  return safeJsonParse(localStorage.getItem(analysisCacheKey), {});
}

function getCachedAnalysis(id) {
  const cache = getAnalysisCacheMap();
  return cache[String(id)] || null;
}

function setCachedAnalysis(id, payload) {
  const cache = getAnalysisCacheMap();
  cache[String(id)] = {
    ...payload,
    cachedAt: new Date().toISOString()
  };
  localStorage.setItem(analysisCacheKey, JSON.stringify(cache));
}

function openApiKeyModal() {
  if (!apiKeyModal) return;
  apiKeyModal.classList.add('open');
  apiKeyModal.setAttribute('aria-hidden', 'false');
  if (apiKeyInput) {
    apiKeyInput.value = getStoredApiKey();
    apiKeyInput.focus();
    apiKeyInput.select();
  }
}

function dismissApiKeyModal() {
  apiKeyModal?.classList.remove('open');
  apiKeyModal?.setAttribute('aria-hidden', 'true');
}

async function saveApiKey(event) {
  event.preventDefault();
  setStoredApiKey(apiKeyInput?.value || '');
  dismissApiKeyModal();
  const resumedAgentReview = await resumePendingAgentReviewAfterKey();
  if (!resumedAgentReview) {
    await resumePendingAnalysisAfterKey();
  }
}

function getEntryById(id) {
  return entries.find((item) => String(item.id) === String(id)) || null;
}

// Purpose: Pipeline status → CSS modifier (shared by list pills, board dots, and filters).
function statusClass(status) {
  const value = (status || '').toLowerCase().replace(/\s+/g, '-');
  if (value.includes('complete')) return 'status-offer';
  if (value.includes('offer')) return 'status-offer';
  if (value.includes('interview')) return 'status-interview';
  if (value.includes('rejected')) return 'status-rejected';
  if (value.includes('paused')) return 'status-paused';
  if (value.includes('ready')) return 'status-ready-to-apply';
  if (value.includes('applied')) return 'status-applied';
  return 'status-researching';
}

function parseCountry(tag) {
  if (!tag) return '';
  const parts = String(tag).split(/,|\/|;|·/).map((part) => part.trim()).filter(Boolean);
  return parts[parts.length - 1] || '';
}

function parseLocationParts(tag) {
  const parts = String(tag || '').split(/,|\/|;|·/).map((part) => part.trim()).filter(Boolean);
  return { city: parts[0] || '', country: parts.length > 1 ? parts[parts.length - 1] : '' };
}

function buildCountryOptions(items) {
  const options = new Set();
  items.forEach((entry) => { const c = parseCountry(entry.tag); if (c) options.add(c); });
  return Array.from(options).sort((a, b) => a.localeCompare(b));
}

function populateCountryFilterOptions() {
  if (!countryFilter) return;
  const current = countryFilter.value;
  const countries = buildCountryOptions(entries);
  countryFilter.innerHTML = '<option value="">Country</option>';
  countries.forEach((country) => {
    const option = document.createElement('option');
    option.value = country;
    option.textContent = country;
    countryFilter.appendChild(option);
  });
  if (current && countries.includes(current)) countryFilter.value = current;
  else countryFilter.value = '';
}

function countBy(list, getter) {
  const map = new Map();
  list.forEach((item) => { const key = getter(item); if (!key) return; map.set(key, (map.get(key) || 0) + 1); });
  return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
}

function getFocusTagsFromFieldset(fieldset) {
  if (!fieldset) return [];
  return Array.from(fieldset.querySelectorAll('input[type="checkbox"]:checked')).map((input) => input.value);
}

function applyFocusTagsToFieldset(fieldset, tags) {
  if (!fieldset) return;
  const set = new Set((tags || []).map((t) => t.trim()).filter(Boolean));
  fieldset.querySelectorAll('input[type="checkbox"]').forEach((input) => { input.checked = set.has(input.value); });
}

function isFollowupDue(value) {
  if (!value) return false;
  const today = new Date();
  const target = new Date(value);
  if (Number.isNaN(target.getTime())) return false;
  return target.getTime() - today.setHours(0, 0, 0, 0) <= 7 * 24 * 60 * 60 * 1000;
}

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function formatDateLabel(value) {
  if (!value) return 'No date';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatDateTimeLabel(value) {
  if (!value) return 'Unknown time';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

function formatDistanceInDays(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const diffDays = Math.round((date.getTime() - startOfToday().getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return '1 day late';
  if (diffDays < 0) return `${Math.abs(diffDays)} days late`;
  return `In ${diffDays} days`;
}

function nextStepForEntry(entry) {
  const status = String(entry.status || 'Researching');
  const followupLabel = entry.followup_at ? `${formatDateLabel(entry.followup_at)} · ${formatDistanceInDays(entry.followup_at)}` : '';
  const replyLabel = entry.reply_received_at ? `${formatDateLabel(entry.reply_received_at)} · ${entry.reply_outcome || 'reply logged'}` : '';
  if (status === 'Ready to Apply') return { title: 'Submit application', detail: entry.applied_at ? `Marked for ${formatDateLabel(entry.applied_at)}` : 'Ready to submit.' };
  if (status === 'Applied') return { title: entry.reply_received_at ? 'Review reply' : entry.followup_at ? 'Follow up' : 'Wait for response', detail: replyLabel || followupLabel || (entry.applied_at ? `Applied ${formatDateLabel(entry.applied_at)}` : 'Submitted.') };
  if (status === 'Interview') return { title: 'Prepare interview', detail: followupLabel || 'Capture prep notes.' };
  if (status === 'Offer') return { title: 'Review offer', detail: 'Compare before deciding.' };
  if (status === 'Rejected') return { title: 'Archive', detail: 'Keep notes for next pass.' };
  if (status === 'Paused') return { title: 'Revisit later', detail: followupLabel || 'Not active.' };
  return { title: entry.followup_at ? 'Review' : 'Research role fit', detail: followupLabel || 'Validate scope, stack, location.' };
}

function getRowPrimaryAction(entry) {
  return { label: 'Open', detail: nextStepForEntry(entry).title };
}

/* ============================================================ THEME */
function applyTheme(theme) {
  const resolved = theme || 'dark';
  document.documentElement.setAttribute('data-theme', resolved);
  localStorage.setItem(themeKey, resolved);
  const themeLabel = document.getElementById('themeLabel');
  if (themeLabel) themeLabel.textContent = resolved === 'dark' ? 'Light mode' : 'Dark mode';
}

function initTheme() {
  const saved = localStorage.getItem(themeKey);
  applyTheme(saved || 'dark');
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  applyTheme(current === 'dark' ? 'light' : 'dark');
}

/* ============================================================ SEARCH */
function openSearch() {
  if (!inlineSearch) return;
  inlineSearch.setAttribute('aria-hidden', 'false');
  search?.focus();
}

function closeSearch() {
  if (!inlineSearch) return;
  if (search) search.value = '';
  inlineSearch.setAttribute('aria-hidden', 'true');
  renderList();
}

/* ============================================================ FORM HELPERS */
function resetForm() {
  if (entryId) entryId.value = '';
  if (companyInput) companyInput.value = '';
  if (websiteInput) websiteInput.value = '';
  if (tagInput) tagInput.value = '';
  if (statusInput) statusInput.value = 'Researching';
  if (notesInput) notesInput.value = '';
  if (priorityInput) priorityInput.value = 'Medium';
  if (appliedAtInput) appliedAtInput.value = '';
  if (followupAtInput) followupAtInput.value = '';
  if (tagFieldset) applyFocusTagsToFieldset(tagFieldset, []);
}

function openQuickAdd() {
  quickAddPanel?.classList.add('open');
  quickAddPanel?.setAttribute('aria-hidden', 'false');
  companyInput?.focus();
}

function closeQuickAdd() {
  quickAddPanel?.classList.remove('open');
  quickAddPanel?.setAttribute('aria-hidden', 'true');
}

function openDrawer(entry) {
  if (!drawerBackdrop || !detailDrawer || !drawerCompany) return;
  activeEntryId = entry.id;
  rowMenuId = null;
  drawerBackdrop.classList.add('open');
  detailDrawer.classList.add('open');
  drawerBackdrop.setAttribute('aria-hidden', 'false');
  detailDrawer.setAttribute('aria-hidden', 'false');
  drawerId.value = entry.id;
  drawerCompany.value = entry.company || '';
  drawerStatus.value = entry.status || 'Researching';
  drawerPriority.value = entry.priority || 'Medium';
  drawerAppliedAt.value = entry.applied_at || '';
  drawerFollowupAt.value = entry.followup_at || '';
  if (drawerReplyReceivedAt) drawerReplyReceivedAt.value = entry.reply_received_at || '';
  if (drawerReplyOutcome) drawerReplyOutcome.value = entry.reply_outcome || '';
  drawerWebsite.value = entry.website || '';
  drawerTag.value = entry.tag || '';
  drawerNotes.value = entry.notes || '';
  applyFocusTagsToFieldset(document.querySelector('#drawerTags'), String(entry.focus_tags || '').split(',').map((t) => t.trim()).filter(Boolean));
  renderAnalysisState(entry.id);
  renderActivity(activityCache.get(String(entry.id)) || []);
  renderMailDraftHistory(mailDraftCache.get(String(entry.id)) || []);
  loadActivity(entry.id);
  loadMailDrafts(entry.id);
}

function closeDrawer() {
  drawerBackdrop?.classList.remove('open');
  detailDrawer?.classList.remove('open');
  drawerBackdrop?.setAttribute('aria-hidden', 'true');
  detailDrawer?.setAttribute('aria-hidden', 'true');
  activeEntryId = null;
}

function closeRowMenu() {
  if (rowMenuId == null) return;
  rowMenuId = null;
  renderList();
}

/* ============================================================ FILTERS */
function currentFilters() {
  return {
    search: search?.value?.trim() || '',
    status: el('statusFilter')?.value || '',
    country: countryFilter?.value || '',
    priority: priorityFilter?.value || '',
    followupOnly
  };
}

function setStatusFilter(value) {
  const statusFilter = el('statusFilter');
  if (!statusFilter) return;
  statusFilter.value = value || '';
  renderAll();
}

/* ============================================================ VIEW MODE */
function setViewMode(mode) {
  currentViewMode = mode;
  localStorage.setItem(viewModeKey, mode);
  if (listView) listView.style.display = mode === 'list' ? '' : 'none';
  if (boardView) boardView.style.display = mode === 'board' ? '' : 'none';
  if (viewToggle) {
    viewToggle.querySelectorAll('.vt-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.view === mode);
    });
  }
  renderAll();
}

function renderAll() {
  if (currentViewMode === 'board') renderBoard();
  else renderList();
}

/* ============================================================ SAVED VIEWS */
function selectedSavedView() {
  return savedViews.find((item) => String(item.id) === String(activeViewId));
}

function getSavedViewById(id) {
  return savedViews.find((item) => String(item.id) === String(id));
}

function closeSavedViewMenu() {
  openSavedViewMenuId = null;
}

function startSavedViewRename(viewId) {
  editingSavedViewId = viewId == null ? null : String(viewId);
  openSavedViewMenuId = null;
  renderSavedViewsInSidebar();
  if (!editingSavedViewId) return;
  const input = savedViewNav?.querySelector(`[data-view-rename-input="${editingSavedViewId}"]`);
  input?.focus();
  input?.select();
}

function applySavedView(view) {
  if (!view) return;
  activeViewId = view.id;
  editingSavedViewId = null;
  closeSavedViewMenu();
  const filters = view.filters || {};
  if (search) search.value = filters.search || '';
  el('statusFilter').value = filters.status || '';
  if (countryFilter) countryFilter.value = filters.country || '';
  if (priorityFilter) priorityFilter.value = filters.priority || '';
  followupOnly = Boolean(filters.followupOnly);
  renderList();
  renderSavedViewsInSidebar();
}

function renderSavedViewsInSidebar() {
  if (!savedViewNav) return;
  savedViewNav.innerHTML = '';
  if (!savedViews.length) {
    const empty = document.createElement('div');
    empty.style.cssText = 'font-size:0.75rem;color:var(--muted);padding:4px 8px;';
    empty.textContent = 'No saved views';
    savedViewNav.appendChild(empty);
    return;
  }
  savedViews.forEach((view) => {
    const row = document.createElement('div');
    const isActive = String(activeViewId) === String(view.id);
    const isEditing = String(editingSavedViewId) === String(view.id);
    const menuOpen = String(openSavedViewMenuId) === String(view.id);
    row.className = 'saved-view-row' + (isActive ? ' active' : '');

    if (isEditing) {
      row.innerHTML = `
        <form class="saved-view-rename-form" data-view-rename-form="${view.id}">
          <span class="view-icon">◇</span>
          <input
            class="saved-view-rename-input"
            data-view-rename-input="${view.id}"
            type="text"
            value="${escapeHtml(view.name)}"
            aria-label="Rename ${escapeHtml(view.name)}"
          />
          <div class="saved-view-inline-actions">
            <button class="saved-view-mini-btn" type="submit">Save</button>
            <button class="saved-view-mini-btn" type="button" data-action="cancel-view-rename" data-view-id="${view.id}">Cancel</button>
          </div>
        </form>
      `;
    } else {
      row.innerHTML = `
        <button class="saved-view-item${isActive ? ' active' : ''}" type="button" data-action="apply-view" data-view-id="${view.id}">
          <span class="view-icon">◇</span>
          <span class="nav-label">${escapeHtml(view.name)}</span>
        </button>
        <div class="saved-view-actions">
          <button
            class="saved-view-menu-trigger"
            type="button"
            data-action="toggle-view-menu"
            data-view-id="${view.id}"
            aria-expanded="${menuOpen ? 'true' : 'false'}"
            aria-label="Manage ${escapeHtml(view.name)}"
          >•••</button>
          ${menuOpen ? `
            <div class="saved-view-inline-menu" role="menu">
              <button class="menu-item" type="button" data-action="apply-view" data-view-id="${view.id}">Apply</button>
              <button class="menu-item" type="button" data-action="overwrite-view" data-view-id="${view.id}">Overwrite</button>
              <button class="menu-item" type="button" data-action="rename-view" data-view-id="${view.id}">Rename</button>
              <button class="menu-item danger" type="button" data-action="delete-view" data-view-id="${view.id}">Delete</button>
            </div>
          ` : ''}
        </div>
      `;
    }

    savedViewNav.appendChild(row);
  });
}

function renderSavedViews() {
  if (savedViewSelect) {
    savedViewSelect.innerHTML = '<option value="">Views</option>';
    savedViews.forEach((view) => {
      const option = document.createElement('option');
      option.value = String(view.id);
      option.textContent = view.name;
      savedViewSelect.appendChild(option);
    });
  }
  renderSavedViewsInSidebar();
}

async function loadSavedViews() {
  try {
    const res = await fetch('/api/saved-views');
    const text = await res.text();
    const parsed = safeJsonParse(text, []);
    savedViews = res.ok && Array.isArray(parsed) ? parsed : [];
  } catch {
    savedViews = [];
  }
  renderSavedViews();
}

async function loadEntries() {
  try {
    const res = await fetch('/api/internships');
    const text = await res.text();
    const parsed = safeJsonParse(text, []);
    entries = res.ok && Array.isArray(parsed) ? parsed : [];
  } catch {
    entries = [];
  }
  populateCountryFilterOptions();
  renderAll();
}

/* ============================================================ ACTIVITY */
function safeParseActivityPayload(value) {
  if (value == null || value === '') return null;
  if (typeof value === 'object') return value;
  try { return JSON.parse(value); } catch { return value; }
}

function formatActivityValue(value) {
  if (value == null || value === '') return '-';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function formatFieldLabel(field) {
  return String(field || '').replace(/_/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
}

function diffEntries(before, after) {
  const beforeObj = before && typeof before === 'object' ? before : {};
  const afterObj = after && typeof after === 'object' ? after : {};
  const keys = Array.from(new Set([...Object.keys(beforeObj), ...Object.keys(afterObj)]));
  return keys.filter((key) => String(beforeObj[key] ?? '') !== String(afterObj[key] ?? '')).map((field) => ({ field, before: beforeObj[field], after: afterObj[field] }));
}

function renderActivity(items) {
  if (!drawerActivityList) return;
  drawerActivityList.innerHTML = '';
  if (activityCount) activityCount.textContent = `${items.length} events`;
  if (!items.length) {
    const empty = document.createElement('div');
    empty.className = 'timeline-empty';
    empty.textContent = 'No activity yet';
    drawerActivityList.appendChild(empty);
    return;
  }
  items.forEach((item) => {
    const oldValue = safeParseActivityPayload(item.old_value);
    const newValue = safeParseActivityPayload(item.new_value);
    const diffs = item.event_type === 'created' || item.event_type === 'edited' ? diffEntries(oldValue, newValue) : [];
    const headline = item.event_type === 'created'
      ? 'Created'
      : item.event_type === 'deleted'
        ? 'Deleted'
        : item.event_type === 'status changed'
          ? 'Status changed'
          : item.event_type === 'follow-up changed'
            ? 'Follow-up changed'
            : item.event_type === 'email sent'
              ? 'Email sent'
              : item.event_type === 'reply updated'
                ? 'Reply updated'
              : item.event_type === 'agent draft-opened'
                ? 'Draft opened'
                : item.event_type === 'agent send-blocked'
                  ? 'Direct send blocked'
                  : item.event_type === 'agent cancelled'
                    ? 'Review cancelled'
              : 'Edited';
    const details = diffs.length
      ? `<div class="timeline-diff-list">${diffs.map((diff) => `<div class="timeline-diff-row"><span class="timeline-field">${escapeHtml(formatFieldLabel(diff.field))}</span><span class="timeline-old">${escapeHtml(formatActivityValue(diff.before))}</span><span class="timeline-arrow">→</span><span class="timeline-new">${escapeHtml(formatActivityValue(diff.after))}</span></div>`).join('')}</div>`
      : `<div class="timeline-values"><span><strong>old</strong> ${escapeHtml(formatActivityValue(oldValue))}</span><span><strong>new</strong> ${escapeHtml(formatActivityValue(newValue))}</span></div>`;
    const row = document.createElement('div');
    row.className = 'timeline-item';
    row.innerHTML = `<div class="timeline-dot"></div><div class="timeline-body"><div class="timeline-top"><strong>${escapeHtml(headline)}</strong><span>${escapeHtml(item.created_at)}</span></div>${details}</div>`;
    drawerActivityList.appendChild(row);
  });
}

async function loadActivity(id) {
  if (!id) return;
  const res = await fetch(`/api/internships/${id}/activity`);
  const items = await res.json();
  activityCache.set(String(id), items);
  if (String(activeEntryId) === String(id)) renderActivity(items);
}

function draftStatusLabel(status) {
  const normalized = String(status || 'draft').toLowerCase();
  if (normalized === 'sent') return 'Sent';
  if (normalized === 'saved_draft') return 'Saved draft';
  if (normalized === 'pending_gmail_confirmation') return 'Awaiting Gmail confirmation';
  return 'Draft';
}

function previewDraftBody(body) {
  return String(body || '')
    .replace(/\s+/g, ' ')
    .trim();
}

function renderMailDraftHistory(items) {
  if (!mailDraftList) return;
  mailDraftList.innerHTML = '';
  if (mailDraftCount) mailDraftCount.textContent = `${items.length} drafts`;
  if (!items.length) {
    const empty = document.createElement('div');
    empty.className = 'timeline-empty';
    empty.textContent = 'No saved drafts yet';
    mailDraftList.appendChild(empty);
    return;
  }
  items.forEach((item) => {
    const row = document.createElement('details');
    const preview = previewDraftBody(item.body);
    const toLine = item.to ? `To ${item.to}` : 'No recipient saved';
    const ccLine = item.cc ? `CC ${item.cc}` : '';
    row.className = 'draft-history-card';
    row.innerHTML = `
      <summary class="draft-history-summary">
        <div class="draft-history-top">
          <strong>${escapeHtml(item.subject || 'Untitled draft')}</strong>
          <span class="draft-status-chip draft-status-${escapeHtml(String(item.status || 'draft').toLowerCase())}">${escapeHtml(draftStatusLabel(item.status))}</span>
        </div>
        <div class="draft-history-meta">
          <span>${escapeHtml(formatDateTimeLabel(item.updatedAt || item.createdAt))}</span>
          <span>${escapeHtml(item.tonePreset || 'balanced')} tone</span>
          <span>${escapeHtml(item.confidence || 'low')} confidence</span>
        </div>
        <div class="draft-history-preview">${escapeHtml(preview || 'Draft body is empty.')}</div>
      </summary>
      <div class="draft-history-body">
        <div class="draft-history-fields">
          <span>${escapeHtml(toLine)}</span>
          ${ccLine ? `<span>${escapeHtml(ccLine)}</span>` : ''}
          <span>${escapeHtml(item.contactReason || 'No contact reason saved')}</span>
          <span>${escapeHtml(item.hookType || 'general')} hook</span>
        </div>
        <pre class="draft-history-text">${escapeHtml(item.body || '')}</pre>
      </div>
    `;
    mailDraftList.appendChild(row);
  });
}

async function loadMailDrafts(id) {
  if (!id) return;
  try {
    const res = await fetch(`/api/internships/${id}/mail-drafts`);
    const text = await res.text();
    const items = safeJsonParse(text, []);
    const normalized = Array.isArray(items) ? items : [];
    mailDraftCache.set(String(id), normalized);
    if (String(activeEntryId) === String(id)) renderMailDraftHistory(normalized);
  } catch {
    mailDraftCache.set(String(id), []);
    if (String(activeEntryId) === String(id)) renderMailDraftHistory([]);
  }
}

/* ============================================================ AI ANALYSIS */
function normalizeAnalysisItems(items) {
  if (!Array.isArray(items)) return [];
  return items.map((item) => String(item || '').trim()).filter(Boolean);
}

function normalizeAnalysisPayload(payload) {
  const sections = payload?.sections || {};
  const verdictScore = Number(payload?.verdictScore);
  return {
    sections: {
      match: normalizeAnalysisItems(sections.match),
      gap: normalizeAnalysisItems(sections.gap),
      cvEdit: normalizeAnalysisItems(sections.cvEdit),
      mailHook: normalizeAnalysisItems(sections.mailHook),
      verdict: normalizeAnalysisItems(sections.verdict)
    },
    verdictScore: Number.isFinite(verdictScore) ? verdictScore : null,
    rawText: String(payload?.rawText || '').trim(),
    sources: Array.isArray(payload?.sources)
      ? payload.sources
        .filter((source) => source?.url)
        .map((source) => ({
          url: String(source.url),
          title: String(source.title || source.url),
          cited_text: String(source.cited_text || ''),
          page_age: String(source.page_age || '')
        }))
      : [],
    cachedAt: payload?.cachedAt || null
  };
}

function hasCachedAnalysis(id) {
  return Boolean(getCachedAnalysis(id));
}

function getMailHookText(payload) {
  const normalized = normalizeAnalysisPayload(payload);
  return normalized.sections.mailHook.join('\n');
}

function selectedAgentAction() {
  const input = document.querySelector('input[name="agentAction"]:checked');
  return input?.value || 'send';
}

function escapeMailtoValue(value) {
  return encodeURIComponent(String(value || ''));
}

function persistAgentReviewState(state) {
  try {
    if (!state) {
      sessionStorage.removeItem(agentReviewStateKey);
      return;
    }
    sessionStorage.setItem(agentReviewStateKey, JSON.stringify({
      ...state,
      draft: state.draft ? { ...state.draft } : null
    }));
  } catch {
    // Non-blocking: if sessionStorage is unavailable, the route will show a recovery state.
  }
}

function navigateToAgentReview(state) {
  persistAgentReviewState(state);
  const params = new URLSearchParams({
    entryId: String(state?.entryId || ''),
    company: String(state?.company || ''),
    location: String(state?.location || ''),
    notes: String(state?.notes || ''),
    website: String(state?.website || '')
  });
  document.body.classList.add('route-transitioning');
  window.setTimeout(() => {
    window.location.href = `/agent-review?${params.toString()}`;
  }, 280);
}

function buildAgentListMarkup(items, emptyText) {
  const normalized = Array.isArray(items) ? items.filter(Boolean) : [];
  return normalized.length
    ? normalized.map((item) => `<li>${escapeHtml(item)}</li>`).join('')
    : `<li>${escapeHtml(emptyText)}</li>`;
}

function renderAgentAssets(assets) {
  if (!agentAssetList) return;
  const rows = [
    { label: 'Resume', item: assets?.resume, checked: agentIncludeResume?.checked !== false },
    { label: 'Transcript', item: assets?.transcript, checked: Boolean(agentIncludeTranscript?.checked) },
    { label: 'Portfolio', item: { exists: Boolean(agentDraftState?.profileContext?.portfolioUrl), name: agentDraftState?.profileContext?.portfolioUrl || '', error: 'Missing portfolio URL' }, checked: Boolean(agentIncludePortfolioLink?.checked) }
  ];
  agentAssetList.innerHTML = rows.map((row) => {
    const status = row.item?.exists ? 'Ready' : row.item?.error || 'Missing';
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

function updateTonePresetButtons(activeTone) {
  agentToneGrid?.querySelectorAll('[data-tone-preset]').forEach((button) => {
    const isActive = button.getAttribute('data-tone-preset') === activeTone;
    button.classList.toggle('active', isActive);
  });
}

function updateSafetyUI(draft, smtpConfigured) {
  if (!agentSafetyNote) return;
  const safety = draft?.safety || {};
  const reasons = Array.isArray(safety.reasons) ? safety.reasons.filter(Boolean) : [];
  if (safety.allowDirectSend) {
    agentSafetyNote.textContent = smtpConfigured
      ? 'Direct send is allowed. Recipient and warning level look safe.'
      : 'Direct send is allowed, but SMTP is off — the draft flow will be used.';
  } else {
    agentSafetyNote.textContent = `Direct send locked: ${reasons.join(' | ') || 'Human-reviewed draft required.'}`;
  }
}

function syncAgentActionWithSafety() {
  if (!agentDraftState) return;
  const sendInput = document.querySelector('input[name="agentAction"][value="send"]');
  const draftInput = document.querySelector('input[name="agentAction"][value="draft"]');
  const allowDirectSend = Boolean(agentDraftState?.draft?.safety?.allowDirectSend) && Boolean(agentDraftState?.smtpConfigured);
  if (sendInput) {
    sendInput.disabled = !allowDirectSend;
  }
  if (!allowDirectSend && draftInput) {
    draftInput.checked = true;
  }
}

function renderAgentReview() {
  if (!agentDraftState) return;
  const { draft, assets, sources, smtpConfigured } = agentDraftState;
  const companyName = draft.companyName || 'this company';
  if (agentToInput) agentToInput.value = draft.contactEmail || '';
  if (agentCcInput) agentCcInput.value = draft.cc || '';
  if (agentSubjectInput) agentSubjectInput.value = draft.subject || '';
  if (agentBodyInput) agentBodyInput.value = draft.body || '';
  if (agentContactReason) agentContactReason.textContent = draft.contactReason || 'No reason captured';
  if (agentConfidence) agentConfidence.textContent = draft.confidence || '-';
  if (agentDecisionQuestion) agentDecisionQuestion.textContent = `What should we do with the email drafted for ${companyName}?`;
  if (agentSendLabel) agentSendLabel.textContent = `Send to ${companyName} now`;
  if (agentDraftLabel) agentDraftLabel.textContent = `Open as draft for ${companyName} for a final review`;
  if (agentCancelLabel) agentCancelLabel.textContent = `Pause outreach to ${companyName} for now`;
  if (agentSignals) agentSignals.innerHTML = buildAgentListMarkup(draft.companySignals, 'No company signal captured.');
  if (agentAngles) agentAngles.innerHTML = buildAgentListMarkup(draft.personalAngles, 'No personal angle captured.');
  if (agentWarnings) agentWarnings.innerHTML = buildAgentListMarkup(draft.warnings, 'No warnings.');
  if (agentAttachmentReason) agentAttachmentReason.textContent = draft.recommendedAttachments?.rationale || 'No attachment recommendation returned.';
  if (agentIncludeResume) agentIncludeResume.checked = draft.recommendedAttachments?.resume !== false && Boolean(assets?.resume?.exists);
  if (agentIncludeTranscript) agentIncludeTranscript.checked = Boolean(draft.recommendedAttachments?.transcript) && Boolean(assets?.transcript?.exists);
  if (agentIncludePortfolioLink) agentIncludePortfolioLink.checked = Boolean(draft.recommendedAttachments?.portfolioLink) && Boolean(agentDraftState?.profileContext?.portfolioUrl);
  if (agentToneStatus) agentToneStatus.textContent = `Active tone: ${draft.tonePreset || 'balanced'}`;
  updateTonePresetButtons(draft.tonePreset || 'balanced');
  updateSafetyUI(draft, smtpConfigured);
  syncAgentActionWithSafety();
  if (agentSources) {
    agentSources.innerHTML = (sources || []).length
      ? sources.map((source) => `
          <a class="analysis-source" href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer noopener">
            <span class="analysis-source-title">${escapeHtml(source.title || source.url)}</span>
            <span class="analysis-source-meta">${escapeHtml(source.page_age || '')}</span>
          </a>
        `).join('')
      : '<div class="muted">No sources returned.</div>';
  }
  renderAgentAssets(assets);
}

function openAgentReview() {
  if (!agentReviewModal) return;
  renderAgentReview();
  agentReviewModal.classList.add('open');
  agentReviewModal.setAttribute('aria-hidden', 'false');
}

function closeAgentReview() {
  agentReviewModal?.classList.remove('open');
  agentReviewModal?.setAttribute('aria-hidden', 'true');
  if (agentReviewError) {
    agentReviewError.hidden = true;
    agentReviewError.textContent = '';
  }
}

function buildAnalysisSectionMarkup(title, items, options = {}) {
  if (!items.length) return '';
  const className = options.mono ? 'analysis-section mono' : 'analysis-section';
  return `
    <section class="${className}">
      <div class="analysis-section-label">${escapeHtml(title)}</div>
      <ul class="analysis-list">
        ${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
      </ul>
    </section>
  `;
}

function renderAnalysisResultMarkup(payload) {
  const normalized = normalizeAnalysisPayload(payload);
  const sectionsMarkup = [
    buildAnalysisSectionMarkup('Match', normalized.sections.match),
    buildAnalysisSectionMarkup('Gap', normalized.sections.gap),
    buildAnalysisSectionMarkup('CV Edit', normalized.sections.cvEdit, { mono: true }),
    buildAnalysisSectionMarkup('Mail Hook', normalized.sections.mailHook),
    buildAnalysisSectionMarkup('Verdict', normalized.sections.verdict)
  ].join('');
  const fallbackMarkup = !sectionsMarkup && normalized.rawText
    ? `
      <section class="analysis-section mono">
        <div class="analysis-section-label">Response</div>
        <div class="analysis-raw">${escapeHtml(normalized.rawText)}</div>
      </section>
    `
    : '';

  const sourcesMarkup = normalized.sources.length
    ? `
      <section class="analysis-section analysis-sources">
        <div class="analysis-section-label">Sources</div>
        <div class="analysis-source-list">
          ${normalized.sources.map((source) => `
            <a class="analysis-source" href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer noopener">
              <span class="analysis-source-title">${escapeHtml(source.title)}</span>
              <span class="analysis-source-meta">${escapeHtml([source.page_age, source.cited_text].filter(Boolean).join(' • '))}</span>
            </a>
          `).join('')}
        </div>
      </section>
    `
    : '';

  return (sectionsMarkup || fallbackMarkup) + sourcesMarkup;
}

function renderAnalysisState(entryId) {
  if (!analysisPanel) return;
  const entry = getEntryById(entryId);
  const cachedPayload = entry ? getCachedAnalysis(entry.id) : null;
  const cached = cachedPayload ? normalizeAnalysisPayload(cachedPayload) : null;
  const error = analysisErrors.get(String(entryId)) || '';
  const isLoading = String(analysisLoadingId) === String(entryId);

  if (drawerAnalyzeBtn) {
    drawerAnalyzeBtn.textContent = cached ? 'Re-analyze' : 'Analyze';
    drawerAnalyzeBtn.disabled = !entry || isLoading;
  }
  if (prepareAgentBtn) {
    prepareAgentBtn.disabled = !entry || isLoading || String(agentLoadingId) === String(entryId);
    prepareAgentBtn.textContent = String(agentLoadingId) === String(entryId) ? 'Preparing...' : 'Prepare Agent Mail';
  }
  if (copyMailHookBtn) {
    copyMailHookBtn.textContent = 'Copy Mail Hook';
    copyMailHookBtn.hidden = !(cached && cached.sections.mailHook.length);
  }
  if (analysisLoadingText) {
    analysisLoadingText.textContent = entry ? `Analyzing ${entry.company}...` : 'Analyzing...';
  }

  if (analysisEmpty) analysisEmpty.hidden = Boolean(cached) || Boolean(error) || isLoading;
  if (analysisLoading) analysisLoading.hidden = !isLoading;
  if (analysisError) {
    analysisError.hidden = !error;
    analysisError.textContent = error;
  }
  if (analysisResult) {
    analysisResult.hidden = !cached;
    analysisResult.innerHTML = cached ? renderAnalysisResultMarkup(cached) : '';
  }
}

async function persistFitScore(id, fitScore) {
  if (!id || !Number.isFinite(fitScore)) return;
  const res = await fetch(`/api/internships/${id}/fit-score`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fit_score: fitScore })
  });
  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    throw new Error(payload?.error || 'Could not update fit score.');
  }
  const entry = getEntryById(id);
  if (entry) entry.fit_score = fitScore;
  if (String(activeEntryId) === String(id)) {
    await loadActivity(id);
  }
}

async function runAnalysisForEntry(entry, options = {}) {
  if (!entry) return;
  const force = Boolean(options.force);
  const cached = getCachedAnalysis(entry.id);
  if (cached && !force) {
    analysisErrors.delete(String(entry.id));
    if (String(activeEntryId) === String(entry.id)) renderAnalysisState(entry.id);
    renderAll();
    return cached;
  }

  const apiKey = getStoredApiKey();
  if (!apiKey) {
    try {
      sessionStorage.setItem(
        PENDING_ANALYZE_KEY,
        JSON.stringify({ entryId: entry.id, force: force || Boolean(cached) })
      );
    } catch {
      // TODO: sessionStorage blocked (private mode) — user must re-run analyze after saving key
    }
    openApiKeyModal();
    return null;
  }

  analysisErrors.delete(String(entry.id));
  analysisLoadingId = entry.id;
  if (String(activeEntryId) === String(entry.id)) renderAnalysisState(entry.id);

  try {
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey,
        company: entry.company || '',
        location: entry.tag || '',
        notes: entry.notes || '',
        cvText: CV_TEXT
      })
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(payload?.error || 'Analysis failed.');
    }

    const normalized = normalizeAnalysisPayload(payload);
    setCachedAnalysis(entry.id, normalized);
    if (Number.isFinite(normalized.verdictScore)) {
      await persistFitScore(entry.id, normalized.verdictScore);
    }
    renderAll();
    return normalized;
  } catch (error) {
    analysisErrors.set(String(entry.id), error instanceof Error ? error.message : 'Analysis failed.');
    if (getCachedAnalysis(entry.id)) renderAll();
    return null;
  } finally {
    analysisLoadingId = null;
    if (String(activeEntryId) === String(entry.id)) renderAnalysisState(entry.id);
  }
}

async function prepareAgentMail(entry) {
  if (!entry) return;
  const apiKey = getStoredApiKey();
  if (!apiKey) {
    try {
      sessionStorage.setItem(
        PENDING_AGENT_REVIEW_KEY,
        JSON.stringify({
          entryId: entry.id,
          company: entry.company || '',
          location: entry.tag || '',
          notes: entry.notes || '',
          website: entry.website || '',
          startedAt: new Date().toISOString(),
          stageState: {
            status: 'queued',
            currentStep: 'queued',
            timeline: []
          }
        })
      );
    } catch {
      // If storage is blocked, the user can retry after saving the key.
    }
    openApiKeyModal();
    return;
  }

  agentLoadingId = entry.id;
  if (prepareAgentBtn) {
    prepareAgentBtn.disabled = true;
    prepareAgentBtn.textContent = 'Preparing...';
  }

  try {
    navigateToAgentReview({
      entryId: entry.id,
      company: entry.company || '',
      location: entry.tag || '',
      notes: entry.notes || '',
      website: entry.website || '',
      startedAt: new Date().toISOString(),
      stageState: {
        status: 'queued',
        currentStep: 'queued',
        timeline: []
      }
    });
  } catch (error) {
    analysisErrors.set(String(entry.id), error instanceof Error ? error.message : 'Agent preparation failed.');
    renderAnalysisState(entry.id);
  } finally {
    agentLoadingId = null;
    if (prepareAgentBtn) {
      prepareAgentBtn.disabled = false;
      prepareAgentBtn.textContent = 'Prepare Agent Mail';
    }
  }
}

async function logAgentAction(action, meta = {}) {
  if (!agentDraftState?.entryId) return;
  try {
    await fetch('/api/application-agent/log-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        internshipId: agentDraftState.entryId,
        action,
        meta
      })
    });
  } catch {
    // Non-blocking analytics signal
  }
}

async function applyTonePreset(tonePreset) {
  if (!agentDraftState) return;
  const apiKey = getStoredApiKey();
  if (!apiKey) {
    openApiKeyModal();
    return;
  }

  if (agentToneStatus) agentToneStatus.textContent = 'Updating tone…';
  updateTonePresetButtons(tonePreset);

  try {
    const res = await fetch('/api/application-agent/polish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey,
        company: agentDraftState?.draft?.companyName || '',
        draft: agentDraftState?.draft,
        tonePreset,
        includePortfolioLink: Boolean(agentIncludePortfolioLink?.checked)
      })
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(payload?.error || 'Tone update failed.');

    agentDraftState.draft = {
      ...agentDraftState.draft,
      subject: payload.subject || agentDraftState.draft.subject,
      introLines: Array.isArray(payload.introLines) ? payload.introLines : agentDraftState.draft.introLines,
      bodyLines: Array.isArray(payload.bodyLines) ? payload.bodyLines : agentDraftState.draft.bodyLines,
      body: payload.body || agentDraftState.draft.body,
      warnings: Array.isArray(payload.warnings) ? payload.warnings : agentDraftState.draft.warnings,
      tonePreset: payload.tonePreset || tonePreset
    };
    renderAgentReview();
  } catch (error) {
    if (agentToneStatus) {
      agentToneStatus.textContent = error instanceof Error ? error.message : 'Tone update failed.';
    }
  }
}

async function submitAgentReview(event) {
  event.preventDefault();
  if (!agentDraftState) return;

  const action = selectedAgentAction();
  if (action === 'cancel') {
    await logAgentAction('cancelled', {
      confidence: agentDraftState?.draft?.confidence || 'low',
      reasons: agentDraftState?.draft?.safety?.reasons || []
    });
    closeAgentReview();
    return;
  }

  const to = agentToInput?.value.trim() || '';
  const cc = agentCcInput?.value.trim() || '';
  const subject = agentSubjectInput?.value.trim() || '';
  const body = agentBodyInput?.value || '';
  const includeResume = Boolean(agentIncludeResume?.checked);
  const includeTranscript = Boolean(agentIncludeTranscript?.checked);
  const includePortfolioLink = Boolean(agentIncludePortfolioLink?.checked);
  const safety = agentDraftState?.draft?.safety || { allowDirectSend: false, reasons: [] };

  if (!to || !subject || !body.trim()) {
    if (agentReviewError) {
      agentReviewError.hidden = false;
      agentReviewError.textContent = 'Recipient, subject, and body must be filled before sending.';
    }
    return;
  }

  if (agentReviewSubmit) {
    agentReviewSubmit.disabled = true;
    agentReviewSubmit.textContent = action === 'send' ? 'Sending…' : 'Opening…';
  }

  try {
    if (action === 'draft') {
      await logAgentAction('draft-opened', {
        to,
        subject,
        tonePreset: agentDraftState?.draft?.tonePreset || 'balanced',
        attachmentCombo: [
          includeResume ? 'Resume' : null,
          includeTranscript ? 'Transcript' : null,
          includePortfolioLink ? 'Portfolio link' : null
        ].filter(Boolean).join(' + ') || 'None'
      });
      const mailto = `mailto:${escapeMailtoValue(to)}?subject=${escapeMailtoValue(subject)}&body=${escapeMailtoValue(body)}${cc ? `&cc=${escapeMailtoValue(cc)}` : ''}`;
      window.location.href = mailto;
      closeAgentReview();
      return;
    }

    if (!safety.allowDirectSend) {
      await logAgentAction('send-blocked', {
        reasons: safety.reasons || [],
        confidence: agentDraftState?.draft?.confidence || 'low'
      });
      throw new Error(`Direct send locked: ${(safety.reasons || []).join(' | ') || 'Human-reviewed draft required.'}`);
    }

    const res = await fetch('/api/application-agent/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        internshipId: agentDraftState.entryId,
        to,
        cc,
        subject,
        body,
        includeResume,
        includeTranscript,
        includePortfolioLink,
        confidence: agentDraftState?.draft?.confidence || 'low',
        warnings: agentDraftState?.draft?.warnings || [],
        tonePreset: agentDraftState?.draft?.tonePreset || 'balanced',
        hookType: agentDraftState?.draft?.hookType || 'general'
      })
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(payload?.error || 'Send failed.');
    }

    const entry = getEntryById(agentDraftState.entryId);
    if (entry) {
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
      await Promise.all([loadEntries(), loadActivity(entry.id)]);
    }

    closeAgentReview();
    window.alert(`Message sent. Message ID: ${payload.messageId || 'n/a'}`);
  } catch (error) {
    if (agentReviewError) {
      agentReviewError.hidden = false;
      agentReviewError.textContent = error instanceof Error ? error.message : 'Agent action failed.';
    }
  } finally {
    if (agentReviewSubmit) {
      agentReviewSubmit.disabled = false;
      agentReviewSubmit.textContent = 'Apply decision';
    }
  }
}

async function resumePendingAnalysisAfterKey() {
  const raw = sessionStorage.getItem(PENDING_ANALYZE_KEY);
  if (!raw || !getStoredApiKey()) return;
  sessionStorage.removeItem(PENDING_ANALYZE_KEY);
  let payload = null;
  try {
    payload = JSON.parse(raw);
  } catch {
    return;
  }
  const entryId = payload?.entryId;
  const force = Boolean(payload?.force);
  const entry = entryId != null ? getEntryById(entryId) : null;
  if (!entry) return;
  openDrawer(entry);
  await runAnalysisForEntry(entry, { force });
}

async function resumePendingAgentReviewAfterKey() {
  const raw = sessionStorage.getItem(PENDING_AGENT_REVIEW_KEY);
  if (!raw || !getStoredApiKey()) return false;
  sessionStorage.removeItem(PENDING_AGENT_REVIEW_KEY);
  let payload = null;
  try {
    payload = JSON.parse(raw);
  } catch {
    return false;
  }
  if (!payload?.company) return false;
  navigateToAgentReview(payload);
  return true;
}

/* ============================================================ RENDERING */
function renderFilterChips() {
  if (!filterChips) return;
  filterChips.innerHTML = '';
  const statusFilter = el('statusFilter');
  const items = [
    statusFilter?.value.trim() && { label: statusFilter.value.trim(), clear: () => { statusFilter.value = ''; } },
    countryFilter?.value && { label: countryFilter.value, clear: () => { countryFilter.value = ''; } },
    priorityFilter?.value && { label: priorityFilter.value, clear: () => { priorityFilter.value = ''; } },
    followupOnly && { label: 'Follow-ups', clear: () => { followupOnly = false; } }
  ].filter(Boolean);
  items.forEach((item) => {
    const chip = document.createElement('button');
    chip.className = 'filter-chip active';
    chip.type = 'button';
    chip.textContent = `${item.label} ×`;
    chip.addEventListener('click', () => { item.clear(); renderList(); });
    filterChips.appendChild(chip);
  });
}

function renderStatusCounts() {
  const counts = new Map();
  entries.forEach((entry) => { const key = entry.status || ''; counts.set(key, (counts.get(key) || 0) + 1); });
  statusCountEls.forEach((node) => {
    const key = node.dataset.statusCount || '';
    node.textContent = String(key ? (counts.get(key) || 0) : entries.length);
  });
}

function syncNav() {
  if (!statusNav) return;
  const value = el('statusFilter')?.value?.trim() || '';
  statusNav.querySelectorAll('.sidebar-nav-item').forEach((btn) => {
    btn.classList.toggle('active', (btn.dataset.status || '') === value);
  });
}

function getFilteredEntries() {
  const query = (search?.value || '').trim().toLowerCase();
  const statusQuery = (el('statusFilter')?.value || '').trim().toLowerCase();
  const countryQuery = (countryFilter?.value || '').trim().toLowerCase();
  const priorityQuery = (priorityFilter?.value || '').trim().toLowerCase();
  const filtered = entries.filter((entry) => {
    const matchesQuery = !query || entry.company.toLowerCase().includes(query) || (entry.tag || '').toLowerCase().includes(query) || (entry.notes || '').toLowerCase().includes(query);
    const matchesStatus = !statusQuery || entry.status.toLowerCase() === statusQuery;
    const matchesCountry = !countryQuery || parseCountry(entry.tag).toLowerCase() === countryQuery;
    const matchesPriority = !priorityQuery || String(entry.priority || 'Medium').toLowerCase() === priorityQuery;
    const matchesFollowup = !followupOnly || isFollowupDue(entry.followup_at);
    return matchesQuery && matchesStatus && matchesCountry && matchesPriority && matchesFollowup;
  });
  filtered.sort((a, b) => {
    const prioDiff = (PRIORITY_ORDER[b.priority || 'Medium'] || 0) - (PRIORITY_ORDER[a.priority || 'Medium'] || 0);
    if (prioDiff !== 0) return prioDiff;
    return String(b.id).localeCompare(String(a.id));
  });
  return filtered;
}

function updateEmptyState(filtered) {
  const statusVal = el('statusFilter')?.value?.trim() || '';
  const stage = STAGE_EMPTY[statusVal] || STAGE_EMPTY[''];
  if (emptyIcon) emptyIcon.innerHTML = emptyIconMarkup(stage.icon);
  if (emptyTitle) emptyTitle.textContent = stage.title;
  if (emptySub) emptySub.textContent = stage.sub;
  if (!filtered.length) {
    emptyState?.classList.add('show');
    if (list) list.innerHTML = '';
  } else {
    emptyState?.classList.remove('show');
  }
}

function renderList() {
  if (!list) return;
  const filtered = getFilteredEntries();
  lastFiltered = filtered;
  renderStatusCounts();
  if (count) count.textContent = String(filtered.length);
  if (pageTitle) {
    const statusVal = el('statusFilter')?.value?.trim();
    pageTitle.textContent = statusVal ? `${statusVal}` : 'All entries';
  }
  renderFilterChips();
  syncNav();
  updateEmptyState(filtered);
  if (!filtered.length) return;

  list.innerHTML = '';
  filtered.forEach((entry) => {
    const row = document.createElement('div');
    row.className = 'table-row';
    if (String(activeEntryId) === String(entry.id)) row.classList.add('selected');
    const nextStep = nextStepForEntry(entry);
    const primaryAction = getRowPrimaryAction(entry);
    const locationParts = parseLocationParts(entry.tag);
    const locationPrimary = [locationParts.city, locationParts.country].filter(Boolean).join(', ') || '';
    const notes = entry.notes ? escapeHtml(entry.notes) : '';
    const followupText = entry.followup_at ? `${formatDateLabel(entry.followup_at)} · ${formatDistanceInDays(entry.followup_at)}` : '';
    const appliedText = entry.applied_at ? `Applied ${formatDateLabel(entry.applied_at)}` : '';
    const followupClass = isFollowupDue(entry.followup_at) ? 'meta-chip urgent' : 'meta-chip';
    const priorityText = escapeHtml(entry.priority || 'Medium');
    row.innerHTML = `
      <span class="row-accent priority-${String(entry.priority || 'Medium').toLowerCase()}"></span>
      <div class="row-main">
        <span class="company-cell">
          <span class="company-topline">
            <strong>${escapeHtml(entry.company)}</strong>
            <span class="pill-badge priority-badge priority-${String(entry.priority || 'Medium').toLowerCase()}">${priorityText}</span>
          </span>
          ${locationPrimary ? `<span class="row-location">${escapeHtml(locationPrimary)}</span>` : ''}
          <span class="row-meta-grid">
            ${followupText ? `<span class="${followupClass}">${escapeHtml(followupText)}</span>` : ''}
            ${appliedText ? `<span class="meta-chip">${escapeHtml(appliedText)}</span>` : ''}
          </span>
          ${notes ? `<span class="row-notes">${notes}</span>` : ''}
        </span>
      </div>
      <div class="next-step-cell">
        <span class="next-step-label">Next</span>
        <span class="next-step-title">${escapeHtml(nextStep.title)}</span>
        <span class="next-step-detail">${escapeHtml(nextStep.detail)}</span>
      </div>
      <div class="status-wrap">
        <span class="pill-badge ${statusClass(entry.status)}">${escapeHtml(entry.status || 'Researching')}</span>
        <button class="row-primary-btn" type="button" data-action="open" data-id="${entry.id}" aria-label="Open ${escapeHtml(entry.company)}">
          <span>${primaryAction.label}</span>
          <span class="row-primary-detail">${escapeHtml(primaryAction.detail)}</span>
        </button>
      </div>
    `;
    list.appendChild(row);
  });
}

/* ============================================================ KANBAN BOARD */
function renderBoard() {
  if (!board) return;
  const filtered = getFilteredEntries();
  lastFiltered = filtered;
  renderStatusCounts();
  if (count) count.textContent = String(filtered.length);
  if (pageTitle) {
    const statusVal = el('statusFilter')?.value?.trim();
    pageTitle.textContent = statusVal ? `${statusVal}` : 'All entries';
  }
  renderFilterChips();
  syncNav();

  const byStatus = new Map();
  STATUS_FLOW.forEach((s) => byStatus.set(s, []));
  filtered.forEach((entry) => {
    const s = entry.status || 'Researching';
    if (byStatus.has(s)) byStatus.get(s).push(entry);
    else byStatus.set(s, [entry]);
  });

  board.innerHTML = '';
  const columnsToRender = el('statusFilter')?.value?.trim()
    ? [el('statusFilter').value.trim()]
    : STATUS_FLOW;

  columnsToRender.forEach((status, colIdx) => {
    const items = byStatus.get(status) || [];
    const col = document.createElement('div');
    col.className = 'board-column';
    col.dataset.status = status;
    const emptyInfo = BOARD_EMPTY[status] || { icon: 'inbox', msg: 'No entries here.' };
    const emptyIconInner = items.length === 0
      ? `<div class="board-col-empty"><div class="board-col-empty-icon">${emptyIconMarkup(emptyInfo.icon)}</div>${escapeHtml(emptyInfo.msg)}</div>`
      : '';

    const sc = statusClass(status);
    col.innerHTML = `
      <div class="board-col-header">
        <div class="board-col-pill ${sc}" role="group" aria-label="${escapeHtml(status)} — ${items.length} entries">
          <span class="board-col-pill-dot" aria-hidden="true"></span>
          <span class="board-col-pill-label">${escapeHtml(status)}</span>
          <span class="board-col-pill-count">${items.length}</span>
        </div>
      </div>
      <div class="board-col-cards">
        ${emptyIconInner}
      </div>
    `;

    const cardsContainer = col.querySelector('.board-col-cards');
    items.forEach((entry, i) => {
      const card = document.createElement('div');
      card.className = 'board-card';
      card.style.animationDelay = `${colIdx * 30 + i * 40}ms`;
      card.dataset.id = entry.id;
      const loc = parseLocationParts(entry.tag);
      const locStr = [loc.city, loc.country].filter(Boolean).join(', ');
      const priorityStr = entry.priority || 'Medium';
      card.innerHTML = `
        <div class="board-card-company">${escapeHtml(entry.company)}</div>
        ${locStr ? `<div class="board-card-location">${escapeHtml(locStr)}</div>` : ''}
        <div class="board-card-footer">
          <span class="board-card-badge priority-${priorityStr.toLowerCase()}">${escapeHtml(priorityStr)}</span>
          ${entry.followup_at ? `<span class="board-card-badge ${isFollowupDue(entry.followup_at) ? 'urgent' : ''}">${formatDateLabel(entry.followup_at)}</span>` : ''}
        </div>
      `;
      card.addEventListener('click', () => {
        const found = entries.find((e) => String(e.id) === String(entry.id));
        if (found) openDrawer(found);
      });
      cardsContainer.appendChild(card);
    });

    board.appendChild(col);
  });
}

/* ============================================================ CRUD */
async function saveEntry(event) {
  event.preventDefault();
  const payload = {
    company: companyInput.value.trim(),
    status: 'Researching',
    notes: '',
    website: websiteInput.value.trim(),
    tag: tagInput.value.trim(),
    priority: 'Medium',
    applied_at: '',
    followup_at: '',
    focus_tags: ''
  };
  const id = entryId.value.trim();
  await fetch(id ? `/api/internships/${id}` : '/api/internships', {
    method: id ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  resetForm();
  closeQuickAdd();
  await Promise.all([loadEntries(), loadSavedViews()]);
}

async function saveDrawer(event) {
  event.preventDefault();
  const id = drawerId.value.trim();
  const payload = {
    company: drawerCompany.value.trim(),
    status: drawerStatus.value.trim(),
    notes: drawerNotes.value.trim(),
    website: drawerWebsite.value.trim(),
    tag: drawerTag.value.trim(),
    priority: drawerPriority.value.trim(),
    applied_at: drawerAppliedAt.value,
    followup_at: drawerFollowupAt.value,
    reply_received_at: drawerReplyReceivedAt?.value || '',
    reply_outcome: drawerReplyOutcome?.value || '',
    focus_tags: getFocusTagsFromFieldset(document.querySelector('#drawerTags')).join(',')
  };
  await fetch(`/api/internships/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  await Promise.all([loadEntries(), loadActivity(id)]);
}

async function bulkUpdate(ids, payload) {
  await fetch('/api/internships/bulk-update', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids, ...payload }) });
  await loadEntries();
}

async function bulkDelete(ids) {
  await fetch('/api/internships/bulk-delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids }) });
  activeEntryId = null;
  closeDrawer();
  await loadEntries();
}

function selectedEntryFromEvent(event) {
  const actionEl = event.target.closest('[data-id]');
  const row = event.target.closest('.table-row');
  const id = actionEl?.dataset?.id || row?.querySelector('[data-action="open"]')?.dataset?.id;
  return entries.find((item) => String(item.id) === String(id));
}

async function handleListClick(event) {
  const actionEl = event.target.closest('[data-action]');
  const action = actionEl?.dataset?.action;
  const entry = selectedEntryFromEvent(event);
  if (!entry) return;
  if (action === 'open') { openDrawer(entry); }
}

/* ============================================================ SAVED VIEWS CRUD */
async function saveView() {
  const name = window.prompt('View name?');
  if (!name) return;
  await fetch('/api/saved-views', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: name.trim(), filters: currentFilters(), sort_key: '' }) });
  await loadSavedViews();
}

async function overwriteView(viewId = activeViewId) {
  const view = getSavedViewById(viewId);
  if (!view) return;
  await fetch(`/api/saved-views/${view.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: view.name, filters: currentFilters(), sort_key: '' }) });
  activeViewId = view.id;
  closeSavedViewMenu();
  await loadSavedViews();
}

async function renameView(viewId = activeViewId, nextName = '') {
  const view = getSavedViewById(viewId);
  if (!view) return;
  const cleanName = String(nextName || '').trim();
  if (!cleanName) return;
  await fetch(`/api/saved-views/${view.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: cleanName, filters: view.filters || currentFilters(), sort_key: view.sort_key || '' }) });
  editingSavedViewId = null;
  activeViewId = view.id;
  await loadSavedViews();
}

async function deleteView(viewId = activeViewId) {
  const view = getSavedViewById(viewId);
  if (!view) return;
  if (!window.confirm(`Delete view "${view.name}"?`)) return;
  await fetch(`/api/saved-views/${view.id}`, { method: 'DELETE' });
  activeViewId = null;
  editingSavedViewId = null;
  closeSavedViewMenu();
  await loadSavedViews();
}

function handleSavedViewNavClick(event) {
  const action = event.target?.dataset?.action;
  const viewId = event.target?.dataset?.viewId;
  if (!action || !viewId) return;
  const view = getSavedViewById(viewId);
  if (!view) return;

  if (action === 'apply-view') {
    applySavedView(view);
    return;
  }
  if (action === 'toggle-view-menu') {
    activeViewId = view.id;
    openSavedViewMenuId = String(openSavedViewMenuId) === String(view.id) ? null : String(view.id);
    editingSavedViewId = null;
    renderSavedViewsInSidebar();
    return;
  }
  if (action === 'overwrite-view') {
    overwriteView(view.id);
    return;
  }
  if (action === 'rename-view') {
    activeViewId = view.id;
    startSavedViewRename(view.id);
    return;
  }
  if (action === 'delete-view') {
    activeViewId = view.id;
    deleteView(view.id);
    return;
  }
  if (action === 'cancel-view-rename') {
    editingSavedViewId = null;
    renderSavedViewsInSidebar();
  }
}

async function handleSavedViewNavSubmit(event) {
  const formEl = event.target.closest('[data-view-rename-form]');
  if (!formEl) return;
  event.preventDefault();
  const viewId = formEl.dataset.viewRenameForm;
  const input = formEl.querySelector(`[data-view-rename-input="${viewId}"]`);
  await renameView(viewId, input?.value || '');
}

/* ============================================================ COMMAND PALETTE */
function openCommandPalette() {
  commandPalette?.classList.add('open');
  commandPalette?.setAttribute('aria-hidden', 'false');
  commandInput?.focus();
  renderCommands();
}

function closeCommandPalette() {
  commandPalette?.classList.remove('open');
  commandPalette?.setAttribute('aria-hidden', 'true');
}

// Purpose: Shift+Import = replace-all mode (confirmed); normal = merge / upsert by Id
let importReplaceNext = false;
let importFeedbackClearTimer = 0;

function showImportFeedback(message, isError) {
  if (!importFeedback) return;
  importFeedback.hidden = false;
  importFeedback.textContent = message;
  importFeedback.classList.toggle('is-error', Boolean(isError));
  window.clearTimeout(importFeedbackClearTimer);
  importFeedbackClearTimer = window.setTimeout(() => {
    importFeedback.hidden = true;
    importFeedback.textContent = '';
    importFeedback.classList.remove('is-error');
  }, 6000);
}

function renderCommands() {
  if (!commandList) return;
  const q = (commandInput?.value || '').toLowerCase().trim();
  const countries = buildCountryOptions(entries).slice(0, 8);
  const items = [
    { label: 'Add internship', action: () => { closeCommandPalette(); openQuickAdd(); } },
    { label: 'Open search', action: () => { closeCommandPalette(); openSearch(); } },
    { label: 'Open API key', action: () => { closeCommandPalette(); openApiKeyModal(); } },
    {
      label: 'Import spreadsheet…',
      action: () => {
        closeCommandPalette();
        importReplaceNext = false;
        importFileInput?.click();
      }
    },
    ...countries.map((country) => ({
      label: `Filter: ${country}`,
      action: () => { if (countryFilter) countryFilter.value = country; renderList(); closeCommandPalette(); }
    })),
    ...STATUS_FLOW.map((status) => ({ label: `Show: ${status}`, action: () => { setStatusFilter(status); closeCommandPalette(); } }))
  ].filter((item) => !q || item.label.toLowerCase().includes(q));
  commandList.innerHTML = '';
  items.forEach((item) => {
    const btn = document.createElement('button');
    btn.className = 'command-item';
    btn.type = 'button';
    btn.textContent = item.label;
    btn.addEventListener('click', item.action);
    commandList.appendChild(btn);
  });
}

/* ============================================================ ONBOARDING */
const ONBOARDING_STEPS = [
  {
    icon: 'sun',
    title: 'Welcome to Internship Tracker',
    desc: 'Track your entire internship pipeline — from initial research to offer. Let\'s get you oriented in 30 seconds.'
  },
  {
    icon: 'pin',
    title: 'Add entries to your pipeline',
    desc: 'Click the blue "New entry" button in the sidebar, or press Ctrl+K to open the command palette. Each entry moves through stages: Researching → Ready → Applied → Interview → Offer.'
  },
  {
    icon: 'zap',
    title: 'Power-user shortcuts',
    desc: 'Press / to search instantly. Use the sidebar to filter by stage. Switch to Board view to see your pipeline as a kanban. Saved views now expose a visible three-dot menu for apply, overwrite, rename, and delete.'
  }
];

function showOnboarding() {
  if (localStorage.getItem(onboardingKey)) return;
  onboardingStep = 0;
  onboarding?.setAttribute('aria-hidden', 'false');
  renderOnboardingStep();
}

function renderOnboardingStep() {
  if (!obStep) return;
  const step = ONBOARDING_STEPS[onboardingStep];
  const obIcon = emptyIconMarkup(step.icon || 'pin');
  obStep.innerHTML = `
    <div class="ob-icon">${obIcon}</div>
    <h2 class="ob-title">${step.title}</h2>
    <p class="ob-desc">${step.desc}</p>
  `;
  document.querySelectorAll('.ob-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === onboardingStep);
    dot.classList.toggle('done', i < onboardingStep);
  });
  if (obNext) {
    obNext.textContent = onboardingStep === ONBOARDING_STEPS.length - 1 ? 'Get started' : 'Next';
  }
}

function advanceOnboarding() {
  onboardingStep++;
  if (onboardingStep >= ONBOARDING_STEPS.length) {
    closeOnboarding();
    return;
  }
  renderOnboardingStep();
}

function closeOnboarding() {
  localStorage.setItem(onboardingKey, '1');
  onboarding?.setAttribute('aria-hidden', 'true');
}

/* ============================================================ EVENT BINDINGS */
form?.addEventListener('submit', saveEntry);
drawerForm?.addEventListener('submit', saveDrawer);
list?.addEventListener('click', handleListClick);
savedViewNav?.addEventListener('click', handleSavedViewNavClick);
savedViewNav?.addEventListener('submit', handleSavedViewNavSubmit);
search?.addEventListener('input', renderAll);
el('statusFilter')?.addEventListener('change', renderAll);
statusNav?.addEventListener('click', (event) => {
  const btn = event.target.closest('.sidebar-nav-item[data-status]');
  if (!btn) return;
  activeViewId = null;
  renderSavedViewsInSidebar();
  setStatusFilter(btn.dataset.status || '');
});
countryFilter?.addEventListener('change', renderAll);
priorityFilter?.addEventListener('change', renderAll);
followupChip?.addEventListener('click', () => { followupOnly = !followupOnly; followupChip.classList.toggle('active', followupOnly); renderAll(); });
quickAddBtn?.addEventListener('click', openQuickAdd);
quickAddClose?.addEventListener('click', closeQuickAdd);
cancelBtn?.addEventListener('click', resetForm);
emptyAddBtn?.addEventListener('click', openQuickAdd);
exportBtn?.addEventListener('click', () => { window.location.href = '/api/export'; });
importBtn?.addEventListener('click', (event) => {
  importReplaceNext = event.shiftKey;
  importFileInput?.click();
});
importFileInput?.addEventListener('change', async () => {
  const file = importFileInput.files?.[0];
  importFileInput.value = '';
  if (!file) {
    importReplaceNext = false;
    return;
  }
  let replace = false;
  if (importReplaceNext) {
    if (!window.confirm('Replace ALL internship entries with this file? This cannot be undone.')) {
      importReplaceNext = false;
      return;
    }
    replace = true;
  }
  importReplaceNext = false;
  const fd = new FormData();
  fd.append('file', file);
  if (replace) fd.append('replace', 'true');
  try {
    const res = await fetch('/api/import', { method: 'POST', body: fd });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(payload?.error || 'Import failed.');
    }
    await loadEntries();
    renderAll();
    const n = payload.rowCount ?? 0;
    const msg = (payload.message && String(payload.message)) || '';
    showImportFeedback(msg ? `Imported ${n} row(s). ${msg}` : `Imported ${n} row(s).`);
  } catch (err) {
    showImportFeedback(err instanceof Error ? err.message : 'Import failed.', true);
  }
});
drawerClose?.addEventListener('click', closeDrawer);
drawerCancel?.addEventListener('click', closeDrawer);
drawerDeleteBtn?.addEventListener('click', async () => {
  const entry = getEntryById(activeEntryId);
  if (!entry) return;
  if (!window.confirm(`Delete ${entry.company}?`)) return;
  await bulkDelete([entry.id]);
});
drawerAnalyzeBtn?.addEventListener('click', async () => {
  const entry = getEntryById(activeEntryId);
  if (!entry) return;
  await runAnalysisForEntry(entry, { force: hasCachedAnalysis(entry.id) });
});
prepareAgentBtn?.addEventListener('click', async () => {
  const entry = getEntryById(activeEntryId);
  if (!entry) return;
  await prepareAgentMail(entry);
});
copyMailHookBtn?.addEventListener('click', async () => {
  const payload = getCachedAnalysis(activeEntryId);
  const mailHook = getMailHookText(payload);
  if (!mailHook) return;
  try {
    await navigator.clipboard.writeText(mailHook);
    copyMailHookBtn.textContent = 'Copied';
    window.setTimeout(() => {
      if (copyMailHookBtn) copyMailHookBtn.textContent = 'Copy Mail Hook';
    }, 1400);
  } catch {
    analysisErrors.set(String(activeEntryId), 'Clipboard copy failed. Please copy the text manually.');
    renderAnalysisState(activeEntryId);
  }
});
themeToggleBtn?.addEventListener('click', toggleTheme);
saveViewBtn?.addEventListener('click', saveView);
apiKeyBtn?.addEventListener('click', openApiKeyModal);
apiKeyForm?.addEventListener('submit', saveApiKey);
apiKeyClose?.addEventListener('click', dismissApiKeyModal);
apiKeyCancel?.addEventListener('click', dismissApiKeyModal);
searchTrigger?.addEventListener('click', openSearch);
agentReviewForm?.addEventListener('submit', submitAgentReview);
agentReviewClose?.addEventListener('click', closeAgentReview);
agentReviewCancel?.addEventListener('click', closeAgentReview);
agentIncludeResume?.addEventListener('change', () => renderAgentAssets(agentDraftState?.assets));
agentIncludeTranscript?.addEventListener('change', () => renderAgentAssets(agentDraftState?.assets));
agentIncludePortfolioLink?.addEventListener('change', () => {
  renderAgentAssets(agentDraftState?.assets);
  if (agentToneStatus) {
    agentToneStatus.textContent = 'Portfolio preference updated. Click a tone again to re-polish the email.';
  }
});
agentToneGrid?.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-tone-preset]');
  if (!button) return;
  await applyTonePreset(button.getAttribute('data-tone-preset') || 'balanced');
});
commandInput?.addEventListener('input', renderCommands);
obNext?.addEventListener('click', advanceOnboarding);
obSkip?.addEventListener('click', closeOnboarding);

/* View toggle */
viewToggle?.addEventListener('click', (event) => {
  const btn = event.target.closest('.vt-btn[data-view]');
  if (!btn) return;
  setViewMode(btn.dataset.view);
});

document.addEventListener('keydown', (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    openCommandPalette();
    return;
  }
  if (event.key === '/' && document.activeElement !== search && document.activeElement !== commandInput && !document.activeElement?.closest?.('input, textarea, select')) {
    event.preventDefault();
    openSearch();
    return;
  }
  if (event.key === 'Escape') {
    if (inlineSearch?.getAttribute('aria-hidden') === 'false') { closeSearch(); return; }
    closeQuickAdd();
    closeDrawer();
    closeCommandPalette();
    dismissApiKeyModal();
    closeAgentReview();
    closeRowMenu();
    closeSavedViewMenu();
    if (editingSavedViewId) {
      editingSavedViewId = null;
      renderSavedViewsInSidebar();
    }
  }
});

document.addEventListener('click', (event) => {
  if (!event.target.closest('.row-menu-wrap')) closeRowMenu();
  if (!event.target.closest('.saved-view-row')) {
    let shouldRender = false;
    if (openSavedViewMenuId != null) {
      closeSavedViewMenu();
      shouldRender = true;
    }
    if (editingSavedViewId != null) {
      editingSavedViewId = null;
      shouldRender = true;
    }
    if (shouldRender) renderSavedViewsInSidebar();
  }
});

commandPalette?.addEventListener('click', (event) => {
  if (event.target === commandPalette) closeCommandPalette();
});

apiKeyModal?.addEventListener('click', (event) => {
  if (event.target === apiKeyModal) dismissApiKeyModal();
});

agentReviewModal?.addEventListener('click', (event) => {
  if (event.target === agentReviewModal) closeAgentReview();
});

async function init() {
  try {
    initTheme();
    setViewMode(currentViewMode);
    await Promise.all([loadSavedViews(), loadEntries()]);
    await resumePendingAnalysisAfterKey();
    showOnboarding();
  } catch (err) {
    console.error('Internship Tracker init failed:', err);
  }
}

init();
