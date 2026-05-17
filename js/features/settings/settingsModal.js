import { qs, qsa, escapeHtml } from '../../core/dom.js';
import { getAiTokenSummary, getBetaFeaturesEnabled, setBetaFeaturesEnabled, getCurrentAccountName, isGuestAccount } from './accountUi.js';
import { closeModal } from '../executors/modal.js';
import { syncNavButtonsWithPage, setActivePage, syncRouteWithState } from '../../core/routing.js';
import { applyUiMode, getIsNewUiMode, toggleIsNewUiMode } from '../newUi/uiMode.js';

export function openSettingsModal() {
  const overlay = qs('#modalOverlay');
  const content = qs('#modalContent');
  const tokenSummary = getAiTokenSummary();
  const authConfigured = Boolean(window.XyrexAuth?.hasRemoteSync?.());
  const accountActionsDisabled = authConfigured ? '' : 'disabled';

  content.innerHTML = `
    <section class="settings-modal">
      <header class="settings-modal-head">
        <h2>Settings</h2>
        <p class="modal-headline">Manage interface preferences, open the dodge game quickly, and review your AI token balance</p>
      </header>
      <div class="settings-group">
        <h3>Interface</h3>
        <div class="settings-actions">
          <button id="settingsUiModeBtn" class="btn-primary settings-action-btn" type="button">${getIsNewUiMode() ? 'Switch to Default UI' : 'Switch to New UI'}</button>
          <button id="settingsThemeCustomizerBtn" class="btn-primary settings-action-btn" type="button" ${getIsNewUiMode() ? '' : 'disabled'}>Theme Customizer</button>
        </div>
        <p class="settings-note">Theme Customizer is available when New UI mode is active</p>
      </div>
      <div class="settings-group">
        <h3>Gameplay</h3>
        <div class="settings-actions">
          <button id="settingsPlayDodgeBtn" class="btn-primary settings-action-btn" type="button">Play Dodge</button>
          <button id="settingsBetaFeaturesBtn" class="btn-primary settings-action-btn" type="button">${getBetaFeaturesEnabled() ? 'Disable BETA Features' : 'Enable BETA Features'}</button>
        </div>
      </div>
      <div class="settings-group">
        <h3>Account</h3>
        <p class="settings-note">Current account: <strong>${escapeHtml(getCurrentAccountName())}</strong></p>
        <p id="settingsAuthFeedback" class="settings-note" hidden></p>
        <div class="settings-actions">
          <button id="settingsLoginBtn" class="btn-primary settings-action-btn" type="button" ${accountActionsDisabled}>Login</button>
          <button id="settingsSignUpBtn" class="btn-primary settings-action-btn" type="button" ${accountActionsDisabled}>Sign Up</button>
          <button id="settingsResetPasswordBtn" class="btn-primary settings-action-btn" type="button" ${accountActionsDisabled}>Reset Password</button>
          ${isGuestAccount() ? '' : `<button id="settingsLogoutBtn" class="btn-primary settings-action-btn" type="button" ${accountActionsDisabled}>Log Out</button>`}
        </div>
        <p class="settings-note">Use letters, numbers, underscores, or periods for usernames. Passwords require 8+ characters, at least one uppercase letter, and at least one number.</p>
        <p class="settings-note">${authConfigured ? 'Account sync is enabled for this deployment.' : 'Account sync is not configured on this deployment yet.'}</p>
      </div>
      <div class="settings-group">
        <h3>AI Usage</h3>
        <p class="settings-token-count">Available AI tokens: <strong>${tokenSummary.available}</strong></p>
      </div>
      <footer class="settings-credit">Made by Joseph (plutoxqq)</footer>
    </section>`;

  overlay.classList.remove('is-closing');
  overlay.setAttribute('aria-hidden', 'false');

  const uiModeBtn = qs('#settingsUiModeBtn');
  uiModeBtn?.addEventListener('click', async () => {
    toggleIsNewUiMode();
    await applyUiMode();
    syncRouteWithState();
    openSettingsModal();
  });

  const themeBtn = qs('#settingsThemeCustomizerBtn');
  themeBtn?.addEventListener('click', () => {
    if (!getIsNewUiMode() || !window.XyrexNewUI?.toggleThemeCustomizer) return;
    window.XyrexNewUI.toggleThemeCustomizer();
  });

  const dodgeBtn = qs('#settingsPlayDodgeBtn');
  dodgeBtn?.addEventListener('click', () => {
    syncNavButtonsWithPage('easterEggPage');
    setActivePage('easterEggPage');
    closeModal();
  });

  const betaBtn = qs('#settingsBetaFeaturesBtn');
  betaBtn?.addEventListener('click', () => {
    const enabled = !getBetaFeaturesEnabled();
    setBetaFeaturesEnabled(enabled);
    openSettingsModal();
  });

  const authFeedback = qs('#settingsAuthFeedback');
  const setAuthFeedback = (message, type = 'error') => {
    if (!authFeedback) return;
    authFeedback.hidden = !message;
    authFeedback.textContent = message || '';
    authFeedback.className = `settings-note ${type === 'success' ? 'xy-auth-status success' : type === 'error' ? 'xy-auth-status error' : ''}`;
  };

  if (!authConfigured) {
    setAuthFeedback('Account actions are disabled because Supabase auth is not configured on this deployment.', 'error');
  }

  qs('#settingsLoginBtn')?.addEventListener('click', () => {
    if (!isGuestAccount()) {
      setAuthFeedback('You are already logged in. Log out first if you want to switch accounts.', 'error');
      return;
    }
    window.XyrexAuth?.openAuthModal?.('login');
  });
  qs('#settingsSignUpBtn')?.addEventListener('click', () => {
    window.XyrexAuth?.openAuthModal?.('signup');
  });

  qs('#settingsResetPasswordBtn')?.addEventListener('click', async event => {
    const button = event.currentTarget;
    if (!button) return;
    button.disabled = true;
    try {
      window.XyrexAuth?.openAuthModal?.('login');
      setAuthFeedback('Enter your username or email in the login modal and click Reset Password.', 'success');
    } catch (error) {
      setAuthFeedback(error?.message || 'Failed to start password reset flow.', 'error');
    } finally {
      button.disabled = false;
    }
  });
  qs('#settingsLogoutBtn')?.addEventListener('click', async event => {
    const button = event.currentTarget;
    if (!button) return;
    button.disabled = true;
    try {
      await window.XyrexAuth?.logout?.();
      openSettingsModal();
    } finally {
      button.disabled = false;
    }
  });

  qs('#modalCloseBtn').focus();
}

export function closeModal() {
  const overlay = qs('#modalOverlay');
  if (overlay.getAttribute('aria-hidden') === 'true') return;

  overlay.classList.add('is-closing');
  window.setTimeout(() => {
    if (!overlay.classList.contains('is-closing')) return;
    overlay.setAttribute('aria-hidden', 'true');
    overlay.classList.remove('is-closing');
    qs('#modalContent').innerHTML = '';
  }, 190);
}

