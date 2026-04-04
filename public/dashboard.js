const dashTracked = document.getElementById('dashTracked');
const dashTrackedSub = document.getElementById('dashTrackedSub');
const dashActivePipeline = document.getElementById('dashActivePipeline');
const dashActivePipelineSub = document.getElementById('dashActivePipelineSub');
const dashReadyNow = document.getElementById('dashReadyNow');
const dashReadyNowSub = document.getElementById('dashReadyNowSub');
const dashAppliedRate = document.getElementById('dashAppliedRate');
const dashAppliedRateSub = document.getElementById('dashAppliedRateSub');
const dashFollowupDue = document.getElementById('dashFollowupDue');
const dashTopCity = document.getElementById('dashTopCity');
const dashTopCityCount = document.getElementById('dashTopCityCount');
const dashTopCountry = document.getElementById('dashTopCountry');
const dashTopCountryCount = document.getElementById('dashTopCountryCount');
const dashCityCount = document.getElementById('dashCityCount');
const dashboardFocusSummary = document.getElementById('dashboardFocusSummary');
const dashCityBars = document.getElementById('dashCityBars');
const dashCountryBars = document.getElementById('dashCountryBars');
const appliedBars = document.getElementById('appliedBars');
const appliedCount = document.getElementById('appliedCount');
const followupList = document.getElementById('followupList');
const dashboardEmpty = document.getElementById('dashboardEmpty');
const trendChart = document.getElementById('trendChart');
const trendCaption = document.getElementById('trendCaption');
const statusMix = document.getElementById('statusMix');
const priorityMix = document.getElementById('priorityMix');
const geoSpread = document.getElementById('geoSpread');
const statusMixTotal = document.getElementById('statusMixTotal');
const priorityMixTotal = document.getElementById('priorityMixTotal');
const momentumBars = document.getElementById('momentumBars');
const leadTimeBars = document.getElementById('leadTimeBars');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const outreachTotals = document.getElementById('outreachTotals');
const outreachSentTotal = document.getElementById('outreachSentTotal');
const hookTypeBars = document.getElementById('hookTypeBars');
const attachmentMixBars = document.getElementById('attachmentMixBars');
const companyTypeBars = document.getElementById('companyTypeBars');
const tonePresetBars = document.getElementById('tonePresetBars');
const trendChartSummary = document.getElementById('trendChartSummary');

const themeKey = 'staj-theme';
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

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function dateLabel(value) {
  if (!value) return 'No date';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function relativeDays(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const diff = Math.round((date.getTime() - startOfToday().getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff < 0) return `${Math.abs(diff)}d late`;
  return `In ${diff}d`;
}

function colorFromString(value, alpha = 1) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) hash = value.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash) % 360;
  return `hsla(${hue}, 44%, 58%, ${alpha})`;
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
  const resolved = theme || 'dark';
  document.documentElement.setAttribute('data-theme', resolved);
  localStorage.setItem(themeKey, resolved);
  const themeLabel = document.getElementById('themeLabel');
  if (themeLabel) themeLabel.textContent = resolved === 'dark' ? 'Light' : 'Dark';
  else if (themeToggleBtn) themeToggleBtn.textContent = resolved === 'dark' ? 'Light mode' : 'Dark mode';
}

function initTheme() {
  const saved = localStorage.getItem(themeKey);
  applyTheme(saved || 'dark');
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
    row.innerHTML = `<div>${label}</div><div>${count}</div><div class="bar-track"><div class="bar-fill" style="width:${Math.round((count / max) * 100)}%; background:${colorFromString(label, 0.5)}"></div></div>`;
    container.appendChild(row);
  });
}

