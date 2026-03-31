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
const drawerForm = el('drawerForm');
const drawerId = el('drawerId');
const drawerCompany = el('drawerCompany');
const drawerStatus = el('drawerStatus');
const drawerPriority = el('drawerPriority');
const drawerAppliedAt = el('drawerAppliedAt');
const drawerFollowupAt = el('drawerFollowupAt');
const drawerWebsite = el('drawerWebsite');
const drawerTag = el('drawerTag');
const drawerNotes = el('drawerNotes');
const drawerAnalyzeBtn = el('drawerAnalyzeBtn');
const copyMailHookBtn = el('copyMailHookBtn');
const analysisPanel = el('analysisPanel');
const analysisEmpty = el('analysisEmpty');
const analysisLoading = el('analysisLoading');
const analysisLoadingText = el('analysisLoadingText');
const analysisError = el('analysisError');
const analysisResult = el('analysisResult');
const drawerActivityList = el('activityList');
const activityCount = el('activityCount');
const savedViewSelect = el('savedViewSelect');
const savedViewNav = el('savedViewNav');
const saveViewBtn = el('saveViewBtn');
const applySavedViewBtn = el('applySavedViewBtn');
const overwriteViewBtn = el('overwriteViewBtn');
const renameViewBtn = el('renameViewBtn');
const deleteViewBtn = el('deleteViewBtn');
const savedViewMenu = el('savedViewMenu');
const commandPalette = el('commandPalette');
const commandInput = el('commandInput');
const commandList = el('commandList');
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
const apiKeyBtn = el('apiKeyBtn');
const apiKeyModal = el('apiKeyModal');
const apiKeyForm = el('apiKeyForm');
const apiKeyInput = el('apiKeyInput');
const apiKeyClose = el('apiKeyClose');
const apiKeyCancel = el('apiKeyCancel');
const statusCountEls = Array.from(document.querySelectorAll('[data-status-count]'));

const themeKey = 'staj-theme';
const onboardingKey = 'staj-onboarded';
const viewModeKey = 'staj-viewmode';
const apiKeyStorageKey = 'staj-apikey';
const analysisCacheKey = 'staj-analysis-cache-v1';
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

/* Per-stage empty state content */
const STAGE_EMPTY = {
  '': { icon: '📌', title: 'No applications yet', sub: 'Add your first internship to start tracking your pipeline.' },
  'Researching': { icon: '🔍', title: 'No companies being researched', sub: 'Start exploring roles and companies — add them here as you discover opportunities.' },
  'Ready to Apply': { icon: '✅', title: 'Nothing ready to apply', sub: 'When you\'ve done your research & prep, move entries here to submit.' },
  'Applied': { icon: '📬', title: 'No applications sent yet', sub: 'Once you submit, track them here. Good luck!' },
  'Interview': { icon: '🎯', title: 'No interviews scheduled', sub: 'Keep applying — interviews will come. Prepare notes when they do.' },
  'Offer': { icon: '🎉', title: 'No offers yet', sub: 'Stay focused on the pipeline. Your offer is coming!' },
  'Rejected': { icon: '📝', title: 'No rejections yet', sub: 'Every "no" is one step closer to a "yes." Keep going.' },
  'Paused': { icon: '⏸️', title: 'Nothing paused', sub: 'Use this stage for opportunities you want to revisit later.' }
};

/* Board-level empty messages */
const BOARD_EMPTY = {
  'Researching':    { icon: '🔍', msg: 'Start by adding companies to research.' },
  'Ready to Apply': { icon: '📋', msg: 'Move researched companies here when ready.' },
  'Applied':        { icon: '📬', msg: 'Applications will appear here.' },
  'Interview':      { icon: '🎯', msg: 'Interview invites show up here.' },
  'Offer':          { icon: '🎉', msg: 'Offers land here.' },
  'Rejected':       { icon: '📝', msg: 'Rejections tracked here.' },
  'Paused':         { icon: '⏸️', msg: 'Paused items rest here.' }
};

let entries = [];
let savedViews = [];
let followupOnly = false;
let lastFiltered = [];
let activeEntryId = null;
let activityCache = new Map();
let analysisErrors = new Map();
let rowMenuId = null;
let activeViewId = null;
let currentViewMode = localStorage.getItem(viewModeKey) || 'list';
let onboardingStep = 0;
let analysisLoadingId = null;
let pendingAnalyzeId = null;
let pendingAnalyzeForce = false;

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

function getEntryById(id) {
  return entries.find((item) => String(item.id) === String(id)) || null;
}

