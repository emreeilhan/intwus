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
const todoList = document.getElementById('todoList');
const companyList = document.getElementById('companyList');
const countryFilter = document.getElementById('countryFilter');
const topCity = document.getElementById('topCity');
const topCityCount = document.getElementById('topCityCount');
const topCountry = document.getElementById('topCountry');
const topCountryCount = document.getElementById('topCountryCount');
const cityCount = document.getElementById('cityCount');
const cityBars = document.getElementById('cityBars');

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

const STATUS_FLOW = [
  'Researching',
  'Ready to Apply',
  'Applied',
  'Interview',
  'Offer',
  'Rejected',
  'Paused'
];

function parseCountry(tag) {
  if (!tag) return '';
  const raw = String(tag).trim();
  if (!raw) return '';
  const parts = raw.split(/,|\/|;|·/).map((part) => part.trim()).filter(Boolean);
  if (!parts.length) return '';
  return parts[parts.length - 1];
}

function parseCity(tag) {
  if (!tag) return '';
  const raw = String(tag).trim();
  if (!raw) return '';
  const parts = raw.split(/,|\/|;|·/).map((part) => part.trim()).filter(Boolean);
  if (!parts.length) return '';
  return parts[0];
}

function renderCountryFilter() {
  if (!countryFilter) return;
  const countries = Array.from(
    new Set(entries.map((entry) => parseCountry(entry.tag)).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));

  const current = countryFilter.value;
  countryFilter.innerHTML = '<option value=\"\">All countries</option>';
  countries.forEach((country) => {
    const option = document.createElement('option');
    option.value = country;
    option.textContent = country;
    countryFilter.appendChild(option);
  });
  if (current) {
    countryFilter.value = current;
  }
}

