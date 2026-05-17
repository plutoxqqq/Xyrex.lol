(function () {
  window.XyrexModules = window.XyrexModules || {};
  window.XyrexModules.hideInitialLoadingOverlay = function hideInitialLoadingOverlay() {
    const overlay = document.querySelector('#appLoadingOverlay');
    if (!overlay) return;
    overlay.classList.add('is-hidden');
    window.setTimeout(() => overlay.remove(), 260);
  };
})();
