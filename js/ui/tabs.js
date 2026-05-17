(function () {
  window.XyrexModules = window.XyrexModules || {};
  window.XyrexModules.createTabsModule = function createTabsModule(deps) {
    const { qsa, setActiveSubtab, syncSubtabButtons, syncNavButtonsWithPage, setActivePage } = deps;
    function bindTabEvents() {
      const subtabButtons = qsa('.subtab-btn');
      subtabButtons.forEach(btn => {
        btn.addEventListener('click', () => { const target = btn.getAttribute('data-subtab-target'); syncSubtabButtons(target); setActiveSubtab(target, { moveFocus: true }); });
        btn.addEventListener('keydown', event => {
          const key = event.key;
          if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(key)) return;
          event.preventDefault();
          const currentIndex = subtabButtons.indexOf(btn); let nextIndex = currentIndex;
          if (key === 'ArrowLeft' || key === 'ArrowUp') nextIndex = (currentIndex - 1 + subtabButtons.length) % subtabButtons.length;
          if (key === 'ArrowRight' || key === 'ArrowDown') nextIndex = (currentIndex + 1) % subtabButtons.length;
          if (key === 'Home') nextIndex = 0; if (key === 'End') nextIndex = subtabButtons.length - 1;
          const nextButton = subtabButtons[nextIndex]; if (!nextButton) return; nextButton.focus();
          const target = nextButton.getAttribute('data-subtab-target'); syncSubtabButtons(target); setActiveSubtab(target, { moveFocus: true });
        });
      });
      qsa('.page-switch-btn').forEach(btn => {
        btn.addEventListener('click', () => { const target = btn.getAttribute('data-page-target'); syncNavButtonsWithPage(target); setActivePage(target); });
      });
    }
    return { bindTabEvents };
  };
})();
