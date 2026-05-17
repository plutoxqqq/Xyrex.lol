import { qs } from '../core/dom.js';
export function hideInitialLoadingOverlay() {
  const overlay = qs('#appLoadingOverlay');
  if (!overlay) return;
  overlay.classList.add('is-hidden');
  window.setTimeout(() => overlay.remove(), 260);
}
export function initLoadingScreen() {}
