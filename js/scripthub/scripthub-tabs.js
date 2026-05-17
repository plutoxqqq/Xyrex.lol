import { qsa, qs } from '../core/dom.js';

export function initScripthubTabs(ctx) {
  const { syncSubtabButtons, setActiveSubtab, syncNavButtonsWithPage, setActivePage } = ctx;
  const subtabButtons = qsa('.subtab-btn');
  subtabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-subtab-target');
      syncSubtabButtons(target);
      setActiveSubtab(target, { moveFocus: true });
    });
  });
  qsa('.page-switch-btn').forEach(btn => btn.addEventListener('click', () => {
    const target = btn.getAttribute('data-page-target');
    syncNavButtonsWithPage(target);
    setActivePage(target);
  }));
  qs('#savedScriptsList').addEventListener('click', ctx.onSavedScriptListClick);
  qs('#saveScriptBtn').addEventListener('click', ctx.saveScriptFromEditor);
  qs('#deleteScriptBtn').addEventListener('click', ctx.deleteSelectedScript);
}
