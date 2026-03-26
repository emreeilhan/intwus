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
const pageDescription = el('pageDescription'); // may be null in new HTML
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
const drawerActivityList = el('activityList');
const activityCount = el('activityCount');
const savedViewSelect = el('savedViewSelect');
const savedViewActionBtn = el('savedViewActionBtn');
const savedViewMenu = el('savedViewMenu');
const applySavedViewBtn = el('applySavedViewBtn');
const saveViewBtn = el('saveViewBtn');
const overwriteViewBtn = el('overwriteViewBtn');
const renameViewBtn = el('renameViewBtn');
const deleteViewBtn = el('deleteViewBtn');
const commandPalette = el('commandPalette');
const commandInput = el('commandInput');
const commandList = el('commandList');
const themeToggleBtn = el('themeToggleBtn');
const statusCountEls = Array.from(document.querySelectorAll('[data-status-count]'));
const summaryTracked = el('summaryTracked');
const summaryTrackedSub = el('summaryTrackedSub');
const summaryReady = el('summaryReady');
const summaryReadySub = el('summaryReadySub');
const summaryActive = el('summaryActive');
const summaryActiveSub = el('summaryActiveSub');
const summaryApplied = el('summaryApplied');
const summaryAppliedSub = el('summaryAppliedSub');

const themeKey = 'staj-theme';
const STATUS_FLOW = ['Researching', 'Ready to Apply', 'Applied', 'Interview', 'Offer', 'Rejected', 'Paused'];
const PRIORITY_ORDER = { High: 3, Medium: 2, Low: 1 };

let entries = [];
let savedViews = [];
let followupOnly = false;
let lastFiltered = [];
let activeEntryId = null;
let activityCache = new Map();
let rowMenuId = null;

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
  return {
    city: parts[0] || '',
    country: parts.length > 1 ? parts[parts.length - 1] : ''
  };
}

function buildCountryOptions(items) {
  const options = new Set();
  items.forEach((entry) => {
    const country = parseCountry(entry.tag);
    if (country) options.add(country);
  });
  return Array.from(options).sort((a, b) => a.localeCompare(b));
}

function populateCountryFilterOptions() {
  if (!countryFilter) return;
  const current = countryFilter.value;
  const countries = buildCountryOptions(entries);
  countryFilter.innerHTML = '<option value="">All countries</option>';
  countries.forEach((country) => {
    const option = document.createElement('option');
    option.value = country;
    option.textContent = country;
    countryFilter.appendChild(option);
  });
  if (current && countries.includes(current)) {
    countryFilter.value = current;
  } else {
    countryFilter.value = '';
  }
}

function countBy(list, getter) {
  const map = new Map();
  list.forEach((item) => {
    const key = getter(item);
    if (!key) return;
    map.set(key, (map.get(key) || 0) + 1);
  });
  return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
}

function getFocusTagsFromFieldset(fieldset) {
  if (!fieldset) return [];
  return Array.from(fieldset.querySelectorAll('input[type="checkbox"]:checked')).map((input) => input.value);
}

function applyFocusTagsToFieldset(fieldset, tags) {
  if (!fieldset) return;
  const set = new Set((tags || []).map((t) => t.trim()).filter(Boolean));
  fieldset.querySelectorAll('input[type="checkbox"]').forEach((input) => {
    input.checked = set.has(input.value);
  });
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
  if (status === 'Ready to Apply') {
    return {
      title: 'Submit application',
      detail: entry.applied_at ? `Marked for ${formatDateLabel(entry.applied_at)}` : 'Everything needed is in place.'
    };
  }
  if (status === 'Applied') {
    return {
      title: entry.followup_at ? 'Prepare follow-up' : 'Wait for response',
      detail: followupLabel || (entry.applied_at ? `Applied ${formatDateLabel(entry.applied_at)}` : 'Submission logged.')
    };
  }
  if (status === 'Interview') {
    return {
      title: 'Prepare interview',
      detail: followupLabel || 'Capture prep notes and expected timeline.'
    };
  }
  if (status === 'Offer') {
    return {
      title: 'Review offer',
      detail: 'Compare timing, team, and location before deciding.'
    };
  }
  if (status === 'Rejected') {
    return {
      title: 'Archive learnings',
      detail: 'Keep notes for the next pass.'
    };
  }
  if (status === 'Paused') {
    return {
      title: 'Revisit later',
      detail: followupLabel || 'Not active right now.'
    };
  }
  return {
    title: entry.followup_at ? 'Review before follow-up' : 'Research role fit',
    detail: followupLabel || 'Validate scope, stack, and location.'
  };
}