function statusClass(status) {
  const value = (status || '').toLowerCase().replace(/\s+/g, '-');
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
  if (status === 'Ready to Apply') return { title: 'Submit application', detail: entry.applied_at ? `Marked for ${formatDateLabel(entry.applied_at)}` : 'Ready to submit.' };
  if (status === 'Applied') return { title: entry.followup_at ? 'Follow up' : 'Wait for response', detail: followupLabel || (entry.applied_at ? `Applied ${formatDateLabel(entry.applied_at)}` : 'Submitted.') };
  if (status === 'Interview') return { title: 'Prepare interview', detail: followupLabel || 'Capture prep notes.' };
  if (status === 'Offer') return { title: 'Review offer', detail: 'Compare before deciding.' };
  if (status === 'Rejected') return { title: 'Archive', detail: 'Keep notes for next pass.' };
  if (status === 'Paused') return { title: 'Revisit later', detail: followupLabel || 'Not active.' };
  return { title: entry.followup_at ? 'Review' : 'Research role fit', detail: followupLabel || 'Validate scope, stack, location.' };
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
  entryId.value = '';
  companyInput.value = '';
  statusInput.value = 'Researching';
  notesInput.value = '';
  websiteInput.value = '';
  tagInput.value = '';
  if (priorityInput) priorityInput.value = 'Medium';
  if (appliedAtInput) appliedAtInput.value = '';
  if (followupAtInput) followupAtInput.value = '';
  applyFocusTagsToFieldset(tagFieldset, []);
}

function openQuickAdd() {
  quickAddPanel?.classList.add('open');
  quickAddPanel?.setAttribute('aria-hidden', 'false');
  companyInput.focus();
}

function closeQuickAdd() {
  quickAddPanel?.classList.remove('open');
  quickAddPanel?.setAttribute('aria-hidden', 'true');
}

function openDrawer(entry) {
  if (!drawerBackdrop || !detailDrawer) return;
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
  drawerWebsite.value = entry.website || '';
  drawerTag.value = entry.tag || '';
  drawerNotes.value = entry.notes || '';
  applyFocusTagsToFieldset(document.querySelector('#drawerTags'), String(entry.focus_tags || '').split(',').map((t) => t.trim()).filter(Boolean));
  renderAnalysisState(entry.id);
  renderActivity(activityCache.get(String(entry.id)) || []);
  loadActivity(entry.id);
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

function applySavedView(view) {
  if (!view) return;
  activeViewId = view.id;
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
    const btn = document.createElement('button');
    btn.className = 'saved-view-item' + (String(activeViewId) === String(view.id) ? ' active' : '');
    btn.type = 'button';
    btn.innerHTML = `<span class="view-icon">◇</span><span class="nav-label">${escapeHtml(view.name)}</span>`;
    btn.addEventListener('click', () => applySavedView(view));
    btn.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      activeViewId = view.id;
      savedViewMenu?.classList.toggle('open');
    });
    savedViewNav.appendChild(btn);
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
  const res = await fetch('/api/saved-views');
  savedViews = await res.json();
  renderSavedViews();
}

async function loadEntries() {
  const res = await fetch('/api/internships');
  entries = await res.json();
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
    const headline = item.event_type === 'created' ? 'Created' : item.event_type === 'deleted' ? 'Deleted' : item.event_type === 'status changed' ? 'Status changed' : item.event_type === 'follow-up changed' ? 'Follow-up changed' : 'Edited';
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
  if (emptyIcon) emptyIcon.textContent = stage.icon;
  if (emptyTitle) emptyTitle.textContent = stage.title;
  if (emptySub) emptySub.textContent = stage.sub;
  if (!filtered.length) {
    emptyState?.classList.add('show');
    list.innerHTML = '';
  } else {
    emptyState?.classList.remove('show');
  }
}