function renderOutcomeBars(container, data, limit = 6) {
  if (!container) return;
  container.innerHTML = '';
  const max = data[0]?.successRate || 1;
  data.slice(0, limit).forEach((item) => {
    const row = document.createElement('div');
    row.className = 'bar-row';
    row.innerHTML = `<div>${item.label}</div><div>${item.successRate}%</div><div class="bar-track"><div class="bar-fill" style="width:${Math.max(item.successRate, item.sent ? 8 : 0)}%; background:${colorFromString(item.label, 0.56)}"></div></div>`;
    row.title = `${item.positive}/${item.sent} positive, ${item.neutral || 0} neutral, ${item.negative || 0} negative, ${item.pending} pending`;
    container.appendChild(row);
  });
}

function renderProgressMix(container, data, total) {
  if (!container) return;
  container.innerHTML = '';
  const max = Math.max(...data.map(([, count]) => count), 1);
  data.forEach(([label, count]) => {
    const row = document.createElement('div');
    row.className = 'mix-row';
    row.innerHTML = `
      <div class="mix-label">${label}</div>
      <div class="mix-track"><div class="mix-fill" style="width:${Math.round((count / max) * 100)}%; background:${colorFromString(label, 0.58)}"></div></div>
      <div>${total ? Math.round((count / total) * 100) : 0}%</div>
    `;
    container.appendChild(row);
  });
}

/** Purpose: Screen-reader text for the SVG trend chart (WCAG text alternative). */
function setTrendChartAccessibilitySummary(monthRows) {
  if (!trendChartSummary) return;
  if (!monthRows || !monthRows.length) {
    trendChartSummary.textContent = 'No monthly application data yet. Add applied dates to see the trend.';
    return;
  }
  const parts = monthRows.map(([key, count]) => {
    const label = formatMonthLabel(key);
    const noun = count === 1 ? 'application' : 'applications';
    return `${label}: ${count} ${noun}`;
  });
  trendChartSummary.textContent = `Pipeline trend — ${parts.join('; ')}.`;
}

