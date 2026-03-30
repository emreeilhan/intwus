const profileForm = document.getElementById('profileForm');
const saveBtn = document.getElementById('saveBtn');
const saveStatus = document.getElementById('saveStatus');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const profileCount = document.getElementById('profileCount');
const sourceCards = document.getElementById('sourceCards');
const heroHeadline = document.getElementById('heroHeadline');
const heroFocus = document.getElementById('heroFocus');
const heroRoles = document.getElementById('heroRoles');
const heroStatus = document.getElementById('heroStatus');
const heroMarket = document.getElementById('heroMarket');
const heroGoalCount = document.getElementById('heroGoalCount');
const heroSourceCount = document.getElementById('heroSourceCount');
const heroUpdated = document.getElementById('heroUpdated');
const quickReadList = document.getElementById('quickReadList');
const skillsSnapshot = document.getElementById('skillsSnapshot');

const themeKey = 'staj-theme';
let currentProfile = null;

const fields = {
  identityName: document.getElementById('identityName'),
  identityStatus: document.getElementById('identityStatus'),
  identityHeadline: document.getElementById('identityHeadline'),
  identityMarket: document.getElementById('identityMarket'),
  identityFocus: document.getElementById('identityFocus'),
  identityRoles: document.getElementById('identityRoles'),
  summaryExecutive: document.getElementById('summaryExecutive'),
  summaryProfile: document.getElementById('summaryProfile'),
  summaryPositioning: document.getElementById('summaryPositioning'),
  strategyThesis: document.getElementById('strategyThesis'),
  strategyPrimary: document.getElementById('strategyPrimary'),
  strategySecondary: document.getElementById('strategySecondary'),
  strategyIntegration: document.getElementById('strategyIntegration'),
  strategyRationale: document.getElementById('strategyRationale'),
  strategyIdentity: document.getElementById('strategyIdentity'),
  goals: document.getElementById('goals'),
  strengths: document.getElementById('strengths'),
  growthAreas: document.getElementById('growthAreas'),
  skillsTechnical: document.getElementById('skillsTechnical'),
  skillsDomains: document.getElementById('skillsDomains'),
  skillsFocus: document.getElementById('skillsFocus'),
  languages: document.getElementById('languages'),
  nonGoals: document.getElementById('nonGoals')
};

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

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function linesToTextarea(items) {
  return Array.isArray(items) ? items.join('\n') : '';
}