function renderList() {
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
    const websiteUrl = normalizeUrl(entry.website || '');
    const nextStep = nextStepForEntry(entry);
    const locationParts = parseLocationParts(entry.tag);
    const locationPrimary = [locationParts.city, locationParts.country].filter(Boolean).join(', ') || '';
    const notes = entry.notes ? escapeHtml(entry.notes) : '';
    const followupText = entry.followup_at ? `${formatDateLabel(entry.followup_at)} · ${formatDistanceInDays(entry.followup_at)}` : '';
    const appliedText = entry.applied_at ? `Applied ${formatDateLabel(entry.applied_at)}` : '';
    const followupClass = isFollowupDue(entry.followup_at) ? 'meta-chip urgent' : 'meta-chip';
    const priorityText = escapeHtml(entry.priority || 'Medium');
    const menuOpen = String(rowMenuId) === String(entry.id);
    const quickActionLabel = entry.status === 'Applied' ? 'Details' : entry.status === 'Ready to Apply' ? 'Apply' : 'Set applied';
    row.innerHTML = `
      <span class="row-accent priority-${String(entry.priority || 'Medium').toLowerCase()}"></span>
      <button class="row-main" type="button" data-action="open" data-id="${entry.id}">
        <span class="company-cell">
          <span class="company-topline">
            <strong>${escapeHtml(entry.company)}</strong>
            <span class="priority-badge priority-${String(entry.priority || 'Medium').toLowerCase()}">${priorityText}</span>
          </span>
          ${locationPrimary ? `<span class="row-location">${escapeHtml(locationPrimary)}</span>` : ''}
          <span class="row-meta-grid">
            ${followupText ? `<span class="${followupClass}">${escapeHtml(followupText)}</span>` : ''}
            ${appliedText ? `<span class="meta-chip">${escapeHtml(appliedText)}</span>` : ''}
          </span>
          ${notes ? `<span class="row-notes">${notes}</span>` : ''}
        </span>
      </button>
      <div class="next-step-cell">
        <span class="next-step-label">Next</span>
        <span class="next-step-title">${escapeHtml(nextStep.title)}</span>
        <span class="next-step-detail">${escapeHtml(nextStep.detail)}</span>
      </div>
      <div class="status-wrap">
        <select class="status-pill ${statusClass(entry.status)}" data-action="status-select" data-id="${entry.id}" aria-label="Change status">
          ${STATUS_FLOW.map((status) => `<option value="${escapeHtml(status)}" ${status.toLowerCase() === String(entry.status || '').toLowerCase() ? 'selected' : ''}>${escapeHtml(status)}</option>`).join('')}
        </select>
      </div>
      <div class="row-actions">
        ${websiteUrl ? `<a class="row-icon-link" href="${escapeHtml(websiteUrl)}" target="_blank" rel="noreferrer noopener" aria-label="Open website" title="Open website">↗</a>` : ''}
        <button class="ghost-btn" data-action="${entry.status === 'Applied' ? 'edit' : 'applied'}" data-id="${entry.id}" style="font-size:0.6875rem;padding:3px 8px;min-height:24px;">${quickActionLabel}</button>
        <div class="row-menu-wrap">
          <button class="ghost-btn row-menu-trigger" data-action="toggle-menu" data-id="${entry.id}" aria-expanded="${menuOpen ? 'true' : 'false'}" style="font-size:0.8125rem;padding:3px 7px;min-height:24px;">•••</button>
          ${menuOpen ? `<div class="row-menu" role="menu"><button class="menu-item" data-action="edit" data-id="${entry.id}" type="button">Open details</button><button class="menu-item danger" data-action="delete" data-id="${entry.id}" type="button">Delete</button></div>` : ''}
        </div>
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
    const dotClass = statusClass(status);
    const emptyInfo = BOARD_EMPTY[status] || { icon: '📌', msg: 'No entries here.' };

    col.innerHTML = `
      <div class="board-col-header">
        <div class="board-col-title">
          <span class="nav-dot ${dotClass.replace('status-', 'dot-').replace('-to-apply','')}"
                style="width:7px;height:7px;border-radius:50%;background:var(--${dotClass.replace('status-','status-').replace('-to-apply','-ready')});"></span>
          ${escapeHtml(status)}
        </div>
        <span class="board-col-count">${items.length}</span>
      </div>
      <div class="board-col-cards">
        ${items.length === 0 ? `<div class="board-col-empty"><div class="board-col-empty-icon">${emptyInfo.icon}</div>${escapeHtml(emptyInfo.msg)}</div>` : ''}
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
    status: statusInput.value.trim(),
    notes: notesInput.value.trim(),
    website: websiteInput.value.trim(),
    tag: tagInput.value.trim(),
    priority: priorityInput ? priorityInput.value : 'Medium',
    applied_at: appliedAtInput ? appliedAtInput.value : '',
    followup_at: followupAtInput ? followupAtInput.value : '',
    focus_tags: getFocusTagsFromFieldset(tagFieldset).join(',')
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
  const row = event.target.closest('.table-row');
  const id = event.target?.dataset?.id || row?.querySelector('[data-action="open"]')?.dataset?.id;
  return entries.find((item) => String(item.id) === String(id));
}

