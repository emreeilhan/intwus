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
const tagFieldset = document.querySelector('.tag-fieldset');
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

const themeKey = 'staj-theme';
const STATUS_FLOW = ['Researching', 'Ready to Apply', 'Applied', 'Interview', 'Offer', 'Rejected', 'Paused'];
const PRIORITY_ORDER = { High: 3, Medium: 2, Low: 1 };

let entries = [];
let savedViews = [];
let followupOnly = false;
let lastFiltered = [];
let activeEntryId = null;
let activityCache = new Map();

function escapeHtml(value) {
  return String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function normalizeUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `https://${url}`;
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

function applyTheme(theme) {
  if (!theme) {
    document.documentElement.removeAttribute('data-theme');
    localStorage.removeItem(themeKey);
    return;
  }
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(themeKey, theme);
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
  count.textContent = `${filtered.length} entr${filtered.length === 1 ? 'y' : 'ies'}`;
  pageTitle.textContent = el('statusFilter').value.trim() || 'All';
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
    row.innerHTML = `
      <button class="row-main" type="button" data-action="open" data-id="${entry.id}">
        <span class="company-cell">
          <strong>${escapeHtml(entry.company)}</strong>
          ${entry.tag ? `<span class="row-meta">${escapeHtml(entry.tag)}</span>` : ''}
        </span>
        <span class="status-wrap">
          <select class="status-pill ${statusClass(entry.status)}" data-action="status-select" data-id="${entry.id}" aria-label="Change status">
            ${STATUS_FLOW.map((status) => `<option value="${escapeHtml(status)}" ${status.toLowerCase() === String(entry.status || '').toLowerCase() ? 'selected' : ''}>${escapeHtml(status)}</option>`).join('')}
          </select>
          <span class="priority-dot priority-${String(entry.priority || 'Medium').toLowerCase()}" title="${escapeHtml(entry.priority || 'Medium')}"></span>
        </span>
      </button>
      <div class="row-actions">
        <button class="ghost tiny" data-action="applied" data-id="${entry.id}">Mark Applied</button>
        <button class="ghost tiny" data-action="edit" data-id="${entry.id}">Edit</button>
        <button class="ghost tiny danger" data-action="delete" data-id="${entry.id}">Delete</button>
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
  const items = [
    { label: 'Add internship', action: () => { closeCommandPalette(); openQuickAdd(); } },
    { label: 'Filter country: Turkey', action: () => { const v = Array.from(countryFilter.options).find((opt) => opt.value === 'Turkey'); if (v) countryFilter.value = 'Turkey'; renderList(); closeCommandPalette(); } },
    { label: 'Filter country: Germany', action: () => { const v = Array.from(countryFilter.options).find((opt) => opt.value === 'Germany'); if (v) countryFilter.value = 'Germany'; renderList(); closeCommandPalette(); } },
    ...statusOptions.map((status) => ({ label: `Change status: ${status}`, action: () => { if (activeEntryId) { bulkUpdate([activeEntryId], { status }); closeCommandPalette(); } } }))
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
  if (event.key === 'Escape') {
    closeQuickAdd();
    closeDrawer();
    closeCommandPalette();
    savedViewMenu?.classList.remove('open');
    savedViewMenu?.setAttribute('aria-hidden', 'true');
  }
});

commandPalette?.addEventListener('click', (event) => {
  if (event.target === commandPalette) closeCommandPalette();
});

async function init() {
  applyTheme(localStorage.getItem(themeKey));
  renderActivityFallback();
  await Promise.all([loadSavedViews(), loadEntries()]);
}

init();