function textareaToLines(value) {
  return String(value || '')
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatDate(value) {
  if (!value) return 'No timestamp';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function renderQuickRead(profile) {
  if (!quickReadList) return;
  const items = [
    { label: 'Headline', value: profile.identity?.headline || '-' },
    { label: 'Current focus', value: profile.identity?.currentFocus || '-' },
    { label: 'Thesis', value: profile.strategy?.thesis || '-' },
    { label: 'Identity statement', value: profile.strategy?.identityStatement || '-' }
  ];
  quickReadList.innerHTML = items
    .map((item) => `
      <div class="profile-side-item">
        <div class="profile-side-label">${escapeHtml(item.label)}</div>
        <div class="profile-side-value">${escapeHtml(item.value)}</div>
      </div>
    `)
    .join('');
}

function renderSkillSnapshot(profile) {
  if (!skillsSnapshot) return;
  const chips = [
    ...(profile.skills?.technical || []).slice(0, 4),
    ...(profile.skills?.focusAreas || []).slice(0, 4)
  ];
  skillsSnapshot.innerHTML = chips.length
    ? chips.map((item) => `<span class="profile-chip">${escapeHtml(item)}</span>`).join('')
    : '<span class="muted">No skills yet</span>';
}

function renderSources(sources) {
  if (!sourceCards) return;
  const items = Array.isArray(sources) ? sources : [];
  sourceCards.innerHTML = items.length
    ? items.map((source) => `
        <article class="source-card">
          <div class="source-card-top">
            <div>
              <div class="source-card-title">${escapeHtml(source.title || 'Untitled source')}</div>
              <div class="source-card-meta">${escapeHtml((source.kind || 'doc').toUpperCase())} · Updated ${escapeHtml(formatDate(source.modifiedTime))}</div>
            </div>
            ${source.url ? `<a class="ghost-btn source-link" href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">Open source</a>` : ''}
          </div>
          <p class="source-card-copy">${escapeHtml(source.excerpt || 'No excerpt available.')}</p>
          <details class="source-raw">
            <summary>Show raw excerpt</summary>
            <pre>${escapeHtml(source.rawContent || 'No raw content stored.')}</pre>
          </details>
        </article>
      `).join('')
    : '<div class="empty-state show"><div class="empty-icon">📄</div><div class="empty-title">No source docs</div><div class="empty-sub">Attach or seed source documents to keep context visible.</div></div>';
}

function hydrateForm(profile) {
  fields.identityName.value = profile.identity?.name || '';
  fields.identityStatus.value = profile.identity?.currentStatus || '';
  fields.identityHeadline.value = profile.identity?.headline || '';
  fields.identityMarket.value = profile.identity?.targetMarket || '';
  fields.identityFocus.value = profile.identity?.currentFocus || '';
  fields.identityRoles.value = linesToTextarea(profile.identity?.targetRoles);
  fields.summaryExecutive.value = profile.summary?.executive || '';
  fields.summaryProfile.value = profile.summary?.profile || '';
  fields.summaryPositioning.value = profile.summary?.positioning || '';
  fields.strategyThesis.value = profile.strategy?.thesis || '';
  fields.strategyPrimary.value = profile.strategy?.primaryAxis || '';
  fields.strategySecondary.value = profile.strategy?.secondaryAxis || '';
  fields.strategyIntegration.value = profile.strategy?.integrationPoint || '';
  fields.strategyRationale.value = profile.strategy?.rationale || '';
  fields.strategyIdentity.value = profile.strategy?.identityStatement || '';
  fields.goals.value = linesToTextarea(profile.goals);
  fields.strengths.value = linesToTextarea(profile.strengths);
  fields.growthAreas.value = linesToTextarea(profile.growthAreas);
  fields.skillsTechnical.value = linesToTextarea(profile.skills?.technical);
  fields.skillsDomains.value = linesToTextarea(profile.skills?.domains);
  fields.skillsFocus.value = linesToTextarea(profile.skills?.focusAreas);
  fields.languages.value = linesToTextarea(profile.languages);
  fields.nonGoals.value = linesToTextarea(profile.nonGoals);

  if (heroHeadline) heroHeadline.textContent = profile.identity?.headline || 'Profile';
  if (heroFocus) heroFocus.textContent = profile.summary?.executive || profile.identity?.currentFocus || '';
  if (heroRoles) {
    const roles = Array.isArray(profile.identity?.targetRoles) ? profile.identity.targetRoles : [];
    heroRoles.innerHTML = roles.map((role) => `<span class="profile-chip">${escapeHtml(role)}</span>`).join('');
  }
  if (heroStatus) heroStatus.textContent = profile.identity?.currentStatus || '-';
  if (heroMarket) heroMarket.textContent = profile.identity?.targetMarket || '-';
  if (heroGoalCount) heroGoalCount.textContent = String((profile.goals || []).length);
  if (heroSourceCount) heroSourceCount.textContent = String((profile.sources || []).length);
  if (heroUpdated) heroUpdated.textContent = `Updated ${formatDate(profile.updatedAt)}`;
  if (profileCount) profileCount.textContent = `${(profile.sources || []).length} source docs`;

  renderQuickRead(profile);
  renderSkillSnapshot(profile);
  renderSources(profile.sources);
}

function collectProfile() {
  return {
    ...currentProfile,
    identity: {
      name: fields.identityName.value.trim(),
      currentStatus: fields.identityStatus.value.trim(),
      headline: fields.identityHeadline.value.trim(),
      targetMarket: fields.identityMarket.value.trim(),
      currentFocus: fields.identityFocus.value.trim(),
      targetRoles: textareaToLines(fields.identityRoles.value)
    },
    summary: {
      executive: fields.summaryExecutive.value.trim(),
      profile: fields.summaryProfile.value.trim(),
      positioning: fields.summaryPositioning.value.trim()
    },
    goals: textareaToLines(fields.goals.value),
    strengths: textareaToLines(fields.strengths.value),
    growthAreas: textareaToLines(fields.growthAreas.value),
    skills: {
      technical: textareaToLines(fields.skillsTechnical.value),
      domains: textareaToLines(fields.skillsDomains.value),
      focusAreas: textareaToLines(fields.skillsFocus.value)
    },
    languages: textareaToLines(fields.languages.value),
    strategy: {
      thesis: fields.strategyThesis.value.trim(),
      primaryAxis: fields.strategyPrimary.value.trim(),
      secondaryAxis: fields.strategySecondary.value.trim(),
      integrationPoint: fields.strategyIntegration.value.trim(),
      rationale: fields.strategyRationale.value.trim(),
      identityStatement: fields.strategyIdentity.value.trim()
    },
    nonGoals: textareaToLines(fields.nonGoals.value),
    sources: Array.isArray(currentProfile?.sources) ? currentProfile.sources : []
  };
}

async function loadProfile() {
  const res = await fetch('/api/profile');
  if (!res.ok) throw new Error('Failed to load profile');
  currentProfile = await res.json();
  hydrateForm(currentProfile);
}

async function handleSave(event) {
  event.preventDefault();
  if (!currentProfile) return;

  saveBtn.disabled = true;
  saveStatus.textContent = 'Saving...';

  try {
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(collectProfile())
    });

    if (!res.ok) {
      throw new Error('Failed to save profile');
    }

    currentProfile = await res.json();
    hydrateForm(currentProfile);
    saveStatus.textContent = 'Saved locally';
  } catch (error) {
    console.error(error);
    saveStatus.textContent = 'Save failed';
  } finally {
    saveBtn.disabled = false;
  }
}

async function init() {
  initTheme();
  saveStatus.textContent = 'Loading profile...';

  try {
    await loadProfile();
    saveStatus.textContent = 'Local profile store';
  } catch (error) {
    console.error(error);
    saveStatus.textContent = 'Profile failed to load';
  }
}

themeToggleBtn?.addEventListener('click', toggleTheme);
profileForm?.addEventListener('submit', handleSave);

init();
