import { qs, qsa } from '../../core/dom.js';
import { renderTierList, renderPopularScripts, renderRecentChanges, renderSavedScriptsList, getSavedScripts, setEditorFromSavedScript, saveScriptFromEditor, deleteSelectedScript, currentSavedScriptId } from './hub.js';
import { scriptsHubData } from '../../data/scriptHub.js';
import { syncNavButtonsWithPage, setActivePage, setActiveSubtab } from '../../core/routing.js';

export function initScriptsHub() {
  renderTierList('tierPaidList', scriptsHubData.tierListPaid);
  renderTierList('tierFreeList', scriptsHubData.tierListFree);
  renderPopularScripts();
  renderRecentChanges();
  renderSavedScriptsList();

  qsa('.subtab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-subtab-target');
      qsa('.subtab-btn').forEach(item => {
        const active = item === btn;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-selected', String(active));
      });
      setActiveSubtab(target);
    });
  });

  qsa('.page-switch-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-page-target');
      syncNavButtonsWithPage(target);
      setActivePage(target);
    });
  });

  qs('#savedScriptsList').addEventListener('click', event => {
    const trigger = event.target.closest('[data-saved-script-id]');
    if (!trigger) return;
    currentSavedScriptId = trigger.getAttribute('data-saved-script-id');
    const selected = getSavedScripts().find(item => item.id === currentSavedScriptId);
    setEditorFromSavedScript(selected);
    renderSavedScriptsList();
  });

  qs('#saveScriptBtn').addEventListener('click', saveScriptFromEditor);
  qs('#deleteScriptBtn').addEventListener('click', deleteSelectedScript);
}
