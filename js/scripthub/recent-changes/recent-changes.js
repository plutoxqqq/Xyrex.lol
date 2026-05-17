import { qs } from '../../core/dom.js';
import { escapeHtml } from '../../core/utils.js';

export function initRecentChanges(ctx) {
  const wrap = qs('#recentChangesList');
  if (!wrap) return;
  wrap.innerHTML = (ctx.scriptsHubData.recentChanges || []).map(entry => `<li>${escapeHtml(entry)}</li>`).join('');
}
