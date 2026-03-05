(function () {
  const THEME_KEY = 'xyrex_new_ui_theme';
  let cssLoaded = false;

  function loadCss() {
    if (cssLoaded || document.querySelector('link[data-new-ui-css="true"]')) {
      cssLoaded = true;
      return;
    }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = './new-ui.css?v=1.0.0';
    link.dataset.newUiCss = 'true';
    document.head.appendChild(link);
    cssLoaded = true;
  }

  function getThemeFromStorage() {
    try {
      return JSON.parse(localStorage.getItem(THEME_KEY) || 'null');
    } catch {
      return null;
    }
  }

  function applyTheme(theme) {
    if (!theme || typeof theme !== 'object') return;
    const root = document.documentElement;
    if (theme.accent) root.style.setProperty('--periwinkle', theme.accent);
    if (theme.accentSoft) root.style.setProperty('--periwinkle-2', theme.accentSoft);
  }

  function clearThemeOverrides() {
    const root = document.documentElement;
    root.style.removeProperty('--periwinkle');
    root.style.removeProperty('--periwinkle-2');
  }

  function resetTheme() {
    clearThemeOverrides();
    localStorage.removeItem(THEME_KEY);
  }

  function buildThemeCustomizerPanel() {
    const scriptsPage = document.querySelector('#scriptsPage');
    if (!scriptsPage || scriptsPage.querySelector('.new-ui-panel.theme-customizer')) return;

    const wrap = document.createElement('section');
    wrap.className = 'new-ui-panel theme-customizer';
    wrap.innerHTML = `
      <h3>Theme Customizer (BETA)</h3>
      <p class="modal-headline">Tune the accent colors for the New UI experience.</p>
      <div class="theme-customizer-grid">
        <label>Primary Accent <input type="color" id="newUiAccent" value="#8f9cff" /></label>
        <label>Secondary Accent <input type="color" id="newUiAccentSoft" value="#b2bcff" /></label>
      </div>
      <div class="theme-actions">
        <button type="button" class="btn-primary" id="saveNewUiThemeBtn">Apply Theme</button>
        <button type="button" class="btn-danger" id="resetNewUiThemeBtn">Reset</button>
      </div>
      <div class="new-ui-chip-row">
        <span>New UI Exclusive</span>
        <span>Live Accent Preview</span>
        <span>Saved Locally</span>
      </div>
    `;

    scriptsPage.prepend(wrap);

    const theme = getThemeFromStorage();
    if (theme?.accent) wrap.querySelector('#newUiAccent').value = theme.accent;
    if (theme?.accentSoft) wrap.querySelector('#newUiAccentSoft').value = theme.accentSoft;

    wrap.querySelector('#saveNewUiThemeBtn').addEventListener('click', () => {
      const accent = wrap.querySelector('#newUiAccent').value;
      const accentSoft = wrap.querySelector('#newUiAccentSoft').value;
      const payload = { accent, accentSoft };
      localStorage.setItem(THEME_KEY, JSON.stringify(payload));
      applyTheme(payload);
    });

    wrap.querySelector('#resetNewUiThemeBtn').addEventListener('click', () => {
      wrap.querySelector('#newUiAccent').value = '#8f9cff';
      wrap.querySelector('#newUiAccentSoft').value = '#b2bcff';
      clearThemeOverrides();
    });
  }

  function removeNewUiPanels() {
    document.querySelectorAll('.new-ui-panel, .new-ui-badge').forEach(node => node.remove());
  }

  function injectBadgesAndStats() {
    const pageHeader = document.querySelector('.subpage-header h2');
    if (pageHeader && !document.querySelector('.new-ui-badge')) {
      const badge = document.createElement('span');
      badge.className = 'new-ui-badge';
      badge.textContent = 'New UI Active';
      pageHeader.insertAdjacentElement('afterend', badge);
    }

    const executorsPage = document.querySelector('#executorsPage');
    if (executorsPage && !executorsPage.querySelector('.new-ui-panel.executor-insights')) {
      const statPanel = document.createElement('section');
      statPanel.className = 'new-ui-panel executor-insights';
      statPanel.innerHTML = `
        <h3>Executor Insights</h3>
        <div class="new-ui-stats">
          <article><strong>Live Search + Filter Blend</strong><p class="modal-headline">Improved card consistency, cleaner spacing, and smoother transitions.</p></article>
          <article><strong>Modern More Info</strong><p class="modal-headline">Compact detail cards and cleaner content hierarchy.</p></article>
          <article><strong>Scripts Hub Refresh</strong><p class="modal-headline">Updated tier picks and modernized tab polish for readability.</p></article>
        </div>
      `;
      executorsPage.insertBefore(statPanel, executorsPage.querySelector('#productGrid'));
    }
  }

  function enable() {
    loadCss();
    document.body.classList.add('new-ui-enabled');
    injectBadgesAndStats();
    buildThemeCustomizerPanel();
    applyTheme(getThemeFromStorage());
  }

  function disable() {
    document.body.classList.remove('new-ui-enabled');
    removeNewUiPanels();
    clearThemeOverrides();
  }

  window.XyrexNewUI = {
    enable,
    disable,
    applyStoredTheme() {
      applyTheme(getThemeFromStorage());
    }
  };
})();
