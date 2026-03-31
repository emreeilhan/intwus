const sidebarStorageKey = 'staj-sidebar-open';
const sidebarShell = document.querySelector('.app-shell');
const sidebar = document.getElementById('sidebar');
const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
const sidebarBackdrop = document.getElementById('sidebarBackdrop');
const sidebarMobileQuery = window.matchMedia('(max-width: 900px)');

let sidebarOpen = false;

function getSidebarDefaultOpen() {
  const stored = localStorage.getItem(sidebarStorageKey);
  if (stored === null) return !sidebarMobileQuery.matches;
  return stored === '1';
}

function syncSidebarUi() {
  if (!sidebarShell || !sidebar || !sidebarToggleBtn) return;

  sidebarShell.classList.toggle('sidebar-collapsed', !sidebarOpen);
  sidebarShell.classList.toggle('sidebar-open', sidebarOpen);
  sidebar.setAttribute('aria-hidden', sidebarMobileQuery.matches && !sidebarOpen ? 'true' : 'false');
  sidebar.toggleAttribute('inert', sidebarMobileQuery.matches && !sidebarOpen);
  sidebarToggleBtn.setAttribute('aria-expanded', sidebarOpen ? 'true' : 'false');
  sidebarToggleBtn.setAttribute('aria-label', sidebarOpen ? 'Hide sidebar' : 'Show sidebar');
  sidebarToggleBtn.setAttribute('title', sidebarOpen ? 'Hide sidebar' : 'Show sidebar');
  sidebarToggleBtn.classList.toggle('is-active', sidebarOpen);

  if (sidebarBackdrop) {
    sidebarBackdrop.classList.toggle('open', sidebarMobileQuery.matches && sidebarOpen);
    sidebarBackdrop.setAttribute('aria-hidden', sidebarMobileQuery.matches && sidebarOpen ? 'false' : 'true');
  }

  document.body.classList.toggle('sidebar-open', sidebarOpen);
}

function setSidebarOpen(nextOpen, persist = true) {
  sidebarOpen = Boolean(nextOpen);
  if (persist) {
    localStorage.setItem(sidebarStorageKey, sidebarOpen ? '1' : '0');
  }
  syncSidebarUi();
}

function toggleSidebar() {
  setSidebarOpen(!sidebarOpen);
}

function initSidebar() {
  if (!sidebarShell || !sidebar || !sidebarToggleBtn) return;

  sidebarOpen = getSidebarDefaultOpen();
  syncSidebarUi();

  sidebarToggleBtn.addEventListener('click', toggleSidebar);
  sidebarBackdrop?.addEventListener('click', () => setSidebarOpen(false));

  sidebarMobileQuery.addEventListener('change', () => {
    if (localStorage.getItem(sidebarStorageKey) === null) {
      sidebarOpen = !sidebarMobileQuery.matches;
      syncSidebarUi();
    } else {
      syncSidebarUi();
    }
  });
}

window.StajSidebar = {
  open: () => setSidebarOpen(true),
  close: () => setSidebarOpen(false),
  toggle: toggleSidebar
};

initSidebar();
