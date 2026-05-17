import './data/executors.js';
import './data/changelog.js';
import './data/scripts.js';

import { safeInit } from './core/init.js';
import { initLegacyApp } from './legacy-app.js';
import { initSupabaseConfig } from './config/supabase.js';
import { initAuth } from './features/auth/accountAuth.js';
import { initDodge } from './features/dodge/xyrexDodge.js';
import { registerAccountChangeListener } from './core/accountListener.js';

function initNavigation() {}
function initExecutorsPage() {}
function initScriptsHub() {}
function initModals() {}

registerAccountChangeListener();

function bootstrap() {
  safeInit('supabase config', initSupabaseConfig);
  safeInit('dodge', initDodge);
  safeInit('auth', initAuth);
  safeInit('Router', () => {});
  safeInit('SEO', () => {});
  safeInit('Navigation', initNavigation);
  safeInit('Executors Page', initExecutorsPage);
  safeInit('Scripts Hub', initScriptsHub);
  safeInit('Loading Screen', () => {});
  safeInit('Modals', initModals);
  safeInit('Legacy App', initLegacyApp);
}

document.addEventListener('DOMContentLoaded', bootstrap);
