const form = document.getElementById('entryForm');
const entryId = document.getElementById('entryId');
const companyInput = document.getElementById('company');
const statusInput = document.getElementById('status');
const notesInput = document.getElementById('notes');
const websiteInput = document.getElementById('website');
const tagInput = document.getElementById('tag');
const list = document.getElementById('list');
const count = document.getElementById('count');
const countHero = document.getElementById('countHero');
const appliedCount = document.getElementById('appliedCount');
const interviewCount = document.getElementById('interviewCount');
const search = document.getElementById('search');
const statusFilter = document.getElementById('statusFilter');
const exportBtn = document.getElementById('exportBtn');
const newBtn = document.getElementById('newBtn');
const cancelBtn = document.getElementById('cancelBtn');
const filterChips = document.getElementById('filterChips');
const pageTitle = document.getElementById('pageTitle');
const statusNav = document.getElementById('statusNav');
const themeKey = 'staj-theme';
const quickAddBtn = document.getElementById('quickAddBtn');
const quickAddPanel = document.getElementById('quickAddPanel');
const quickAddClose = document.getElementById('quickAddClose');

let entries = [];

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
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

function resetForm() {
  entryId.value = '';
  companyInput.value = '';
  statusInput.value = 'Researching';
  notesInput.value = '';
  websiteInput.value = '';
  tagInput.value = '';
}

function openQuickAdd() {
  if (!quickAddPanel) return;
  quickAddPanel.classList.add('open');
  quickAddPanel.setAttribute('aria-hidden', 'false');
  companyInput.focus();
}

function closeQuickAdd() {
  if (!quickAddPanel) return;
  quickAddPanel.classList.remove('open');
  quickAddPanel.setAttribute('aria-hidden', 'true');
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

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
}

async function loadEntries() {
  const res = await fetch('/api/internships');
  entries = await res.json();
  renderList();
}

function renderList() {
  const query = search.value.trim().toLowerCase();
  const statusQuery = statusFilter.value.trim().toLowerCase();
  const filtered = entries.filter((entry) => {
    const matchesQuery =
      !query ||
      entry.company.toLowerCase().includes(query) ||
      (entry.tag || '').toLowerCase().includes(query);
    const matchesStatus =
      !statusQuery || entry.status.toLowerCase() === statusQuery;
    return matchesQuery && matchesStatus;
  });

  count.textContent = `${filtered.length} entr${filtered.length === 1 ? 'y' : 'ies'}`;
  if (countHero) countHero.textContent = entries.length;
  if (appliedCount) {
    appliedCount.textContent = entries.filter((e) => e.status.toLowerCase() === 'applied').length;
  }
  if (interviewCount) {
    interviewCount.textContent = entries.filter((e) => e.status.toLowerCase() === 'interview').length;
  }

  list.innerHTML = '';
  renderFilterChips();
  renderTitle();
  syncNav();

  if (!filtered.length) {
    const empty = document.createElement('div');
    empty.className = 'empty';
    empty.textContent = 'No entries yet. Add your first internship on the left.';
    list.appendChild(empty);
    return;
  }

  filtered.forEach((entry) => {
    const row = document.createElement('div');
    row.className = 'table-row';

    const safeCompany = escapeHtml(entry.company);
    const safeNotes = escapeHtml(entry.notes || '');
    const safeTag = escapeHtml(entry.tag || '');
    const safeStatus = escapeHtml(entry.status || '');
    const websiteUrl = normalizeUrl(entry.website || '');
    const websiteLabel = escapeHtml(entry.website || '');

    row.innerHTML = `
      <div class="cell">
        <strong>${safeCompany}</strong>
        <div class="muted">Updated ${escapeHtml(entry.updated_at)}</div>
      </div>
      <div class="cell">
        <span class="status-pill ${statusClass(entry.status)}">${safeStatus}</span>
      </div>
      <div class="cell">${safeTag ? `<span class="tag-pill">${safeTag}</span>` : '-'}</div>
      <div class="cell">
        ${websiteUrl ? `<a class="link" href="${websiteUrl}" target="_blank" rel="noreferrer">${websiteLabel}</a>` : '-'}
      </div>
      <div class="cell">${safeNotes || '-'}</div>
      <div class="cell action-btns">
        <button class="ghost" data-action="applied" data-id="${entry.id}">Applied</button>
        <button class="ghost" data-action="edit" data-id="${entry.id}">Edit</button>
        <button data-action="delete" data-id="${entry.id}">Delete</button>
      </div>
    `;

    list.appendChild(row);
  });
}

