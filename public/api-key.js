/**
 * Purpose: Minimal API key page — sync theme, persist key to localStorage, return to tracker.
 */
(function apiKeyRouteInit() {
  const themeKey = 'staj-theme';
  const apiKeyStorageKey = 'staj-apikey';
  const savedTheme = localStorage.getItem(themeKey);
  document.documentElement.setAttribute('data-theme', savedTheme === 'light' ? 'light' : 'dark');

  const input = document.getElementById('apiKeyRouteInput');
  const form = document.getElementById('apiKeyRouteForm');
  if (input) {
    input.value = localStorage.getItem(apiKeyStorageKey) || '';
  }

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    const value = (input?.value || '').trim();
    if (!value) {
      localStorage.removeItem(apiKeyStorageKey);
    } else {
      localStorage.setItem(apiKeyStorageKey, value);
    }
    window.location.href = '/';
  });
}());