function nextStatus(current) {
  const idx = STATUS_FLOW.findIndex(
    (value) => value.toLowerCase() === String(current || '').toLowerCase()
  );
  if (idx === -1) return STATUS_FLOW[0];
  return STATUS_FLOW[(idx + 1) % STATUS_FLOW.length];
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
  const countryQuery = (countryFilter?.value || '').trim().toLowerCase();
  const filtered = entries.filter((entry) => {
    const matchesQuery =
      !query ||
      entry.company.toLowerCase().includes(query) ||
      (entry.tag || '').toLowerCase().includes(query);
    const matchesStatus =
      !statusQuery || entry.status.toLowerCase() === statusQuery;
    const country = parseCountry(entry.tag).toLowerCase();
    const matchesCountry = !countryQuery || country === countryQuery;
    return matchesQuery && matchesStatus && matchesCountry;
  });

  const completenessScore = (entry) => {
    const fields = [entry.company, entry.status, entry.tag, entry.website, entry.notes];
    return fields.reduce((total, value) => {
      return total + (String(value || '').trim().length > 0 ? 1 : 0);
    }, 0);
  };

  filtered.sort((a, b) => {
    const scoreDiff = completenessScore(b) - completenessScore(a);
    if (scoreDiff !== 0) return scoreDiff;
    return String(b.id).localeCompare(String(a.id));
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
  renderTodoList();
  renderCompanyList();
  renderCountryFilter();
  renderDashboard();

  if (!filtered.length) {
    const empty = document.createElement('div');
    empty.className = 'empty';
    empty.textContent = 'No entries yet. Use Quick Add to create your first internship.';
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
    const fitScore = Number(entry.fit_score ?? entry.fitScore ?? 0) || 0;

    row.innerHTML = `
      <div class="cell">
        <strong>${safeCompany}</strong>
        <div class="muted">Updated ${escapeHtml(entry.updated_at)}</div>
      </div>
      <div class="cell">
        <select class="status-pill ${statusClass(entry.status)}" data-action="status-select" data-id="${entry.id}" aria-label="Change status">
          ${STATUS_FLOW.map((status) => {
            const selected = status.toLowerCase() === String(entry.status || '').toLowerCase() ? 'selected' : '';
            return `<option value="${escapeHtml(status)}" ${selected}>${escapeHtml(status)}</option>`;
          }).join('')}
        </select>
      </div>
      <div class="cell">${safeTag ? `<span class="tag-pill">${safeTag}</span>` : '-'}</div>
      <div class="cell"><span class="fit-pill">${fitScore || '-'}</span></div>
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

function countBy(list, getter) {
  const map = new Map();
  list.forEach((item) => {
    const key = getter(item);
    if (!key) return;
    map.set(key, (map.get(key) || 0) + 1);
  });
  return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
}

function renderDashboard() {
  const cityCounts = countBy(entries, (e) => parseCity(e.tag));
  const countryCounts = countBy(entries, (e) => parseCountry(e.tag));

  if (topCity) {
    topCity.textContent = cityCounts[0]?.[0] || '-';
  }
  if (topCityCount) {
    topCityCount.textContent = cityCounts[0] ? `${cityCounts[0][1]} entries` : '0 entries';
  }
  if (topCountry) {
    topCountry.textContent = countryCounts[0]?.[0] || '-';
  }
  if (topCountryCount) {
    topCountryCount.textContent = countryCounts[0] ? `${countryCounts[0][1]} entries` : '0 entries';
  }
  if (cityCount) {
    cityCount.textContent = String(cityCounts.length);
  }

  if (!cityBars) return;
  cityBars.innerHTML = '';
  const max = cityCounts[0]?.[1] || 1;
  cityCounts.slice(0, 6).forEach(([city, count]) => {
    const row = document.createElement('div');
    row.className = 'bar-row';
    row.innerHTML = `<div>${city}</div><div>${count}</div><div class=\"bar-track\"><div class=\"bar-fill\" style=\"width:${Math.round((count / max) * 100)}%\"></div></div>`;
    cityBars.appendChild(row);
  });
}
function renderCompanyList() {
  if (!companyList) return;
  const names = Array.from(
    new Set(entries.map((entry) => entry.company).filter(Boolean).map((name) => name.trim()))
  )
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

  companyList.innerHTML = '';

  if (!names.length) {
    const empty = document.createElement('li');
    empty.className = 'muted';
    empty.textContent = 'No companies yet';
    companyList.appendChild(empty);
    return;
  }

  names.slice(0, 12).forEach((name) => {
    const item = document.createElement('li');
    item.textContent = name;
    companyList.appendChild(item);
  });
}

function renderTodoList() {
  if (!todoList) return;
  const todos = entries.filter((entry) => entry.status.toLowerCase() === 'ready to apply');
  todoList.innerHTML = '';

  if (!todos.length) {
    const empty = document.createElement('div');
    empty.className = 'mini-row';
    empty.innerHTML = '<span class="muted">No to-do items</span><span></span><span></span>';
    todoList.appendChild(empty);
    return;
  }

  todos.slice(0, 6).forEach((entry) => {
    const row = document.createElement('div');
    row.className = 'mini-row';
    const websiteUrl = normalizeUrl(entry.website || '');
    const websiteLabel = escapeHtml(entry.website || '-');
    row.innerHTML = `
      <span>${escapeHtml(entry.company)}</span>
      <span>${websiteUrl ? `<a class="link" href="${websiteUrl}" target="_blank" rel="noreferrer">${websiteLabel}</a>` : '-'}</span>
      <span>${escapeHtml(entry.tag || 'Internship')}</span>
    `;
    todoList.appendChild(row);
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
  closeQuickAdd();
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
    openQuickAdd();
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

async function handleStatusChange(event) {
  const select = event.target.closest('select[data-action="status-select"]');
  if (!select) return;
  const id = select.dataset.id;
  const entry = entries.find((item) => String(item.id) === String(id));
  if (!entry) return;

  const payload = {
    company: entry.company,
    status: select.value,
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

form.addEventListener('submit', saveEntry);
list.addEventListener('click', handleListClick);
list.addEventListener('change', handleStatusChange);
search.addEventListener('input', renderList);
statusFilter.addEventListener('change', renderList);
if (countryFilter) {
  countryFilter.addEventListener('change', renderList);
}
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