function renderTitle() {
  if (!pageTitle) return;
  const value = statusFilter.value.trim();
  pageTitle.textContent = value ? value : 'All';
}

function renderFilterChips() {
  if (!filterChips) return;
  filterChips.innerHTML = '';
  const statusValue = statusFilter.value.trim();
  if (statusValue) {
    const chip = document.createElement('button');
    chip.className = 'pill button';
    chip.type = 'button';
    chip.textContent = `${statusValue} ×`;
    chip.addEventListener('click', () => {
      statusFilter.value = '';
      renderList();
    });
    filterChips.appendChild(chip);
  }
}

function syncNav() {
  if (!statusNav) return;
  const buttons = statusNav.querySelectorAll('button');
  const value = statusFilter.value.trim();
  buttons.forEach((btn) => {
    const match = (btn.dataset.status || '') === value;
    btn.classList.toggle('active', match);
  });
}

async function saveEntry(event) {
  event.preventDefault();
  const payload = {
    company: companyInput.value.trim(),
    status: statusInput.value.trim(),
    notes: notesInput.value.trim(),
    website: websiteInput.value.trim(),
    tag: tagInput.value.trim()
  };

  const id = entryId.value.trim();
  if (id) {
    await fetch(`/api/internships/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } else {
    await fetch('/api/internships', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  }

  resetForm();
  await loadEntries();
}

async function handleListClick(event) {
  const button = event.target.closest('button');
  if (!button) return;
  const action = button.dataset.action;
  const id = button.dataset.id;
  const entry = entries.find((item) => String(item.id) === String(id));
  if (!entry) return;

  if (action === 'edit') {
    entryId.value = entry.id;
    companyInput.value = entry.company;
    statusInput.value = entry.status;
    notesInput.value = entry.notes || '';
    websiteInput.value = entry.website || '';
    tagInput.value = entry.tag || '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (action === 'applied') {
    const payload = {
      company: entry.company,
      status: 'Applied',
      notes: entry.notes || '',
      website: entry.website || '',
      tag: entry.tag || ''
    };
    await fetch(`/api/internships/${entry.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    await loadEntries();
  }

  if (action === 'delete') {
    const ok = window.confirm(`Delete ${entry.company}?`);
    if (!ok) return;
    fetch(`/api/internships/${entry.id}`, { method: 'DELETE' }).then(loadEntries);
  }
}

form.addEventListener('submit', saveEntry);
list.addEventListener('click', handleListClick);
search.addEventListener('input', renderList);
statusFilter.addEventListener('change', renderList);
newBtn.addEventListener('click', resetForm);
cancelBtn.addEventListener('click', resetForm);
exportBtn.addEventListener('click', () => {
  window.location.href = '/api/export';
});

if (quickAddBtn) {
  quickAddBtn.addEventListener('click', openQuickAdd);
}

if (quickAddClose) {
  quickAddClose.addEventListener('click', closeQuickAdd);
}

if (quickAddPanel) {
  quickAddPanel.addEventListener('click', (event) => {
    if (event.target === quickAddPanel) {
      closeQuickAdd();
    }
  });
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeQuickAdd();
});

if (statusNav) {
  statusNav.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;
    statusFilter.value = button.dataset.status || '';
    renderList();
  });
}

resetForm();
loadEntries();

const savedTheme = localStorage.getItem(themeKey);
if (savedTheme === 'dark' || savedTheme === 'light') {
  applyTheme(savedTheme);
}

function handleThemeShortcut(event) {
  if (event.repeat) return;
  if (event.metaKey || event.ctrlKey || event.altKey) return;
  if (event.code === 'KeyT' || event.key.toLowerCase() === 't') {
    toggleTheme();
  }
}

window.addEventListener('keydown', handleThemeShortcut, true);
document.addEventListener('keydown', handleThemeShortcut, true);
