import { qs } from '../../core/dom.js';
import { escapeHtml } from '../../core/utils.js';

const savedScriptsStorageKey = 'xyrex_saved_scripts_v1';
export function getSavedScripts(){ try{ const p=JSON.parse(localStorage.getItem(savedScriptsStorageKey)||'[]'); return Array.isArray(p)?p:[];}catch{return [];} }
export function initSavedScripts() {
  const wrap = qs('#savedScriptsList');
  if (!wrap) return;
  const items = getSavedScripts();
  wrap.innerHTML = items.map(item=>`<button type="button" class="saved-script-item" data-saved-script-id="${escapeHtml(item.id)}">${escapeHtml(item.title||'Untitled')}</button>`).join('');
}
