import { openSettingsModal } from './settingsModal.js';

export function initSettings() {
  const button = document.getElementById('settingsTabBtn');
  if (!button) return;
  button.addEventListener('click', () => openSettingsModal());
}
