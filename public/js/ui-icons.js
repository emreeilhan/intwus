/**
 * Purpose: Shared stroke SVG icons (24×24, currentColor) for empty states, board, onboarding.
 * Matches the app shell icon style — no emoji in productivity surfaces.
 */
(function stajIconsInit(global) {
  const NS = 'http://www.w3.org/2000/svg';

  function svg(children, className = 'empty-state-svg') {
    return `<svg xmlns="${NS}" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${className}" aria-hidden="true" focusable="false">${children}</svg>`;
  }

  const icons = {
    pin: () => svg('<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>'),
    search: () => svg('<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>'),
    clipboardCheck: () => svg('<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>'),
    mail: () => svg('<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>'),
    calendar: () => svg('<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>'),
    star: () => svg('<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>'),
    fileX: () => svg('<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><path d="M14 2v6h6"/><path d="m14.5 15.5-5-5"/><path d="m9.5 15.5 5-5"/>'),
    pauseCircle: () => svg('<circle cx="12" cy="12" r="10"/><path d="M10 9v6M14 9v6"/>'),
    chartBar: () => svg('<path d="M3 3v18h18"/><path d="M7 16v-4M12 16V8M17 16v-7"/>'),
    fileText: () => svg('<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><path d="M14 2v6h6"/><path d="M10 13h4"/><path d="M10 17h8"/><path d="M10 9h2"/>'),
    sun: () => svg('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>'),
    zap: () => svg('<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>'),
    inbox: () => svg('<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>')
  };

  global.StajIcons = icons;
}(typeof window !== 'undefined' ? window : globalThis));