async function handleListClick(event) {
  const action = event.target?.dataset?.action;
  const entry = selectedEntryFromEvent(event);
  if (action === 'toggle-menu') {
    event.preventDefault();
    event.stopPropagation();
    rowMenuId = String(rowMenuId) === String(event.target.dataset.id) ? null : event.target.dataset.id;
    renderList();
    return;
  }
  if (!entry) return;
  if (action === 'open' || action === 'edit') { openDrawer(entry); return; }
  if (action === 'applied') { await bulkUpdate([entry.id], { status: 'Applied', priority: entry.priority || 'Medium' }); openDrawer(entry); return; }
  if (action === 'delete') { if (window.confirm(`Delete ${entry.company}?`)) await bulkDelete([entry.id]); }
}

async function handleListChange(event) {
  const select = event.target.closest('select[data-action="status-select"]');
  if (!select) return;
  const entry = entries.find((item) => String(item.id) === String(select.dataset.id));
  if (!entry) return;
  await bulkUpdate([entry.id], { status: select.value, priority: entry.priority || 'Medium' });
}

/* ============================================================ SAVED VIEWS CRUD */
async function saveView() {
  const name = window.prompt('View name?');
  if (!name) return;
  await fetch('/api/saved-views', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: name.trim(), filters: currentFilters(), sort_key: '' }) });
  await loadSavedViews();
}

async function overwriteView() {
  const view = selectedSavedView();
  if (!view) return;
  await fetch(`/api/saved-views/${view.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: view.name, filters: currentFilters(), sort_key: '' }) });
  await loadSavedViews();
}

async function renameView() {
  const view = selectedSavedView();
  if (!view) return;
  const nextName = window.prompt('Rename view', view.name);
  if (!nextName) return;
  await fetch(`/api/saved-views/${view.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: nextName.trim(), filters: view.filters || currentFilters(), sort_key: view.sort_key || '' }) });
  await loadSavedViews();
}

async function deleteView() {
  const view = selectedSavedView();
  if (!view) return;
  if (!window.confirm(`Delete view "${view.name}"?`)) return;
  await fetch(`/api/saved-views/${view.id}`, { method: 'DELETE' });
  activeViewId = null;
  await loadSavedViews();
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

function renderCommands() {
  if (!commandList) return;
  const q = (commandInput?.value || '').toLowerCase().trim();
  const countries = buildCountryOptions(entries).slice(0, 8);
  const items = [
    { label: 'Add internship', action: () => { closeCommandPalette(); openQuickAdd(); } },
    { label: 'Open search', action: () => { closeCommandPalette(); openSearch(); } },
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
    emoji: '👋',
    title: 'Welcome to Internship Tracker',
    desc: 'Track your entire internship pipeline — from initial research to offer. Let\'s get you oriented in 30 seconds.'
  },
  {
    emoji: '📌',
    title: 'Add entries to your pipeline',
    desc: 'Click the blue "New entry" button in the sidebar, or press Ctrl+K to open the command palette. Each entry moves through stages: Researching → Ready → Applied → Interview → Offer.'
  },
  {
    emoji: '⚡',
    title: 'Power-user shortcuts',
    desc: 'Press / to search instantly. Use the sidebar to filter by stage. Switch to Board view to see your pipeline as a kanban. Right-click saved views to manage them.'
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
  obStep.innerHTML = `
    <div class="ob-emoji">${step.emoji}</div>
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
form.addEventListener('submit', saveEntry);
drawerForm.addEventListener('submit', saveDrawer);
list.addEventListener('click', handleListClick);
list.addEventListener('change', handleListChange);
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
drawerClose?.addEventListener('click', closeDrawer);
drawerCancel?.addEventListener('click', closeDrawer);
themeToggleBtn?.addEventListener('click', toggleTheme);
saveViewBtn?.addEventListener('click', saveView);
applySavedViewBtn?.addEventListener('click', () => { const view = selectedSavedView(); if (view) applySavedView(view); });
overwriteViewBtn?.addEventListener('click', overwriteView);
renameViewBtn?.addEventListener('click', renameView);
deleteViewBtn?.addEventListener('click', deleteView);
searchTrigger?.addEventListener('click', openSearch);
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
    closeRowMenu();
    savedViewMenu?.classList.remove('open');
  }
});

document.addEventListener('click', (event) => {
  if (!event.target.closest('.row-menu-wrap')) closeRowMenu();
  if (savedViewMenu && !event.target.closest('.saved-view-menu') && !event.target.closest('.saved-view-item')) {
    savedViewMenu.classList.remove('open');
  }
});

commandPalette?.addEventListener('click', (event) => {
  if (event.target === commandPalette) closeCommandPalette();
});

async function init() {
  initTheme();
  setViewMode(currentViewMode);
  await Promise.all([loadSavedViews(), loadEntries()]);
  showOnboarding();
}

init();