function renderPipelineSummary(filtered) {
  const activeCount = entries.filter((entry) => ['Researching', 'Ready to Apply', 'Applied', 'Interview'].includes(entry.status)).length;
  const readyCount = entries.filter((entry) => entry.status === 'Ready to Apply' || isFollowupDue(entry.followup_at)).length;
  const appliedCount = entries.filter((entry) => entry.status === 'Applied').length;
  const appliedPct = entries.length ? (appliedCount ? Math.max(1, Math.round((appliedCount / entries.length) * 100)) : 0) : 0;

  if (summaryTracked) summaryTracked.textContent = String(entries.length);
  if (summaryTrackedSub) summaryTrackedSub.textContent = `${filtered.length} in current view`;
  if (summaryReady) summaryReady.textContent = String(readyCount);
  if (summaryReadySub) summaryReadySub.textContent = `${entries.filter((entry) => entry.status === 'Ready to Apply').length} ready, ${entries.filter((entry) => isFollowupDue(entry.followup_at)).length} follow-up soon`;
  if (summaryActive) summaryActive.textContent = String(activeCount);
  if (summaryActiveSub) summaryActiveSub.textContent = `${entries.length ? Math.round((activeCount / entries.length) * 100) : 0}% of tracker still in motion`;
  if (summaryApplied) summaryApplied.textContent = String(appliedCount);
  if (summaryAppliedSub) summaryAppliedSub.textContent = entries.length ? `${appliedPct}% of all tracked roles` : 'No submissions yet';
}

function applyTheme(theme) {
  const resolved = theme || 'dark';
  document.documentElement.setAttribute('data-theme', resolved);
  localStorage.setItem(themeKey, resolved);
  // Update the label span inside the button (if present)
  const themeLabel = document.getElementById('themeLabel');
  if (themeLabel) themeLabel.textContent = resolved === 'dark' ? 'Light' : 'Dark';
  // Fallback: update button text directly if no label span
  else if (themeToggleBtn) themeToggleBtn.textContent = resolved === 'dark' ? 'Light mode' : 'Dark mode';
}

function initTheme() {
  // Default is dark — only override if user explicitly set a preference
  const saved = localStorage.getItem(themeKey);
  applyTheme(saved || 'dark');
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  applyTheme(current === 'dark' ? 'light' : 'dark');
}

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

function currentFilters() {
  return {
    search: search.value.trim(),
    status: el('statusFilter')?.value || '',
    country: countryFilter?.value || '',
    priority: priorityFilter?.value || '',
    followupOnly
  };
}

function selectedSavedView() {
  return savedViews.find((item) => String(item.id) === String(savedViewSelect?.value || ''));
}

function applySavedView(view) {
  if (!view) return;
  const filters = view.filters || {};
  search.value = filters.search || '';
  el('statusFilter').value = filters.status || '';
  if (countryFilter) countryFilter.value = filters.country || '';
  if (priorityFilter) priorityFilter.value = filters.priority || '';
  followupOnly = Boolean(filters.followupOnly);
  renderList();
}

function setStatusFilter(value) {
  const statusFilter = el('statusFilter');
  if (!statusFilter) return;
  statusFilter.value = value || '';
  renderList();
}

function renderSavedViews() {
  if (!savedViewSelect) return;
  const current = savedViewSelect.value;
  savedViewSelect.innerHTML = '<option value="">Saved views</option>';
  savedViews.forEach((view) => {
    const option = document.createElement('option');
    option.value = String(view.id);
    option.textContent = view.name;
    savedViewSelect.appendChild(option);
  });
  savedViewSelect.value = current;
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
  renderList();
}

