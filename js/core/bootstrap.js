import { products } from '../data/executors.js';
import { qs, qsa } from './dom.js';
import { renderProducts, applyAllFilters } from '../features/executors/catalog.js';
import { closeModal } from '../features/executors/modal.js';
import { openSettingsModal } from '../features/settings/settingsModal.js';
import { getBetaFeaturesEnabled, setBetaFeaturesEnabled } from '../features/settings/accountUi.js';
import { initScriptsHub } from '../features/scriptsHub/initHub.js';
import { syncNavigationLayoutMetrics } from './layout.js';
import { injectLegendIcons, applyRoute, getInitialRoutePath, syncNavButtonsWithPage, setActivePage } from './routing.js';
export function initApp() {
  setBetaFeaturesEnabled(getBetaFeaturesEnabled());
  syncNavigationLayoutMetrics();
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

