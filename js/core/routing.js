import { qs, qsa } from './dom.js';
import { applyAllFilters, renderProducts } from '../features/executors/catalog.js';
import { products } from '../data/executors.js';
import { applyUiMode, getIsNewUiMode, setIsNewUiMode } from '../features/newUi/uiMode.js';

let activePageId = null;
let activeSubtabId = 'tierPaidPanel';
let suppressRouteSync = false;

const subtabPathSlugMap = {
  tierPaidPanel: 'executortierlistpaid',
  tierFreePanel: 'executortierlistfree',
  popularScriptsPanel: 'popularscripts',
  savedScriptsPanel: 'savedscripts',
  recentChangesPanel: 'recentchanges'
};

const subtabPathToIdMap = Object.fromEntries(
  Object.entries(subtabPathSlugMap).map(([key, value]) => [value, key])
);

export function normalisePath(pathname) {
  const clean = String(pathname || '/').replace(/\/+$/, '');
  return clean || '/';
}

export function getRouteStateFromPath(pathname) {
  const segments = normalisePath(pathname).split('/').filter(Boolean).map(item => item.toLowerCase());
  let isRouteNewUi = false;
  let cursor = 0;

  if (segments[0] === 'newui') {
    isRouteNewUi = true;
    cursor = 1;
  }

  let pageId = 'executorsPage';
  let subtabId = 'tierPaidPanel';

  if (segments[cursor] === 'dodge') {
    pageId = 'easterEggPage';
  }

  if (segments[cursor] === 'scripthub') {
    pageId = 'scriptsPage';
    const slug = segments[cursor + 1] || '';
    if (slug && subtabPathToIdMap[slug]) {
      subtabId = subtabPathToIdMap[slug];
    }
  }

  return {
    isRouteNewUi,
    pageId,
    subtabId
  };
}

export function buildPathFromState() {
  const base = getIsNewUiMode() ? '/newui' : '';
  if (activePageId === 'scriptsPage') {
    const subtabSegment = subtabPathSlugMap[activeSubtabId];
    if (subtabSegment && activeSubtabId !== 'tierPaidPanel') return `${base}/scripthub/${subtabSegment}`;
    return `${base}/scripthub`;
  }

  if (activePageId === 'easterEggPage') return `${base}/dodge`;

  return base || '/';
}

export function syncRouteWithState(replace = false) {
  if (suppressRouteSync) return;
  const nextPath = buildPathFromState();
  if (normalisePath(window.location.pathname) === normalisePath(nextPath)) return;
  const method = replace ? 'replaceState' : 'pushState';
  window.history[method]({}, '', nextPath);
}

export function syncNavButtonsWithPage(targetPageId) {
  qsa('.page-switch-btn').forEach(item => {
    item.classList.toggle('is-active', item.getAttribute('data-page-target') === targetPageId);
  });
}

export function syncSubtabButtons(targetSubtabId) {
  qsa('.subtab-btn').forEach(item => {
    const active = item.getAttribute('data-subtab-target') === targetSubtabId;
    item.classList.toggle('is-active', active);
    item.setAttribute('aria-selected', String(active));
  });
}


export function normalizeIncomingRoute(routeValue) {
  const route = String(routeValue || '').trim();
  if (!route) return '/';

  try {
    const parsed = new URL(route, window.location.origin);
    return parsed.pathname || '/';
  } catch {
    const pathOnly = route.split(/[?#]/)[0];
    return pathOnly.startsWith('/') ? pathOnly : '/';
  }
}

export function getInitialRoutePath() {
  const params = new URLSearchParams(window.location.search);
  const routeParam = params.get('route');
  if (!routeParam) return window.location.pathname;
  return normalizeIncomingRoute(routeParam);
}

export async function applyRoute(pathname, replace = false) {
  const routeState = getRouteStateFromPath(pathname);
  suppressRouteSync = true;

  setIsNewUiMode(routeState.isRouteNewUi);

  syncNavButtonsWithPage(routeState.pageId);
  syncSubtabButtons(routeState.subtabId);
  setActiveSubtab(routeState.subtabId);
  setActivePage(routeState.pageId);
  await applyUiMode();

  suppressRouteSync = false;
  syncRouteWithState(replace);
}

export function restartAnimationClass(element, animationClass) {
  if (!element) return;
  element.classList.remove(animationClass);
  void element.offsetWidth;
  element.classList.add(animationClass);
}

export function animateMainContentTransition() {
  restartAnimationClass(qs('.main-content'), 'is-view-switching');
}

export function setActivePage(targetPageId) {
  if (targetPageId === activePageId) return;

  const nextPage = qs(`#${targetPageId}`);
  if (!nextPage) return;

  qsa('.app-page').forEach(page => {
    const isTarget = page.id === targetPageId;
    page.hidden = !isTarget;
    page.classList.toggle('is-active', isTarget);
  });

  animateMainContentTransition();
  restartAnimationClass(nextPage, 'animate-in-page');
  activePageId = targetPageId;

  const onScriptsPage = targetPageId === 'scriptsPage';
  const onEasterPage = targetPageId === 'easterEggPage';
  qs('#sidebar').hidden = onScriptsPage || onEasterPage;
  qs('#searchInput').disabled = onScriptsPage;
  qs('#clearSearchBtn').disabled = onScriptsPage;
  const pageLayout = qs('.page-layout');
  pageLayout.classList.toggle('scripts-mode', onScriptsPage || onEasterPage);
  if (onScriptsPage || onEasterPage) pageLayout.classList.remove('filters-collapsed');
  document.body.classList.toggle('easter-game-mode', onEasterPage);

  if (onEasterPage) {
    window.XyrexDodge?.start?.();
  } else {
    window.XyrexDodge?.stop?.();
  }

  syncRouteWithState();
}

export function setActiveSubtab(targetSubtabId) {
  if (targetSubtabId === activeSubtabId) return;

  const nextPanel = qs(`#${targetSubtabId}`);
  if (!nextPanel) return;

  qsa('.subtab-panel').forEach(panel => {
    panel.hidden = panel.id !== targetSubtabId;
  });

  animateMainContentTransition();
  restartAnimationClass(nextPanel, 'animate-in-subtab');
  activeSubtabId = targetSubtabId;
  syncRouteWithState();
}



export function initRouting() {
  // Routing listeners are attached by the main app bootstrap/legacy initializer.
}

export function injectLegendIcons() {
  // Icons are rendered via CSS/SVG in the current modular build; keep as compatibility no-op.
}