function safeParseActivityPayload(value) {
  if (value == null || value === '') return null;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
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
  return keys.filter((key) => String(beforeObj[key] ?? '') !== String(afterObj[key] ?? '')).map((field) => ({
    field,
    before: beforeObj[field],
    after: afterObj[field]
  }));
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
            : 'Edited';
    const details = diffs.length
      ? `<div class="timeline-diff-list">${diffs.map((diff) => `
          <div class="timeline-diff-row">
            <span class="timeline-field">${escapeHtml(formatFieldLabel(diff.field))}</span>
            <span class="timeline-old">${escapeHtml(formatActivityValue(diff.before))}</span>
            <span class="timeline-arrow">→</span>
            <span class="timeline-new">${escapeHtml(formatActivityValue(diff.after))}</span>
          </div>
        `).join('')}</div>`
      : `<div class="timeline-values">
          <span><strong>old</strong> ${escapeHtml(formatActivityValue(oldValue))}</span>
          <span><strong>new</strong> ${escapeHtml(formatActivityValue(newValue))}</span>
        </div>`;
    const row = document.createElement('div');
    row.className = 'timeline-item';
    row.innerHTML = `
      <div class="timeline-dot"></div>
      <div class="timeline-body">
        <div class="timeline-top">
          <strong>${escapeHtml(headline)}</strong>
          <span>${escapeHtml(item.created_at)}</span>
        </div>
        ${details}
      </div>
    `;
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

function renderFilterChips() {
  if (!filterChips) return;
  filterChips.innerHTML = '';
  const statusFilter = el('statusFilter');
  const items = [
    statusFilter?.value.trim() && { label: statusFilter.value.trim(), clear: () => { statusFilter.value = ''; } },
    countryFilter?.value && { label: countryFilter.value, clear: () => { countryFilter.value = ''; } },
    priorityFilter?.value && { label: priorityFilter.value, clear: () => { priorityFilter.value = ''; } },
    followupOnly && { label: 'Upcoming Follow-ups', clear: () => { followupOnly = false; } }
  ].filter(Boolean);
  items.forEach((item) => {
    const chip = document.createElement('button');
    chip.className = 'pill button';
    chip.type = 'button';
    chip.textContent = `${item.label} ×`;
    chip.addEventListener('click', () => {
      item.clear();
      renderList();
    });
    filterChips.appendChild(chip);
  });
}

function renderStatusCounts() {
  const counts = new Map();
  entries.forEach((entry) => {
    const key = entry.status || '';
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  statusCountEls.forEach((node) => {
    const key = node.dataset.statusCount || '';
    node.textContent = String(key ? (counts.get(key) || 0) : entries.length);
  });
}

function syncNav() {
  if (!statusNav) return;
  const value = el('statusFilter').value.trim();
  statusNav.querySelectorAll('button').forEach((btn) => {
    btn.classList.toggle('active', (btn.dataset.status || '') === value);
  });
}

function renderList() {
  const query = search.value.trim().toLowerCase();
  const statusQuery = el('statusFilter').value.trim().toLowerCase();
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

  lastFiltered = filtered;
  renderPipelineSummary(filtered);
  renderStatusCounts();
  count.textContent = `${filtered.length} entr${filtered.length === 1 ? 'y' : 'ies'}`;
  pageTitle.textContent = el('statusFilter').value.trim() ? `${el('statusFilter').value.trim()} applications` : 'All applications';
  if (pageDescription) {
    pageDescription.textContent = followupOnly
      ? 'Showing applications that need follow-up attention within the next 7 days.'
      : filtered.length === entries.length
        ? 'Priority-sorted tracker with inline status control and next-step context.'
        : `Filtered view across ${filtered.length} matching applications.`;
  }
  renderFilterChips();
  syncNav();

  if (!filtered.length) {
    emptyState?.classList.add('show');
    list.innerHTML = '';
    return;
  }
  emptyState?.classList.remove('show');

  list.innerHTML = '';
  filtered.forEach((entry) => {
    const row = document.createElement('div');
    row.className = 'table-row';
    if (String(activeEntryId) === String(entry.id)) row.classList.add('selected');
    const websiteUrl = normalizeUrl(entry.website || '');
    const nextStep = nextStepForEntry(entry);
    const locationParts = parseLocationParts(entry.tag);
    const locationPrimary = [locationParts.city, locationParts.country].filter(Boolean).join(', ') || 'Location not added';
    const notes = entry.notes ? escapeHtml(entry.notes) : '';
    const followupText = entry.followup_at ? `${formatDateLabel(entry.followup_at)} · ${formatDistanceInDays(entry.followup_at)}` : '';
    const appliedText = entry.applied_at ? `Applied ${formatDateLabel(entry.applied_at)}` : '';
    const followupClass = isFollowupDue(entry.followup_at) ? 'meta-chip urgent' : 'meta-chip';
    const priorityText = escapeHtml(entry.priority || 'Medium');
    const menuOpen = String(rowMenuId) === String(entry.id);
    const quickActionLabel = entry.status === 'Applied' ? 'Open details' : entry.status === 'Ready to Apply' ? 'Start application' : 'Set applied';
    row.innerHTML = `
      <span class="row-accent priority-${String(entry.priority || 'Medium').toLowerCase()}"></span>
      <button class="row-main" type="button" data-action="open" data-id="${entry.id}">
        <span class="company-cell">
          <span class="company-topline">
            <strong>${escapeHtml(entry.company)}</strong>
            <span class="priority-badge priority-${String(entry.priority || 'Medium').toLowerCase()}">${priorityText} priority</span>
          </span>
          <span class="row-location">${escapeHtml(locationPrimary)}</span>
          <span class="row-meta-grid">
            ${followupText ? `<span class="${followupClass}">${escapeHtml(followupText)}</span>` : ''}
            ${appliedText ? `<span class="meta-chip">${escapeHtml(appliedText)}</span>` : ''}
            ${entry.tag && locationPrimary !== entry.tag ? `<span class="meta-chip">${escapeHtml(entry.tag)}</span>` : ''}
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
        <span class="status-label">Stage</span>
        <select class="status-pill ${statusClass(entry.status)}" data-action="status-select" data-id="${entry.id}" aria-label="Change status">
          ${STATUS_FLOW.map((status) => `<option value="${escapeHtml(status)}" ${status.toLowerCase() === String(entry.status || '').toLowerCase() ? 'selected' : ''}>${escapeHtml(status)}</option>`).join('')}
        </select>
      </div>
      <div class="row-actions">
        ${websiteUrl ? `<a class="row-icon-link" href="${escapeHtml(websiteUrl)}" target="_blank" rel="noreferrer noopener" aria-label="Open company website" title="Open website">↗</a>` : ''}
        <button class="ghost tiny row-quick-action" data-action="${entry.status === 'Applied' ? 'edit' : 'applied'}" data-id="${entry.id}">${quickActionLabel}</button>
        <div class="row-menu-wrap">
          <button class="ghost tiny row-menu-trigger" data-action="toggle-menu" data-id="${entry.id}" aria-expanded="${menuOpen ? 'true' : 'false'}" aria-label="More actions">•••</button>
          ${menuOpen ? `
            <div class="row-menu" role="menu">
              <button class="menu-item" data-action="edit" data-id="${entry.id}" type="button">Open details</button>
              <button class="menu-item danger" data-action="delete" data-id="${entry.id}" type="button">Delete entry</button>
            </div>
          ` : ''}
        </div>
      </div>
    `;
    list.appendChild(row);
  });
}

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
  await fetch(`/api/internships/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  await Promise.all([loadEntries(), loadActivity(id)]);
}

async function bulkUpdate(ids, payload) {
  await fetch('/api/internships/bulk-update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids, ...payload })
  });
  await loadEntries();
}

async function bulkDelete(ids) {
  await fetch('/api/internships/bulk-delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids })
  });
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

  if (action === 'open') {
    openDrawer(entry);
    return;
  }
  if (action === 'edit') {
    openDrawer(entry);
    return;
  }
  if (action === 'applied') {
    await bulkUpdate([entry.id], { status: 'Applied', priority: entry.priority || 'Medium' });
    openDrawer(entry);
    return;
  }
  if (action === 'delete') {
    if (window.confirm(`Delete ${entry.company}?`)) await bulkDelete([entry.id]);
  }
}

async function handleListChange(event) {
  const select = event.target.closest('select[data-action="status-select"]');
  if (!select) return;
  const entry = entries.find((item) => String(item.id) === String(select.dataset.id));
  if (!entry) return;
  await bulkUpdate([entry.id], { status: select.value, priority: entry.priority || 'Medium' });
}

async function saveView() {
  const name = window.prompt('Saved view name?');
  if (!name) return;
  await fetch('/api/saved-views', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: name.trim(), filters: currentFilters(), sort_key: '' })
  });
  await loadSavedViews();
}

async function overwriteView() {
  const view = selectedSavedView();
  if (!view) return;
  await fetch(`/api/saved-views/${view.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: view.name, filters: currentFilters(), sort_key: '' })
  });
  await loadSavedViews();
}

