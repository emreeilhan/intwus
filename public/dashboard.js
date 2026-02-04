const dashTopCity = document.getElementById('dashTopCity');
const dashTopCityCount = document.getElementById('dashTopCityCount');
const dashTopCountry = document.getElementById('dashTopCountry');
const dashTopCountryCount = document.getElementById('dashTopCountryCount');
const dashCityCount = document.getElementById('dashCityCount');
const dashCityBars = document.getElementById('dashCityBars');
const dashCountryBars = document.getElementById('dashCountryBars');
const appliedBars = document.getElementById('appliedBars');
const appliedCount = document.getElementById('appliedCount');
const followupList = document.getElementById('followupList');
const dashboardEmpty = document.getElementById('dashboardEmpty');

function parseCountry(tag) {
  if (!tag) return '';
  const parts = String(tag)
    .split(/,|\//)
    .map((p) => p.trim())
    .filter(Boolean);
  return parts[parts.length - 1] || '';
}

function parseCity(tag) {
  if (!tag) return '';
  const parts = String(tag)
    .split(/,|\//)
    .map((p) => p.trim())
    .filter(Boolean);
  return parts[0] || '';
}

function colorFromString(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 78%)`;
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

function renderBars(container, data) {
  if (!container) return;
  container.innerHTML = '';
  const max = data[0]?.[1] || 1;
  data.slice(0, 6).forEach(([label, count]) => {
    const row = document.createElement('div');
    row.className = 'bar-row';
    const color = colorFromString(label);
    row.innerHTML = `<div>${label}</div><div>${count}</div><div class="bar-track"><div class="bar-fill" style="width:${Math.round((count / max) * 100)}%; background:${color}"></div></div>`;
    container.appendChild(row);
  });
}

function renderAppliedByMonth(entries) {
  if (!appliedBars) return;
  const map = new Map();
  entries.forEach((entry) => {
    if (!entry.applied_at) return;
    const date = new Date(entry.applied_at);
    if (Number.isNaN(date.getTime())) return;
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    map.set(key, (map.get(key) || 0) + 1);
  });
  const data = Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  appliedBars.innerHTML = '';
  const max = data.reduce((m, [, count]) => Math.max(m, count), 1);
  data.forEach(([label, count]) => {
    const row = document.createElement('div');
    row.className = 'bar-row';
    row.innerHTML = `<div>${label}</div><div>${count}</div><div class="bar-track"><div class="bar-fill" style="width:${Math.round((count / max) * 100)}%"></div></div>`;
    appliedBars.appendChild(row);
  });
  if (appliedCount) {
    const total = data.reduce((sum, [, count]) => sum + count, 0);
    appliedCount.textContent = `${total} total`;
  }
}

function renderFollowups(entries) {
  if (!followupList) return;
  followupList.innerHTML = '';
  const now = new Date();
  const limit = new Date();
  limit.setDate(now.getDate() + 14);
  const upcoming = entries
    .filter((e) => e.followup_at)
    .map((e) => ({ ...e, date: new Date(e.followup_at) }))
    .filter((e) => !Number.isNaN(e.date.getTime()) && e.date <= limit)
    .sort((a, b) => a.date - b.date)
    .slice(0, 6);

  if (!upcoming.length) {
    const empty = document.createElement('div');
    empty.className = 'mini-row';
    empty.innerHTML = '<span class="muted">No follow-ups</span><span></span><span></span>';
    followupList.appendChild(empty);
    return;
  }

  upcoming.forEach((entry) => {
    const row = document.createElement('div');
    row.className = 'mini-row';
    row.innerHTML = `<span>${entry.company}</span><span>${entry.followup_at}</span><span>${entry.priority || 'Medium'}</span>`;
    followupList.appendChild(row);
  });
}

async function init() {
  const res = await fetch('/api/internships');
  const entries = await res.json();

  if (!entries.length && dashboardEmpty) {
    dashboardEmpty.classList.add('show');
  } else if (dashboardEmpty) {
    dashboardEmpty.classList.remove('show');
  }

  const cityCounts = countBy(entries, (e) => parseCity(e.tag));
  const countryCounts = countBy(entries, (e) => parseCountry(e.tag));

  if (dashTopCity) dashTopCity.textContent = cityCounts[0]?.[0] || '-';
  if (dashTopCityCount) dashTopCityCount.textContent = cityCounts[0] ? `${cityCounts[0][1]} entries` : '0 entries';
  if (dashTopCountry) dashTopCountry.textContent = countryCounts[0]?.[0] || '-';
  if (dashTopCountryCount) dashTopCountryCount.textContent = countryCounts[0] ? `${countryCounts[0][1]} entries` : '0 entries';
  if (dashCityCount) dashCityCount.textContent = String(cityCounts.length);

  renderBars(dashCityBars, cityCounts);
  renderBars(dashCountryBars, countryCounts);
  renderAppliedByMonth(entries);
  renderFollowups(entries);
}

init();
