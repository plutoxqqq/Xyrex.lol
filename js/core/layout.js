import { qs } from './dom.js';

export function syncNavigationLayoutMetrics() {
  const topnav = qs('.topnav');
  if (!topnav) return;

  const updateNavHeight = () => {
    const navHeight = Math.max(56, Math.ceil(topnav.getBoundingClientRect().height));
    document.documentElement.style.setProperty('--nav-height', `${navHeight}px`);
  };

  updateNavHeight();
  window.addEventListener('resize', updateNavHeight, { passive: true });
  window.addEventListener('orientationchange', updateNavHeight, { passive: true });

  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(updateNavHeight);
    observer.observe(topnav);
  }
}


window.addEventListener('xyrex:account-changed', () => {
  const overlay = qs('#modalOverlay');
  if (overlay?.getAttribute('aria-hidden') === 'false' && qs('.settings-modal')) {
    openSettingsModal();
  }
});