function renderTrendChart(container, series) {
  if (!container) return;
  if (!series.length) {
    container.innerHTML = '';
    return;
  }

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

  const areaPath = `M ${points[0].x} ${height - padY} ${points.map((p) => `L ${p.x} ${p.y}`).join(' ')} L ${points[points.length - 1].x} ${height - padY} Z`;
  const linePath = points.map((p, index) => `${index === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const gridLines = [0.25, 0.5, 0.75]
    .map((ratio) => `<line x1="${padX}" y1="${padY + innerH * ratio}" x2="${width - padX}" y2="${padY + innerH * ratio}" />`)
    .join('');
  const labels = points.map((p) => `<text x="${p.x}" y="${height - 6}" text-anchor="middle">${p.label}</text>`).join('');
  const dots = points.map((p) => `<circle cx="${p.x}" cy="${p.y}" r="3.5" />`).join('');

  container.innerHTML = `
    <defs>
      <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="rgba(125, 211, 252, 0.22)" />
        <stop offset="100%" stop-color="rgba(125, 211, 252, 0)" />
      </linearGradient>
    </defs>
    <g>${gridLines}</g>
    <path d="${areaPath}" fill="url(#trendFill)" />
    <path d="${linePath}" fill="none" stroke="rgba(125, 211, 252, 0.95)" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" />
    ${dots}
    ${labels}
  `;
}

function renderMomentum(container, months) {
  if (!container) return;
  container.innerHTML = '';
  const maxTotal = Math.max(...months.map((month) => month.total), 1);
  months.forEach((month) => {
    const row = document.createElement('div');
    row.className = 'momentum-row';
    row.innerHTML = `
      <div>${month.label}</div>
      <div class="momentum-track">
        <div class="momentum-total" style="width:${Math.max(6, Math.round((month.total / maxTotal) * 100))}%; background:${colorFromString(month.label, 0.24)}"></div>
        <div class="momentum-applied" style="width:${month.total ? Math.round((month.applied / month.total) * 100) : 0}%; background:rgba(125, 211, 252, 0.78)"></div>
      </div>
      <div>${month.applied}/${month.total}</div>
    `;
    container.appendChild(row);
  });
}

function renderLeadTime(container, entries) {
  if (!container) return;
  const buckets = [
    { label: '0-7d', min: 0, max: 7, count: 0 },
    { label: '8-14d', min: 8, max: 14, count: 0 },
    { label: '15-30d', min: 15, max: 30, count: 0 },
    { label: '31+d', min: 31, max: Infinity, count: 0 }
  ];

  entries.forEach((entry) => {
    if (!entry.applied_at || !entry.followup_at) return;
    const applied = new Date(entry.applied_at);
    const followup = new Date(entry.followup_at);
    if (Number.isNaN(applied.getTime()) || Number.isNaN(followup.getTime())) return;
    const diff = Math.max(0, Math.round((followup - applied) / (1000 * 60 * 60 * 24)));
    const bucket = buckets.find((item) => diff >= item.min && diff <= item.max);
    if (bucket) bucket.count += 1;
  });

  const max = Math.max(...buckets.map((bucket) => bucket.count), 1);
  container.innerHTML = '';
  buckets.forEach((bucket) => {
    const row = document.createElement('div');
    row.className = 'bar-row';
    row.innerHTML = `<div>${bucket.label}</div><div>${bucket.count}</div><div class="bar-track"><div class="bar-fill" style="width:${Math.round((bucket.count / max) * 100)}%; background:${colorFromString(bucket.label, 0.48)}"></div></div>`;
    container.appendChild(row);
  });
}

function renderGeoSpread(container, entries, countries) {
  if (!container) return;
  container.innerHTML = '';
  countries.slice(0, 6).forEach(([country, total]) => {
    const row = document.createElement('div');
    row.className = 'stack-item';
    const cityMap = new Map();
    entries.forEach((entry) => {
      if (parseCountry(entry.tag) !== country) return;
      const city = parseCity(entry.tag) || 'Unknown';
      cityMap.set(city, (cityMap.get(city) || 0) + 1);
    });
    const cityData = Array.from(cityMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 4);
    const totalCities = cityData.reduce((sum, [, count]) => sum + count, 0) || 1;
    const segments = cityData
      .map(([city, count]) => `<div class="stack-seg" title="${city}: ${count}" style="width:${Math.max(8, Math.round((count / totalCities) * 100))}%; background:${colorFromString(city, 0.46)}"></div>`)
      .join('');
    row.innerHTML = `<header><span>${country}</span><span>${total}</span></header><div class="stack-track">${segments}</div>`;
    container.appendChild(row);
  });
}

function renderAppliedByMonth(entries) {
  if (!appliedBars) return [];
  const map = new Map();
  entries.forEach((entry) => {
    const source = entry.applied_at || entry.created_at;
    if (!source) return;
    const date = new Date(source);
    if (Number.isNaN(date.getTime())) return;
    const key = toMonthKey(date);
    map.set(key, (map.get(key) || 0) + 1);
  });

  const data = Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  const limited = data.slice(-12);
  appliedBars.innerHTML = '';

  const max = Math.max(...limited.map(([, count]) => count), 1);
  limited.forEach(([label, count]) => {
    const row = document.createElement('div');
    row.className = 'bar-row';
    row.innerHTML = `<div>${formatMonthLabel(label)}</div><div>${count}</div><div class="bar-track"><div class="bar-fill" style="width:${Math.round((count / max) * 100)}%; background:${colorFromString(label, 0.5)}"></div></div>`;
    appliedBars.appendChild(row);
  });

  const total = limited.reduce((sum, [, count]) => sum + count, 0);
  if (appliedCount) appliedCount.textContent = `${total} total`;
  renderTrendChart(trendChart, limited.map(([label, count]) => ({ label: label.slice(5), count })));
  setTrendChartAccessibilitySummary(limited);

  return limited;
}

function renderFollowups(entries) {
  if (!followupList) return 0;
  followupList.innerHTML = '';
  const today = startOfToday();
  const limit = new Date(today);
  limit.setDate(limit.getDate() + 14);

  const upcoming = entries
    .filter((entry) => entry.followup_at)
    .map((entry) => ({ ...entry, followupDate: new Date(entry.followup_at) }))
    .filter((entry) => !Number.isNaN(entry.followupDate.getTime()) && entry.followupDate <= limit)
    .sort((a, b) => a.followupDate - b.followupDate)
    .slice(0, 6);

  if (!upcoming.length) {
    const empty = document.createElement('div');
    empty.className = 'mini-row';
    empty.innerHTML = '<span class="muted">No follow-ups due soon</span><span></span><span></span>';
    followupList.appendChild(empty);
    return 0;
  }

  upcoming.forEach((entry) => {
    const row = document.createElement('div');
    row.className = 'mini-row';
    row.innerHTML = `<span>${entry.company}</span><span>${dateLabel(entry.followup_at)}</span><span>${relativeDays(entry.followup_at)}</span>`;
    followupList.appendChild(row);
  });

  return upcoming.length;
}

async function init() {
  initTheme();
  const [entriesRes, outcomesRes] = await Promise.all([
    fetch('/api/internships'),
    fetch('/api/dashboard/outcomes')
  ]);
  const entries = await entriesRes.json();
  const outcomes = await outcomesRes.json().catch(() => ({
    totals: { sent: 0, positive: 0, blocked: 0, drafts: 0, cancelled: 0 },
    companyTypes: [],
    hookTypes: [],
    attachmentMixes: [],
    tonePresets: []
  }));

  if (!entries.length && dashboardEmpty) {
    dashboardEmpty.classList.add('show');
    const emptyIconEl = dashboardEmpty.querySelector('.empty-icon');
    if (emptyIconEl && window.StajIcons?.chartBar) emptyIconEl.innerHTML = window.StajIcons.chartBar();
  } else if (dashboardEmpty) {
    dashboardEmpty.classList.remove('show');
  }

  const cityCounts = countBy(entries, (entry) => parseCity(entry.tag));
  const countryCounts = countBy(entries, (entry) => parseCountry(entry.tag));
  const statusCounts = countBy(entries, (entry) => entry.status || 'Unknown');
  const priorityCounts = countBy(entries, (entry) => entry.priority || 'Medium');

  const tracked = entries.length;
  const activePipeline = entries.filter((entry) => ['Researching', 'Ready to Apply', 'Applied', 'Interview'].includes(entry.status)).length;
  const readyNow = entries.filter((entry) => entry.status === 'Ready to Apply' || (entry.followup_at && relativeDays(entry.followup_at).includes('Today')) || (entry.followup_at && relativeDays(entry.followup_at).includes('late'))).length;
  const applied = entries.filter((entry) => entry.status === 'Applied').length;
  const appliedRate = tracked ? (applied ? Math.max(1, Math.round((applied / tracked) * 100)) : 0) : 0;
  const followupDue = renderFollowups(entries);

  if (dashTracked) dashTracked.textContent = String(tracked);
  if (dashTrackedSub) dashTrackedSub.textContent = `${countryCounts.length || 0} countries in play`;
  if (dashActivePipeline) dashActivePipeline.textContent = String(activePipeline);
  if (dashActivePipelineSub) dashActivePipelineSub.textContent = tracked ? `${Math.round((activePipeline / tracked) * 100)}% of tracker is still active` : 'No active records yet';
  if (dashReadyNow) dashReadyNow.textContent = String(readyNow);
  if (dashReadyNowSub) dashReadyNowSub.textContent = `${entries.filter((entry) => entry.status === 'Ready to Apply').length} ready to apply`;
  if (dashAppliedRate) dashAppliedRate.textContent = `${appliedRate}%`;
  if (dashAppliedRateSub) dashAppliedRateSub.textContent = `${applied} applied of ${tracked}`;
  if (dashFollowupDue) dashFollowupDue.textContent = String(followupDue);

  if (dashTopCity) dashTopCity.textContent = cityCounts[0]?.[0] || '-';
  if (dashTopCityCount) dashTopCityCount.textContent = cityCounts[0] ? `${cityCounts[0][1]} entries in the leading city` : 'No city data yet';
  if (dashTopCountry) dashTopCountry.textContent = countryCounts[0]?.[0] || '-';
  if (dashTopCountryCount) dashTopCountryCount.textContent = countryCounts[0] ? `${countryCounts[0][1]} entries in the leading country` : 'No country data yet';
  if (dashCityCount) dashCityCount.textContent = String(countryCounts.length || 0);
  if (statusMixTotal) statusMixTotal.textContent = String(tracked);
  if (priorityMixTotal) priorityMixTotal.textContent = String(tracked);

  if (dashboardFocusSummary) {
    if (!tracked) {
      dashboardFocusSummary.textContent = 'Review readiness, concentration, and follow-up pressure without drowning in decorative analytics.';
    } else if (!applied) {
      dashboardFocusSummary.textContent = 'The tracker is heavy on research and very light on submissions. The next gain is converting strong targets into applications.';
    } else if (followupDue > 0) {
      dashboardFocusSummary.textContent = `There are ${followupDue} follow-ups due soon. Push the queue first, then widen the funnel if needed.`;
    } else {
      dashboardFocusSummary.textContent = 'The pipeline is under control. Review concentration risk and keep the strongest markets moving.';
    }
  }

  renderBars(dashCityBars, cityCounts);
  renderBars(dashCountryBars, countryCounts);
  renderGeoSpread(geoSpread, entries, countryCounts);

  renderProgressMix(statusMix, STATUS_FLOW.map((status) => [status, statusCounts.find(([label]) => label === status)?.[1] || 0]), tracked);
  renderProgressMix(priorityMix, PRIORITY_FLOW.map((priority) => [priority, priorityCounts.find(([label]) => label === priority)?.[1] || 0]), tracked);

  const monthSeries = renderAppliedByMonth(entries);
  if (trendCaption) {
    trendCaption.textContent = monthSeries.length
      ? `Tracking ${monthSeries.length} recent monthly checkpoints with visible application volume.`
      : 'Application activity will appear here once dates are available.';
  }

  const momentumMap = new Map();
  entries.forEach((entry) => {
    const source = entry.applied_at || entry.created_at;
    if (!source) return;
    const date = new Date(source);
    if (Number.isNaN(date.getTime())) return;
    const key = toMonthKey(date);
    if (!momentumMap.has(key)) momentumMap.set(key, { total: 0, applied: 0 });
    momentumMap.get(key).total += 1;
    if ((entry.status || '').toLowerCase() === 'applied') momentumMap.get(key).applied += 1;
  });

  const momentumData = Array.from(momentumMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-8)
    .map(([key, value]) => ({
      label: formatMonthLabel(key),
      total: value.total,
      applied: value.applied
    }));
  renderMomentum(momentumBars, momentumData);
  renderLeadTime(leadTimeBars, entries);
  renderOutcomeBars(hookTypeBars, outcomes.hookTypes || []);
  renderOutcomeBars(attachmentMixBars, outcomes.attachmentMixes || []);
  renderOutcomeBars(companyTypeBars, outcomes.companyTypes || []);
  renderOutcomeBars(tonePresetBars, outcomes.tonePresets || []);

  if (outreachSentTotal) outreachSentTotal.textContent = String(outcomes?.totals?.sent || 0);
  if (outreachTotals) {
    outreachTotals.innerHTML = [
      { label: 'Direct sends', value: outcomes?.totals?.sent || 0 },
      { label: 'Replies logged', value: outcomes?.totals?.replied || 0 },
      { label: 'Positive outcomes', value: outcomes?.totals?.positive || 0 },
      { label: 'Blocked by safety', value: outcomes?.totals?.blocked || 0 },
      { label: 'Draft openings', value: outcomes?.totals?.drafts || 0 },
      { label: 'Cancelled reviews', value: outcomes?.totals?.cancelled || 0 }
    ].map((item) => `<div class="mini-row"><span>${item.label}</span><span>${item.value}</span><span></span></div>`).join('');
  }
}

themeToggleBtn?.addEventListener('click', toggleTheme);

init();
