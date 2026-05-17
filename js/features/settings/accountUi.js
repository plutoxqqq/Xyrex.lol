import { qs } from '../../core/dom.js';

export function getAiTokenSummary() {
  const fallback = { available: 0, freeRemaining: 0, purchased: 0 };
  const summary = window.XyrexDodge?.getTokenSummary?.();
  if (!summary || typeof summary !== 'object') return fallback;
  return {
    available: Number.isFinite(summary.available) ? summary.available : 0,
    freeRemaining: Number.isFinite(summary.freeRemaining) ? summary.freeRemaining : 0,
    purchased: Number.isFinite(summary.purchased) ? summary.purchased : 0
  };
}


export function getBetaFeaturesEnabled() {
  return localStorage.getItem('xyrex_beta_features') === 'enabled';
}

export function setBetaFeaturesEnabled(enabled) {
  localStorage.setItem('xyrex_beta_features', enabled ? 'enabled' : 'disabled');
  document.body.classList.toggle('beta-features-enabled', enabled);
}

export function getCurrentAccountName() {
  const account = window.XyrexAuth?.getCurrentAccount?.() || window.XyrexAccountScope?.getAccount?.() || 'guest';
  return String(account || 'guest');
}

export function isGuestAccount() {
  return getCurrentAccountName() === 'guest';
}

