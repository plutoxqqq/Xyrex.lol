(function () {
  const THEME_KEY = 'xyrex_new_ui_theme';
  const AI_ENDPOINT = 'https://text.pollinations.ai/';
  const THEME_MODAL_ID = 'newUiThemeModal';
  const AI_REQUEST_TIMEOUT_MS = 9000;

  let cssLoaded = false;
  let gridObserver = null;

  function loadCss() {
    if (cssLoaded || document.querySelector('link[data-new-ui-css="true"]')) {
      cssLoaded = true;
      return;
    }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = './new-ui.css?v=2.0.0';
    link.dataset.newUiCss = 'true';
    document.head.appendChild(link);
    cssLoaded = true;
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
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


  function closeThemeModal() {
    const modal = document.getElementById(THEME_MODAL_ID);
    if (!modal) return;
    modal.setAttribute('aria-hidden', 'true');
  }

  function ensureThemeModal() {
    if (document.getElementById(THEME_MODAL_ID)) return;

    const modal = document.createElement('div');
    modal.id = THEME_MODAL_ID;
    modal.className = 'new-ui-theme-modal';
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = `
      <section class="new-ui-theme-panel" role="dialog" aria-modal="true" aria-label="Theme Customizer">
        <header class="new-ui-theme-head">
          <div>
            <h3>Theme Customizer</h3>
            <p>Adjust New UI accent colors with live preview.</p>
          </div>
          <button type="button" class="new-ui-theme-close" aria-label="Close Theme Customizer">✕</button>
        </header>
        <div class="new-ui-theme-grid">
          <label>Primary Accent <input type="color" id="newUiAccent" value="#8f9cff" /></label>
          <label>Secondary Accent <input type="color" id="newUiAccentSoft" value="#b2bcff" /></label>
        </div>
        <div class="new-ui-theme-actions">
          <button type="button" class="btn-primary" id="saveNewUiThemeBtn">Apply Theme</button>
          <button type="button" class="btn-danger" id="resetNewUiThemeBtn">Reset</button>
        </div>
      </section>
    `;

    document.body.appendChild(modal);

    const saved = getThemeFromStorage();
    if (saved?.accent) modal.querySelector('#newUiAccent').value = saved.accent;
    if (saved?.accentSoft) modal.querySelector('#newUiAccentSoft').value = saved.accentSoft;

    modal.querySelector('#saveNewUiThemeBtn').addEventListener('click', () => {
      const accent = modal.querySelector('#newUiAccent').value;
      const accentSoft = modal.querySelector('#newUiAccentSoft').value;
      const payload = { accent, accentSoft };
      localStorage.setItem(THEME_KEY, JSON.stringify(payload));
      applyTheme(payload);
    });

    modal.querySelector('#resetNewUiThemeBtn').addEventListener('click', () => {
      modal.querySelector('#newUiAccent').value = '#8f9cff';
      modal.querySelector('#newUiAccentSoft').value = '#b2bcff';
      localStorage.removeItem(THEME_KEY);
      clearThemeOverrides();
    });

    modal.querySelector('.new-ui-theme-close').addEventListener('click', closeThemeModal);
    modal.addEventListener('click', event => {
      if (event.target === modal) closeThemeModal();
    });
    modal.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeThemeModal();
    });
  }

  function toggleThemeCustomizer() {
    if (!document.body.classList.contains('new-ui-enabled')) return;
    const modal = document.getElementById(THEME_MODAL_ID);
    if (!modal) return;
    const isHidden = modal.getAttribute('aria-hidden') !== 'false';
    modal.setAttribute('aria-hidden', isHidden ? 'false' : 'true');
    if (isHidden) modal.querySelector('.new-ui-theme-close')?.focus();
  }

  function ensureInsightsPanel() {
    const executorsPage = document.querySelector('#executorsPage');
    if (!executorsPage || executorsPage.querySelector('.new-ui-panel.executor-insights')) return;

    const panel = document.createElement('section');
    panel.className = 'new-ui-panel executor-insights';
    panel.innerHTML = `
      <div class="insights-head">
        <h3>Executor Insights</h3>
        <span class="new-ui-chip">AI Powered</span>
      </div>
      <p class="modal-headline">Select <strong>AI Insight</strong> on any executor card to generate a focused recommendation and caution summary.</p>
      <div id="executorInsightResult" class="ai-result" hidden></div>
    `;

    const grid = executorsPage.querySelector('#productGrid');
    if (grid) executorsPage.insertBefore(panel, grid);
  }

  function productFromCard(card) {
    return {
      name: card.querySelector('.product-name')?.textContent?.trim() || 'Unknown Executor',
      description: card.querySelector('.summary')?.textContent?.trim() || 'No description available.',
      price: card.querySelector('.price')?.textContent?.trim() || 'Unknown',
      sunc: card.querySelector('.sunc')?.textContent?.trim() || 'Unknown'
    };
  }

  async function generateInsight(product) {
    const prompt = [
      'You are a concise product analyst.',
      'Write two short paragraphs and then exactly three bullet points.',
      `Executor: ${product.name}`,
      `Description: ${product.description}`,
      `Pricing: ${product.price}`,
      `sUNC: ${product.sunc}`,
      'Focus on reliability, who this is suitable for, and practical caution.'
    ].join('\n');

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), AI_REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(`${AI_ENDPOINT}${encodeURIComponent(prompt)}`, { signal: controller.signal });
      if (!response.ok) throw new Error(`AI request failed (${response.status})`);
      const text = (await response.text()).trim();
      if (!text) throw new Error('AI returned an empty response.');
      return text;
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  async function handleInsightClick(card, button) {
    const result = document.querySelector('#executorInsightResult');
    if (!result) return;

    const product = productFromCard(card);
    button.disabled = true;
    button.textContent = 'Generating...';
    result.hidden = false;
    result.innerHTML = `<strong>${escapeHtml(product.name)}</strong><p>Generating AI insight...</p>`;

    try {
      const insight = await generateInsight(product);
      result.innerHTML = `<strong>${escapeHtml(product.name)}</strong><p>${escapeHtml(insight).replace(/\n/g, '<br />')}</p>`;
    } catch (error) {
      result.innerHTML = `<strong>${escapeHtml(product.name)}</strong><p>AI insight is temporarily unavailable. Please try again shortly.</p>`;
      console.warn(error);
    } finally {
      button.disabled = false;
      button.textContent = 'AI Insight';
    }
  }

  function enhanceCardsForNewUi() {
    const executorsPage = document.querySelector('#executorsPage');
    if (!executorsPage) return;

    executorsPage.querySelectorAll('.card').forEach(card => {
      const existingActionRow = card.querySelector('.new-ui-actions');
      if (existingActionRow) existingActionRow.remove();

      const infoBtn = card.querySelector('.info-btn');
      if (!infoBtn) return;

      const actionRow = document.createElement('div');
      actionRow.className = 'new-ui-actions';

      infoBtn.classList.add('new-ui-info-btn');
      actionRow.appendChild(infoBtn);

      const aiBtn = document.createElement('button');
      aiBtn.type = 'button';
      aiBtn.className = 'new-ui-ai-btn';
      aiBtn.textContent = 'AI Insight';
      aiBtn.addEventListener('click', () => handleInsightClick(card, aiBtn));
      actionRow.appendChild(aiBtn);

      card.appendChild(actionRow);
    });
  }

  function restoreDefaultCardActions() {
    document.querySelectorAll('.card .new-ui-actions').forEach(row => {
      const infoBtn = row.querySelector('.info-btn');
      if (infoBtn) {
        infoBtn.classList.remove('new-ui-info-btn');
        row.parentElement.appendChild(infoBtn);
      }
      row.remove();
    });
  }

  function watchGridUpdates() {
    const grid = document.querySelector('#productGrid');
    if (!grid || gridObserver) return;

    gridObserver = new MutationObserver(() => {
      if (!document.body.classList.contains('new-ui-enabled')) return;
      enhanceCardsForNewUi();
    });

    gridObserver.observe(grid, { childList: true });
  }

  function stopWatchingGridUpdates() {
    if (!gridObserver) return;
    gridObserver.disconnect();
    gridObserver = null;
  }

  function injectBadge() {
    const header = document.querySelector('.subpage-header h2');
    if (!header || document.querySelector('.new-ui-badge')) return;

    const badge = document.createElement('span');
    badge.className = 'new-ui-badge';
    badge.textContent = 'New UI Active';
    header.insertAdjacentElement('afterend', badge);
  }

  function removeInjectedElements() {
    document.querySelectorAll('.new-ui-badge, .new-ui-panel').forEach(node => node.remove());
    const modal = document.getElementById(THEME_MODAL_ID);
    if (modal) modal.remove();
  }

  function enable() {
    loadCss();
    document.body.classList.add('new-ui-enabled');
    injectBadge();
    ensureThemeModal();
    ensureInsightsPanel();
    enhanceCardsForNewUi();
    watchGridUpdates();
    applyTheme(getThemeFromStorage());
  }

  function disable() {
    document.body.classList.remove('new-ui-enabled');
    closeThemeModal();
    stopWatchingGridUpdates();
    restoreDefaultCardActions();
    removeInjectedElements();
    clearThemeOverrides();
  }

  window.XyrexNewUI = {
    enable,
    disable,
    toggleThemeCustomizer,
    applyStoredTheme() {
      applyTheme(getThemeFromStorage());
    }
  };
})();
