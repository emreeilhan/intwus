const dashTopCity = document.getElementById('dashTopCity');
const dashTopCityCount = document.getElementById('dashTopCityCount');
const dashTopCountry = document.getElementById('dashTopCountry');
const dashTopCountryCount = document.getElementById('dashTopCountryCount');
const dashCityCount = document.getElementById('dashCityCount');
const dashAppliedRate = document.getElementById('dashAppliedRate');
const dashAppliedRateSub = document.getElementById('dashAppliedRateSub');
const dashFollowupDue = document.getElementById('dashFollowupDue');
const dashCityBars = document.getElementById('dashCityBars');
const dashCountryBars = document.getElementById('dashCountryBars');
const appliedBars = document.getElementById('appliedBars');
const appliedCount = document.getElementById('appliedCount');
const followupList = document.getElementById('followupList');
const dashboardEmpty = document.getElementById('dashboardEmpty');
const trendChart = document.getElementById('trendChart');
const statusMix = document.getElementById('statusMix');
const priorityMix = document.getElementById('priorityMix');
const geoSpread = document.getElementById('geoSpread');
const statusMixTotal = document.getElementById('statusMixTotal');
const priorityMixTotal = document.getElementById('priorityMixTotal');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const themeKey = 'staj-theme';
const statusDonut = document.getElementById('statusDonut');
const statusDonutKpi = document.getElementById('statusDonutKpi');
const priorityHeat = document.getElementById('priorityHeat');
const momentumBars = document.getElementById('momentumBars');
const leadTimeBars = document.getElementById('leadTimeBars');
const statusFlowStack = document.getElementById('statusFlowStack');
const calendarHeatmap = document.getElementById('calendarHeatmap');

const STATUS_FLOW = ['Researching', 'Ready to Apply', 'Applied', 'Interview', 'Offer', 'Rejected', 'Paused'];
const PRIORITY_FLOW = ['High', 'Medium', 'Low'];

function parseCountry(tag) {
  if (!tag) return '';
  const parts = String(tag).split(/,|\/|;|·/).map((p) => p.trim()).filter(Boolean);
  return parts[parts.length - 1] || '';
}

function parseCity(tag) {
  if (!tag) return '';
  const parts = String(tag).split(/,|\/|;|·/).map((p) => p.trim()).filter(Boolean);
  return parts[0] || '';
}

function colorFromString(value, alpha = 1) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) hash = value.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash) % 360;
  return `hsla(${hue}, 42%, 52%, ${alpha})`;
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

function toMonthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function formatMonthLabel(key) {
  const [year, month] = key.split('-').map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

function applyTheme(theme) {
  if (!theme) {
    document.documentElement.removeAttribute('data-theme');
    localStorage.removeItem(themeKey);
    if (themeToggleBtn) themeToggleBtn.textContent = 'Dark mode';
    return;
  }
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(themeKey, theme);
  if (themeToggleBtn) themeToggleBtn.textContent = theme === 'dark' ? 'Light mode' : 'Dark mode';
}

function initTheme() {
  const saved = localStorage.getItem(themeKey);
  const preferred = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  applyTheme(saved || preferred);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  applyTheme(current === 'dark' ? 'light' : 'dark');
}

function renderBars(container, data, limit = 6) {
  if (!container) return;
  container.innerHTML = '';
  const max = data[0]?.[1] || 1;
  data.slice(0, limit).forEach(([label, count]) => {
    const row = document.createElement('div');
    row.className = 'bar-row';
    row.innerHTML = `<div>${label}</div><div>${count}</div><div class="bar-track"><div class="bar-fill" style="width:${Math.round((count / max) * 100)}%; background:${colorFromString(label, 0.45)}"></div></div>`;
    container.appendChild(row);
  });
}

function renderProgressMix(container, data, total) {
  if (!container) return;
  container.innerHTML = '';
  const max = data[0]?.[1] || 1;
  data.forEach(([label, count]) => {
    const row = document.createElement('div');
    row.className = 'mix-row';
    row.innerHTML = `
      <div class="mix-label">${label}</div>
      <div class="mix-track"><div class="mix-fill" style="width:${Math.round((count / max) * 100)}%; background:${colorFromString(label, 0.55)}"></div></div>
      <div>${total ? Math.round((count / total) * 100) : 0}%</div>
    `;
    container.appendChild(row);
  });
}

function renderTrendChart(container, series) {
  if (!container) return;
  const width = 640;
  const height = 220;
  const padX = 24;
  const padY = 24;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;
  const max = Math.max(1, ...series.map((item) => item.count));
  const step = series.length > 1 ? innerW / (series.length - 1) : innerW;
  const points = series.map((item, index) => {
    const x = padX + index * step;
    const y = padY + innerH - (item.count / max) * innerH;
    return { x, y, ...item };
  });
  const areaPath = points.length ? `M ${points[0].x} ${height - padY} ${points.map((p) => `L ${p.x} ${p.y}`).join(' ')} L ${points[points.length - 1].x} ${height - padY} Z` : '';
  const linePath = points.map((p, index) => `${index === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const gridLines = [0.25, 0.5, 0.75].map((ratio) => `<line x1="${padX}" y1="${padY + innerH * ratio}" x2="${width - padX}" y2="${padY + innerH * ratio}" />`).join('');
  const labels = points.map((p) => `<text x="${p.x}" y="${height - 6}" text-anchor="middle">${p.label}</text>`).join('');
  const dots = points.map((p) => `<circle cx="${p.x}" cy="${p.y}" r="3.5" />`).join('');
  container.innerHTML = `
    <defs>
      <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="rgba(17,24,39,0.18)" />
        <stop offset="100%" stop-color="rgba(17,24,39,0)" />
      </linearGradient>
    </defs>
    <g>${gridLines}</g>
    ${areaPath ? `<path d="${areaPath}" fill="url(#trendFill)" />` : ''}
    ${linePath ? `<path d="${linePath}" fill="none" stroke="rgba(17,24,39,0.82)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />` : ''}
    ${dots}
    ${labels}
  `;
}

function renderStatusDonut(container, data) {
  if (!container) return;
  const total = data.reduce((sum, [, count]) => sum + count, 0) || 1;
  const radius = 70;
  const center = 110;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  const arcs = data.map(([label, count], index) => {
    const pct = count / total;
    const stroke = colorFromString(label, 0.9);
    const dash = pct * circumference;
    const segment = `<circle r="${radius}" cx="${center}" cy="${center}" fill="none" stroke="${stroke}" stroke-width="28" stroke-dasharray="${dash} ${circumference}" stroke-dashoffset="${-offset}" transform="rotate(-90 ${center} ${center})" />`;
    offset += dash;
    return segment;
  }).join('');
  container.innerHTML = `
    <circle r="${radius}" cx="${center}" cy="${center}" fill="none" stroke="rgba(17,24,39,0.06)" stroke-width="28" />
    ${arcs}
  `;
  if (statusDonutKpi) statusDonutKpi.textContent = String(total);
}

function renderHeatmap(container, data) {
  if (!container) return;
  const max = Math.max(1, ...data.map(([, count]) => count));
  container.innerHTML = '';
  data.forEach(([label, count]) => {
    const cell = document.createElement('div');
    cell.className = 'heat-cell';
    const opacity = 0.12 + (count / max) * 0.68;
    cell.innerHTML = `
      <div class="heat-label">${label}</div>
      <div class="heat-value">${count}</div>
      <div class="heat-fill"><div style="width:100%; background:${colorFromString(label, opacity)}"></div></div>
    `;
    container.appendChild(cell);
  });
}

function renderMomentumBars(container, months) {
  if (!container) return;
  container.innerHTML = '';
  months.forEach(({ label, applied, total }) => {
    const row = document.createElement('div');
    row.className = 'momentum-row';
    row.innerHTML = `
      <div>${label}</div>
      <div class="momentum-track">
        <div class="momentum-applied" style="width:${total ? Math.round((applied / total) * 100) : 0}%; background:rgba(17,24,39,0.75)"></div>
        <div class="momentum-total" style="width:${Math.max(4, Math.round((total / Math.max(...months.map((m) => m.total), 1)) * 100))}%; background:${colorFromString(label, 0.22)}"></div>
      </div>
      <div>${applied}/${total}</div>
    `;
    container.appendChild(row);
  });
}

function renderStackedFlow(container, statuses) {
  if (!container) return;
  container.innerHTML = '';
  statuses.slice(0, 5).forEach(([label, count]) => {
    const row = document.createElement('div');
    row.className = 'stacked-bar-item';
    const cityMap = new Map();
    countryEntries.forEach((entry) => {
      if ((entry.status || 'Unknown') !== label) return;
      const city = parseCity(entry.tag) || 'Unknown';
      cityMap.set(city, (cityMap.get(city) || 0) + 1);
    });
    const cityData = Array.from(cityMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 3);
    const total = cityData.reduce((sum, [, c]) => sum + c, 0) || 1;
    const segments = cityData.map(([city, c]) => `<div class="stacked-bar-seg" title="${city}: ${c}" style="width:${Math.max(8, Math.round((c / total) * 100))}%; background:${colorFromString(city, 0.45)}"></div>`).join('');
    row.innerHTML = `
      <div class="stacked-bar-head"><span>${label}</span><span>${count}</span></div>
      <div class="stacked-bar-track">${segments}</div>
    `;
    container.appendChild(row);
  });
}

function renderGeoSpread(container, countries) {
  if (!container) return;
  container.innerHTML = '';
  countries.slice(0, 6).forEach(([country, total]) => {
    const row = document.createElement('div');
    row.className = 'stack-item';
    const cityMap = new Map();
    countryEntries.forEach((entry) => {
      if (parseCountry(entry.tag) !== country) return;
      const city = parseCity(entry.tag) || 'Unknown';
      cityMap.set(city, (cityMap.get(city) || 0) + 1);
    });
    const cityData = Array.from(cityMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 4);
    const totalCity = cityData.reduce((sum, [, count]) => sum + count, 0) || 1;
    const segments = cityData.map(([city, count]) => `<div class="stack-seg" title="${city}: ${count}" style="width:${Math.max(8, Math.round((count / totalCity) * 100))}%; background:${colorFromString(city, 0.45)}"></div>`).join('');
    row.innerHTML = `<header><span>${country}</span><span>${total}</span></header><div class="stack-track">${segments}</div>`;
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
    const key = toMonthKey(date);
    map.set(key, (map.get(key) || 0) + 1);
  });
  const data = Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  appliedBars.innerHTML = '';
  const max = data.reduce((m, [, count]) => Math.max(m, count), 1);
  data.slice(-12).forEach(([label, count]) => {
    const row = document.createElement('div');
    row.className = 'bar-row';
    row.innerHTML = `<div>${formatMonthLabel(label)}</div><div>${count}</div><div class="bar-track"><div class="bar-fill" style="width:${Math.round((count / max) * 100)}%"></div></div>`;
    appliedBars.appendChild(row);
  });
  if (appliedCount) {
    const total = data.reduce((sum, [, count]) => sum + count, 0);
    appliedCount.textContent = `${total} total`;
  }
  renderTrendChart(trendChart, data.slice(-12).map(([label, count]) => ({ label: label.slice(5), count })));
}

function renderCalendarHeatmap(container, entries) {
  if (!container) return;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(today);
  start.setDate(start.getDate() - 83);
  const counts = new Map();
  entries.forEach((entry) => {
    const dateValue = entry.applied_at || entry.created_at;
    if (!dateValue) return;
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return;
    const key = toMonthKey(date) + `-${String(date.getDate()).padStart(2, '0')}`;
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  const days = [];
  for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }
  const max = Math.max(1, ...days.map((day) => counts.get(`${toMonthKey(day)}-${String(day.getDate()).padStart(2, '0')}`) || 0));
  const weeks = [];
  let currentWeek = [];
  const offset = (start.getDay() + 6) % 7;
  for (let i = 0; i < offset; i += 1) currentWeek.push(null);
  days.forEach((day) => {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });
  if (currentWeek.length) {
    while (currentWeek.length < 7) currentWeek.push(null);
    weeks.push(currentWeek);
  }
  container.innerHTML = '';
  weeks.forEach((week) => {
    const weekCol = document.createElement('div');
    weekCol.className = 'calendar-week';
    week.forEach((day) => {
      const cell = document.createElement('div');
      cell.className = 'calendar-cell';
      if (!day) {
        cell.classList.add('empty');
      } else {
        const key = `${toMonthKey(day)}-${String(day.getDate()).padStart(2, '0')}`;
        const count = counts.get(key) || 0;
        const level = Math.min(4, Math.floor((count / max) * 5));
        cell.dataset.level = String(level);
        cell.title = `${day.toISOString().slice(0, 10)}: ${count} items`;
      }
      weekCol.appendChild(cell);
    });
    container.appendChild(weekCol);
  });
}

function renderLeadTime(entries) {
  if (!leadTimeBars) return;
  const buckets = [
    { label: '0-7d', min: 0, max: 7 },
    { label: '8-14d', min: 8, max: 14 },
    { label: '15-30d', min: 15, max: 30 },
    { label: '31+d', min: 31, max: Infinity }
  ].map((bucket) => ({ ...bucket, count: 0 }));
  entries.forEach((entry) => {
    if (!entry.applied_at || !entry.followup_at) return;
    const a = new Date(entry.applied_at);
    const f = new Date(entry.followup_at);
    if (Number.isNaN(a.getTime()) || Number.isNaN(f.getTime())) return;
    const diff = Math.max(0, Math.round((f - a) / (1000 * 60 * 60 * 24)));
    const bucket = buckets.find((b) => diff >= b.min && diff <= b.max);
    if (bucket) bucket.count += 1;
  });
  leadTimeBars.innerHTML = '';
  const max = Math.max(1, ...buckets.map((b) => b.count));
  buckets.forEach((bucket) => {
    const row = document.createElement('div');
    row.className = 'bar-row';
    row.innerHTML = `<div>${bucket.label}</div><div>${bucket.count}</div><div class="bar-track"><div class="bar-fill" style="width:${Math.round((bucket.count / max) * 100)}%; background:${colorFromString(bucket.label, 0.5)}"></div></div>`;
    leadTimeBars.appendChild(row);
  });
}

function renderMomentum(entries) {
  if (!momentumBars) return;
  const monthsMap = new Map();
  entries.forEach((entry) => {
    if (!entry.applied_at) return;
    const date = new Date(entry.applied_at);
    if (Number.isNaN(date.getTime())) return;
    const key = toMonthKey(date);
    if (!monthsMap.has(key)) monthsMap.set(key, { applied: 0, total: 0 });
    monthsMap.get(key).total += 1;
    if ((entry.status || '').toLowerCase() === 'applied') monthsMap.get(key).applied += 1;
  });
  const months = Array.from(monthsMap.entries()).sort((a, b) => a[0].localeCompare(b[0])).slice(-8).map(([key, val]) => ({
    label: formatMonthLabel(key),
    applied: val.applied,
    total: val.total
  }));
  renderMomentumBars(momentumBars, months);
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

  if (dashFollowupDue) dashFollowupDue.textContent = String(upcoming.length);

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

function renderPriorityHeat(entries) {
  if (!priorityHeat) return;
  const statusCounts = countBy(entries, (e) => e.status || 'Unknown');
  const priorityCounts = countBy(entries, (e) => e.priority || 'Medium');
  const data = [
    ['High', priorityCounts.find(([label]) => label === 'High')?.[1] || 0],
    ['Medium', priorityCounts.find(([label]) => label === 'Medium')?.[1] || 0],
    ['Low', priorityCounts.find(([label]) => label === 'Low')?.[1] || 0],
    ['Applied', statusCounts.find(([label]) => label === 'Applied')?.[1] || 0],
    ['Interview', statusCounts.find(([label]) => label === 'Interview')?.[1] || 0],
    ['Offer', statusCounts.find(([label]) => label === 'Offer')?.[1] || 0]
  ];
  renderHeatmap(priorityHeat, data);
}

let countryEntries = [];

async function init() {
  initTheme();
  const res = await fetch('/api/internships');
  const entries = await res.json();

  if (!entries.length && dashboardEmpty) dashboardEmpty.classList.add('show');
  else if (dashboardEmpty) dashboardEmpty.classList.remove('show');

  const cityCounts = countBy(entries, (e) => parseCity(e.tag));
  const countryCounts = countBy(entries, (e) => parseCountry(e.tag));
  countryEntries = entries;

  const statusCounts = countBy(entries, (e) => e.status || 'Unknown');
  const priorityCounts = countBy(entries, (e) => e.priority || 'Medium');
  const appliedCountTotal = entries.filter((e) => e.status && e.status.toLowerCase() === 'applied').length;
  const appliedRate = entries.length ? Math.round((appliedCountTotal / entries.length) * 100) : 0;

  if (dashTopCity) dashTopCity.textContent = cityCounts[0]?.[0] || '-';
  if (dashTopCityCount) dashTopCityCount.textContent = cityCounts[0] ? `${cityCounts[0][1]} entries` : '0 entries';
  if (dashTopCountry) dashTopCountry.textContent = countryCounts[0]?.[0] || '-';
  if (dashTopCountryCount) dashTopCountryCount.textContent = countryCounts[0] ? `${countryCounts[0][1]} entries` : '0 entries';
  if (dashCityCount) dashCityCount.textContent = String(cityCounts.length);
  if (dashAppliedRate) dashAppliedRate.textContent = `${appliedRate}%`;
  if (dashAppliedRateSub) dashAppliedRateSub.textContent = `${appliedCountTotal} applied of ${entries.length || 0}`;
  if (statusMixTotal) statusMixTotal.textContent = String(entries.length);
  if (priorityMixTotal) priorityMixTotal.textContent = String(entries.length);

  renderBars(dashCityBars, cityCounts);
  renderBars(dashCountryBars, countryCounts);
  renderAppliedByMonth(entries);
  renderFollowups(entries);
  renderProgressMix(statusMix, STATUS_FLOW.map((status) => [status, statusCounts.find(([label]) => label === status)?.[1] || 0]), entries.length);
  renderProgressMix(priorityMix, PRIORITY_FLOW.map((priority) => [priority, priorityCounts.find(([label]) => label === priority)?.[1] || 0]), entries.length);
  renderGeoSpread(geoSpread, countryCounts);
  renderStatusDonut(statusDonut, STATUS_FLOW.map((status) => [status, statusCounts.find(([label]) => label === status)?.[1] || 0]));
  renderPriorityHeat(entries);
  renderMomentum(entries);
  renderLeadTime(entries);
  renderStackedFlow(statusFlowStack, statusCounts);
  renderCalendarHeatmap(calendarHeatmap, entries);
}

themeToggleBtn?.addEventListener('click', toggleTheme);

init();