async function renameView() {
  const view = selectedSavedView();
  if (!view) return;
  const nextName = window.prompt('Rename saved view', view.name);
  if (!nextName) return;
  await fetch(`/api/saved-views/${view.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: nextName.trim(), filters: view.filters || currentFilters(), sort_key: view.sort_key || '' })
  });
  await loadSavedViews();
}

async function deleteView() {
  const view = selectedSavedView();
  if (!view) return;
  if (!window.confirm(`Delete saved view "${view.name}"?`)) return;
  await fetch(`/api/saved-views/${view.id}`, { method: 'DELETE' });
  await loadSavedViews();
}

function renderActivityFallback() {
  if (!drawerActivityList) return;
  drawerActivityList.innerHTML = '<div class="timeline-empty">Open a record to see its activity.</div>';
}

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
  const statusOptions = ['Applied', 'Interview', 'Offer', 'Rejected'];
  const countries = buildCountryOptions(entries).slice(0, 8);
  const items = [
    { label: 'Add internship', action: () => { closeCommandPalette(); openQuickAdd(); } },
    ...countries.map((country) => ({
      label: `Filter country: ${country}`,
      action: () => {
        const v = Array.from(countryFilter.options).find((opt) => opt.value === country);
        if (v) countryFilter.value = country;
        renderList();
        closeCommandPalette();
      }
    })),
    ...statusOptions.map((status) => ({ label: `Change status: ${status}`, action: async () => { if (activeEntryId) { await bulkUpdate([activeEntryId], { status }); closeCommandPalette(); openDrawer(entries.find((item) => String(item.id) === String(activeEntryId))); } } }))
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

form.addEventListener('submit', saveEntry);
drawerForm.addEventListener('submit', saveDrawer);
list.addEventListener('click', handleListClick);
list.addEventListener('change', handleListChange);
search.addEventListener('input', renderList);
el('statusFilter').addEventListener('change', renderList);
statusNav?.addEventListener('click', (event) => {
  const btn = event.target.closest('button[data-status]');
  if (!btn) return;
  setStatusFilter(btn.dataset.status || '');
});
countryFilter?.addEventListener('change', renderList);
priorityFilter?.addEventListener('change', renderList);
followupChip?.addEventListener('click', () => { followupOnly = !followupOnly; renderList(); });
quickAddBtn?.addEventListener('click', openQuickAdd);
quickAddClose?.addEventListener('click', closeQuickAdd);
cancelBtn?.addEventListener('click', resetForm);
emptyAddBtn?.addEventListener('click', openQuickAdd);
exportBtn.addEventListener('click', () => { window.location.href = '/api/export'; });
drawerClose?.addEventListener('click', closeDrawer);
drawerCancel?.addEventListener('click', closeDrawer);
savedViewSelect?.addEventListener('change', () => {
  const view = selectedSavedView();
  if (view) applySavedView(view);
});
savedViewActionBtn?.addEventListener('click', () => {
  const open = savedViewMenu.classList.toggle('open');
  savedViewMenu.setAttribute('aria-hidden', open ? 'false' : 'true');
});
themeToggleBtn?.addEventListener('click', toggleTheme);
applySavedViewBtn?.addEventListener('click', () => {
  const view = selectedSavedView();
  if (view) applySavedView(view);
});
saveViewBtn?.addEventListener('click', saveView);
overwriteViewBtn?.addEventListener('click', overwriteView);
renameViewBtn?.addEventListener('click', renameView);
deleteViewBtn?.addEventListener('click', deleteView);
commandInput?.addEventListener('input', renderCommands);

document.addEventListener('keydown', (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    openCommandPalette();
    return;
  }
  if (event.key === '/' && document.activeElement !== search && document.activeElement !== commandInput) {
    event.preventDefault();
    search.focus();
    return;
  }
  if (event.key.toLowerCase() === 'e' && !event.metaKey && !event.ctrlKey && !event.altKey && activeEntryId) {
    const entry = entries.find((item) => String(item.id) === String(activeEntryId));
    if (entry) openDrawer(entry);
  }
  if (event.key.toLowerCase() === 'a' && !event.metaKey && !event.ctrlKey && !event.altKey && activeEntryId) {
    const entry = entries.find((item) => String(item.id) === String(activeEntryId));
    if (entry && entry.status !== 'Applied') {
      bulkUpdate([entry.id], { status: 'Applied', priority: entry.priority || 'Medium' }).then(() => openDrawer(entry));
    }
  }
  if (event.key === 'Escape') {
    closeQuickAdd();
    closeDrawer();
    closeCommandPalette();
    closeRowMenu();
    savedViewMenu?.classList.remove('open');
    savedViewMenu?.setAttribute('aria-hidden', 'true');
  }
});

document.addEventListener('click', (event) => {
  if (!event.target.closest('.row-menu-wrap')) closeRowMenu();
});

commandPalette?.addEventListener('click', (event) => {
  if (event.target === commandPalette) closeCommandPalette();
});

async function init() {
  initTheme();
  renderActivityFallback();
  await Promise.all([loadSavedViews(), loadEntries()]);
}

init();
