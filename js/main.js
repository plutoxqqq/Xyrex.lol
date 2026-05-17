import './data/executors.js';
import './data/changelog.js';
import './data/scripts.js';

import { safeInit } from './core/init.js';
import { initLegacyApp } from './legacy-app.js';

function initNavigation() {}
function initExecutorsPage() {}
function initScriptsHub() {}
function initModals() {}

function bootstrap() {
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
