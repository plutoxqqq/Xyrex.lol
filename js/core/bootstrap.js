import { products } from '../data/executors.js';
import { qs, qsa } from './dom.js';
import { renderProducts, applyAllFilters } from '../features/executors/catalog.js';
import { closeModal } from '../features/executors/modal.js';
import { openSettingsModal } from '../features/settings/settingsModal.js';
import { getBetaFeaturesEnabled, setBetaFeaturesEnabled } from '../features/settings/accountUi.js';
import { initScriptsHub } from '../features/scriptsHub/initHub.js';
import { syncNavigationLayoutMetrics } from './layout.js';
import { injectLegendIcons, applyRoute, getInitialRoutePath, syncNavButtonsWithPage, setActivePage } from './routing.js';

function initCollapsibleFilters() {
  const layout = qs('.page-layout');
  const toggleBtn = qs('#filtersToggleBtn');
  const filtersContent = qs('#filtersContent');
  if (!layout || !toggleBtn || !filtersContent) return;

  const setCollapsed = collapsed => {
    layout.classList.toggle('filters-collapsed', collapsed);
    toggleBtn.setAttribute('aria-expanded', String(!collapsed));
    const label = collapsed ? 'Expand filters' : 'Collapse filters';
    toggleBtn.setAttribute('title', label);
    toggleBtn.setAttribute('aria-label', label);
  };

  setCollapsed(false);

  toggleBtn.addEventListener('click', () => {
    setCollapsed(!layout.classList.contains('filters-collapsed'));
  });

  const nearHandler = event => {
    const rect = toggleBtn.getBoundingClientRect();
    const distX = Math.max(rect.left - event.clientX, event.clientX - rect.right, 0);
    const distY = Math.max(rect.top - event.clientY, event.clientY - rect.bottom, 0);
    toggleBtn.classList.toggle('is-near', Math.hypot(distX, distY) <= 70);
  };

  document.addEventListener('pointermove', nearHandler, { passive: true });
  toggleBtn.addEventListener('pointerenter', () => toggleBtn.classList.add('is-near'));
  toggleBtn.addEventListener('pointerleave', () => toggleBtn.classList.remove('is-near'));
}

export function initApp() {
  setBetaFeaturesEnabled(getBetaFeaturesEnabled());
  syncNavigationLayoutMetrics();
  initCollapsibleFilters();
  renderProducts(products);
  initScriptsHub();
  injectLegendIcons();

  qs('#searchInput').addEventListener('input', applyAllFilters);
  qs('#searchInput').addEventListener('keydown', e => {
    const searchValue = qs('#searchInput').value.trim().toLowerCase();
    if (e.key === 'Enter' && searchValue === 'dodge') {
      qsa('.page-switch-btn').forEach(item => item.classList.remove('is-active'));
      setActivePage('easterEggPage');
    }
  });

  qs('#clearSearchBtn').addEventListener('click', () => {
    qs('#searchInput').value = '';
    applyAllFilters();
  });

  qs('#brandHomeBtn').addEventListener('click', () => {
    qs('#searchInput').value = '';
    applyAllFilters();
    syncNavButtonsWithPage('executorsPage');
    setActivePage('executorsPage');
  });

  qs('#settingsTabBtn').addEventListener('click', openSettingsModal);

  qsa('.filter-checkbox').forEach(cb => cb.addEventListener('change', applyAllFilters));
  qsa('.price-checkbox').forEach(cb => cb.addEventListener('change', applyAllFilters));

  qs('#resetFilters').addEventListener('click', () => {
    qsa('.filter-checkbox, .price-checkbox').forEach(cb => (cb.checked = false));
    qs('#searchInput').value = '';
    applyAllFilters();
  });

  qs('#modalCloseBtn').addEventListener('click', closeModal);
  qs('#modalOverlay').addEventListener('click', e => {
    if (e.target === qs('#modalOverlay')) closeModal();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

  window.addEventListener('popstate', () => {
    applyRoute(getInitialRoutePath(), true);
  });

  applyRoute(getInitialRoutePath(), true);
}

