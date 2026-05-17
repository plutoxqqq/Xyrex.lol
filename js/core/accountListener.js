import { qs } from './dom.js';
import { openSettingsModal } from '../features/settings/settingsModal.js';

export function registerAccountChangeListener() {
  window.addEventListener('xyrex:account-changed', () => {
    const overlay = qs('#modalOverlay');
    if (overlay?.getAttribute('aria-hidden') === 'false' && qs('.settings-modal')) {
      openSettingsModal();
    }
  });
}
