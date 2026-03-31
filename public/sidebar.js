const sidebarStorageKey = 'staj-sidebar-open';
const sidebarShell = document.querySelector('.app-shell');
const sidebar = document.getElementById('sidebar');
const sidebarBody = document.querySelector('.sidebar-body');
const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
const sidebarBackdrop = document.getElementById('sidebarBackdrop');
const sidebarMobileQuery = window.matchMedia('(max-width: 900px)');
let sidebarFab = document.getElementById('sidebarFab');

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
  sidebar.setAttribute('aria-hidden', sidebarOpen ? 'false' : 'true');
  sidebar.toggleAttribute('inert', !sidebarOpen);
  sidebarBody?.setAttribute('aria-hidden', sidebarOpen ? 'false' : 'true');
  sidebarBody?.toggleAttribute('inert', !sidebarOpen);
  sidebarToggleBtn.setAttribute('aria-expanded', sidebarOpen ? 'true' : 'false');
  sidebarToggleBtn.setAttribute('aria-label', sidebarOpen ? 'Hide sidebar' : 'Show sidebar');
  sidebarToggleBtn.setAttribute('title', sidebarOpen ? 'Hide sidebar' : 'Show sidebar');
  sidebarToggleBtn.classList.toggle('is-active', sidebarOpen);

  if (sidebarBackdrop) {
    sidebarBackdrop.classList.toggle('open', sidebarMobileQuery.matches && sidebarOpen);
    sidebarBackdrop.setAttribute('aria-hidden', sidebarMobileQuery.matches && sidebarOpen ? 'false' : 'true');
  }

  document.body.classList.toggle('sidebar-open', sidebarMobileQuery.matches && sidebarOpen);

  if (sidebarFab) {
    sidebarFab.hidden = sidebarOpen;
    sidebarFab.setAttribute('aria-hidden', sidebarOpen ? 'true' : 'false');
  }
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

  if (!sidebarFab) {
    sidebarFab = document.createElement('button');
    sidebarFab.id = 'sidebarFab';
    sidebarFab.type = 'button';
    sidebarFab.className = 'sidebar-fab';
    sidebarFab.setAttribute('aria-label', 'Show sidebar');
    sidebarFab.setAttribute('title', 'Show sidebar');
    sidebarFab.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 6l6 6-6 6"/></svg>';
    document.body.appendChild(sidebarFab);
  }

  sidebarOpen = getSidebarDefaultOpen();
  syncSidebarUi();

  sidebarToggleBtn.addEventListener('click', toggleSidebar);
  sidebarFab?.addEventListener('click', () => setSidebarOpen(true));
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
