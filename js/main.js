import './data/executors.js';
import './data/changelog.js';
import './data/scripts.js';

import { safeInit } from './core/init.js';
import { initNavigation } from './core/navigation.js';
import { initRouting } from './core/routing.js';
import { initLegacyApp } from './legacy-app.js';
import { initSupabaseConfig } from './config/supabase.js';
import { initAuth } from './features/auth/accountAuth.js';
import { initDodge } from './features/dodge/xyrexDodge.js';
import { initScriptsHub } from './features/scriptsHub/initHub.js';
import { initSettings } from './features/settings/settings.js';
import { registerAccountChangeListener } from './core/accountListener.js';

function initExecutors() {}
function initExecutorFilters() {}
function initComparison() {}
function initAssistant() {}

registerAccountChangeListener();

document.addEventListener('DOMContentLoaded', () => {
  safeInit('supabase config', initSupabaseConfig);
  safeInit('dodge', initDodge);
  safeInit('auth', initAuth);
  safeInit('routing', initRouting);
  safeInit('navigation', initNavigation);
  safeInit('executors', initExecutors);
  safeInit('filters', initExecutorFilters);
  safeInit('comparison', initComparison);
  safeInit('script hub', initScriptsHub);
  safeInit('assistant', initAssistant);
  safeInit('settings', initSettings);
  safeInit('legacy app', initLegacyApp);
});
