import { initSmartRankings } from './smart-rankings/smart-rankings.js';
import { initComparison } from './comparison/comparison.js';
import { initAssistant } from './assistant/assistant.js';
import { initPopularScripts } from './popular-scripts/popular-scripts.js';
import { initSavedScripts } from './saved-scripts/saved-scripts.js';
import { initRecentChanges } from './recent-changes/recent-changes.js';
import { initScripthubTabs } from './scripthub-tabs.js';

export function initScripthubPage(ctx) {
  initSmartRankings(ctx);
  initComparison(ctx);
  initPopularScripts(ctx);
  initRecentChanges(ctx);
  initSavedScripts(ctx);
  initAssistant(ctx);
  initScripthubTabs(ctx);
}
