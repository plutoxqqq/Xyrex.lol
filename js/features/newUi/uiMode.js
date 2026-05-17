import { qs } from '../../core/dom.js';

export const uiModeStorageKey = 'xyrex_ui_mode';
let isNewUiMode = localStorage.getItem(uiModeStorageKey) === 'new';

export function getIsNewUiMode() {
  return isNewUiMode;
}

export function setIsNewUiMode(nextValue) {
  isNewUiMode = Boolean(nextValue);
  localStorage.setItem(uiModeStorageKey, isNewUiMode ? 'new' : 'default');
  return isNewUiMode;
}

export function toggleIsNewUiMode() {
  return setIsNewUiMode(!isNewUiMode);
}
let newUiLoadAttempted = false;

export function loadNewUiModule() {
  if (window.XyrexNewUI) return Promise.resolve(true);
  if (newUiLoadAttempted) return Promise.resolve(false);
  newUiLoadAttempted = true;
  return import('./newUi.js').then(() => Boolean(window.XyrexNewUI)).catch(() => false);
}

export async function applyUiMode() {
  if (!isNewUiMode) {
    if (window.XyrexNewUI) window.XyrexNewUI.disable();
    return;
  }

  const loaded = await loadNewUiModule();
  if (!loaded || !window.XyrexNewUI) {
    setIsNewUiMode(false);
    return;
  }

  window.XyrexNewUI.enable();
}
