(function () {
  const THEME_KEY = 'xyrex_new_ui_theme';
  const AI_ENDPOINT = 'https://text.pollinations.ai/';
  const THEME_MODAL_ID = 'newUiThemeModal';
  const AI_REQUEST_TIMEOUT_MS = 14000;
  const AI_MAX_ATTEMPTS = 4;
  const AI_CACHE_KEY = 'xyrex_ai_insight_cache_v1';
  const DODGE_STORAGE_KEY = 'xyrex_dodge_save_v1';
  const FREE_DAILY_AI_TOKENS = 5;

  const themeDefaults = {
    bg: '#06070d',
    bg2: '#0a0c14',
    panel: '#111426',
    panel2: '#12172b',
    card: '#12162a',
    text: '#eef1ff',
    muted: '#aeb5d6',
    accent: '#8f9cff',
    accentSoft: '#b2bcff',
    success: '#5dd39e',
    warning: '#f0c36f'
  };

  const themeFields = [
    ['bg', '--bg'],
    ['bg2', '--bg-2'],
    ['panel', '--panel'],
    ['panel2', '--panel-2'],
    ['card', '--card'],
    ['text', '--text'],
    ['muted', '--muted'],
    ['accent', '--periwinkle'],
    ['accentSoft', '--periwinkle-2'],
    ['success', '--accent-success'],
    ['warning', '--accent-warning']
  ];

  const pastelThemePresets = [
    {
      id: 'lavender-mist',
      label: 'Lavender Mist',
      colors: {
        bg: '#191a29', bg2: '#21233a', panel: '#2a2d49', panel2: '#323556', card: '#3a3e66',
        text: '#f8f4ff', muted: '#d5cde8', accent: '#c5b7ff', accentSoft: '#e2d8ff', success: '#9fe0bf', warning: '#ffd8a8'
      }
    },
    {
      id: 'mint-cloud',
      label: 'Mint Cloud',
      colors: {
        bg: '#182324', bg2: '#223032', panel: '#2c3f41', panel2: '#355053', card: '#3f6064',
        text: '#f2fffa', muted: '#c9e8dd', accent: '#9ddfd3', accentSoft: '#c5f1e8', success: '#a8eac8', warning: '#ffd9aa'
      }
    },
    {
      id: 'peach-haze',
      label: 'Peach Haze',
      colors: {
        bg: '#2a1f1d', bg2: '#352724', panel: '#43312d', panel2: '#523a35', card: '#60443e',
        text: '#fff5ef', muted: '#e8ccc2', accent: '#ffb8a6', accentSoft: '#ffd8cc', success: '#b7e5be', warning: '#ffe0a6'
      }
    },
    {
      id: 'powder-sky',
      label: 'Powder Sky',
      colors: {
        bg: '#1a2230', bg2: '#232d3f', panel: '#2d3950', panel2: '#36445f', card: '#425373',
        text: '#f1f7ff', muted: '#c8d8ec', accent: '#abcfff', accentSoft: '#d4e6ff', success: '#a7dfcf', warning: '#ffe0aa'
      }
    },
    {
      id: 'pink-bloom',
      label: 'Pink Bloom',
      colors: {
        bg: '#2b1423', bg2: '#381a2d', panel: '#4a223c', panel2: '#5d2b4d', card: '#723760',
        text: '#fff0fb', muted: '#efbfdc', accent: '#ff78c9', accentSoft: '#ffc4e8', success: '#a4e6c8', warning: '#ffd7ad'
      }
    }
  ];

  let cssLoaded = false;
  let gridObserver = null;

  function loadCss() {
    if (cssLoaded || document.querySelector('link[data-new-ui-css="true"]')) {
      cssLoaded = true;
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/new-ui.css?v=2.1.0';
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

  function hexToRgb(hex) {
    const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '');
    if (!match) return null;
    return { r: parseInt(match[1], 16), g: parseInt(match[2], 16), b: parseInt(match[3], 16) };
  }

  function rgbToHex(r, g, b) {
    return `#${[r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('')}`;
  }

  function shiftRgb(rgb, amount) {
    return rgbToHex(rgb.r + amount, rgb.g + amount, rgb.b + amount);
  }

  function mixRgb(a, b, ratio) {
    return rgbToHex(
      a.r * (1 - ratio) + b.r * ratio,
      a.g * (1 - ratio) + b.g * ratio,
      a.b * (1 - ratio) + b.b * ratio
    );
  }

  function applyTheme(theme) {
    if (!theme || typeof theme !== 'object') return;
    const root = document.documentElement;

    const normalized = { ...themeDefaults, ...theme };
    themeFields.forEach(([key, cssVar]) => {
      const value = normalized[key];
      if (typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value)) {
        root.style.setProperty(cssVar, value);
      }
    });
  }

  function clearThemeOverrides() {
    const root = document.documentElement;
    themeFields.forEach(([, cssVar]) => {
      root.style.removeProperty(cssVar);
    });
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
            <p>Adjust the full site palette and mood with live preview</p>
          </div>
          <button type="button" class="new-ui-theme-close" aria-label="Close Theme Customizer">✕</button>
        </header>
        <div class="new-ui-theme-tabs" role="tablist" aria-label="Theme customizer mode">
          <button type="button" class="new-ui-theme-tab is-active" role="tab" aria-selected="true" data-theme-tab-target="newUiThemeBasicPanel">Basic</button>
          <button type="button" class="new-ui-theme-tab" role="tab" aria-selected="false" data-theme-tab-target="newUiThemeAdvancedPanel">Advanced</button>
        </div>

        <section id="newUiThemeBasicPanel" class="new-ui-theme-panel-block" role="tabpanel">
          <p class="new-ui-theme-note">Choose a pastel preset</p>
          <div id="newUiPresetSwatches" class="new-ui-preset-swatches"></div>
        </section>

        <section id="newUiThemeAdvancedPanel" class="new-ui-theme-panel-block" role="tabpanel" hidden>
          <div class="new-ui-theme-grid">
            <label>Background <input type="color" id="newUiBg" value="#06070d" /></label>
            <label>Background 2 <input type="color" id="newUiBg2" value="#0a0c14" /></label>
            <label>Panel <input type="color" id="newUiPanel" value="#111426" /></label>
            <label>Panel 2 <input type="color" id="newUiPanel2" value="#12172b" /></label>
            <label>Card <input type="color" id="newUiCard" value="#12162a" /></label>
            <label>Text <input type="color" id="newUiText" value="#eef1ff" /></label>
            <label>Muted Text <input type="color" id="newUiMuted" value="#aeb5d6" /></label>
            <label>Primary Accent <input type="color" id="newUiAccent" value="#8f9cff" /></label>
            <label>Secondary Accent <input type="color" id="newUiAccentSoft" value="#b2bcff" /></label>
            <label>Success Accent <input type="color" id="newUiSuccess" value="#5dd39e" /></label>
            <label>Warning Accent <input type="color" id="newUiWarning" value="#f0c36f" /></label>
          </div>
        </section>

        <div class="new-ui-theme-actions">
          <button type="button" class="btn-primary" id="saveNewUiThemeBtn">Apply Theme</button>
          <button type="button" class="btn-danger" id="resetNewUiThemeBtn">Reset</button>
        </div>
      </section>
    `;

    document.body.appendChild(modal);

    const colorInputMap = {
      bg: '#newUiBg',
      bg2: '#newUiBg2',
      panel: '#newUiPanel',
      panel2: '#newUiPanel2',
      card: '#newUiCard',
      text: '#newUiText',
      muted: '#newUiMuted',
      accent: '#newUiAccent',
      accentSoft: '#newUiAccentSoft',
      success: '#newUiSuccess',
      warning: '#newUiWarning'
    };

    const saved = { ...themeDefaults, ...(getThemeFromStorage() || {}) };

    const presetWrap = modal.querySelector('#newUiPresetSwatches');
    presetWrap.innerHTML = pastelThemePresets.map(preset => `
      <button
        type="button"
        class="new-ui-preset-swatch"
        title="${escapeHtml(preset.label)}"
        aria-label="${escapeHtml(preset.label)}"
        data-preset-id="${escapeHtml(preset.id)}"
        style="background: radial-gradient(circle at 28% 22%, ${preset.colors.accentSoft}, ${preset.colors.accent} 44%, ${preset.colors.panel} 100%);"
      ></button>
    `).join('');

    const setInputValues = palette => {
      const merged = { ...themeDefaults, ...(palette || {}) };
      Object.entries(colorInputMap).forEach(([key, selector]) => {
        const input = modal.querySelector(selector);
        if (!input) return;
        input.value = merged[key] || themeDefaults[key];
      });
    };

    const collectInputValues = () => {
      const payload = {};
      Object.entries(colorInputMap).forEach(([key, selector]) => {
        const input = modal.querySelector(selector);
        payload[key] = input?.value || themeDefaults[key];
      });
      return payload;
    };

    const setThemeTab = panelId => {
      modal.querySelectorAll('.new-ui-theme-tab').forEach(tab => {
        const active = tab.getAttribute('data-theme-tab-target') === panelId;
        tab.classList.toggle('is-active', active);
        tab.setAttribute('aria-selected', String(active));
      });
      modal.querySelectorAll('.new-ui-theme-panel-block').forEach(panel => {
        panel.hidden = panel.id !== panelId;
      });
    };

    setThemeTab('newUiThemeBasicPanel');
    setInputValues(saved);

    modal.querySelectorAll('.new-ui-theme-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        setThemeTab(tab.getAttribute('data-theme-tab-target'));
      });
    });

    presetWrap.addEventListener('click', event => {
      const trigger = event.target.closest('[data-preset-id]');
      if (!trigger) return;
      const preset = pastelThemePresets.find(item => item.id === trigger.getAttribute('data-preset-id'));
      if (!preset) return;
      setInputValues(preset.colors);
      applyTheme(preset.colors);
      localStorage.setItem(THEME_KEY, JSON.stringify(preset.colors));
    });

    modal.querySelector('#saveNewUiThemeBtn').addEventListener('click', () => {
      const payload = collectInputValues();
      localStorage.setItem(THEME_KEY, JSON.stringify(payload));
      applyTheme(payload);
    });

    modal.querySelector('#resetNewUiThemeBtn').addEventListener('click', () => {
      Object.entries(colorInputMap).forEach(([key, selector]) => {
        const input = modal.querySelector(selector);
        if (input) input.value = themeDefaults[key];
      });
      localStorage.removeItem(THEME_KEY);
      clearThemeOverrides();
    });

    modal.querySelector('.new-ui-theme-close').addEventListener('click', closeThemeModal);
    modal.addEventListener('click', event => {
      if (event.target === modal) closeThemeModal();
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
        <span class="new-ui-chip no-text-select">AI Powered</span>
      </div>
      <p class="modal-headline">Select <strong>AI Insight</strong> on any executor card to generate a focused recommendation and caution summary</p>
      <div id="executorInsightResult" class="ai-result" hidden></div>
    `;

    const grid = executorsPage.querySelector('#productGrid');
    if (grid) executorsPage.insertBefore(panel, grid);
  }


  function getDodgeData() {
    try {
      const parsed = JSON.parse(localStorage.getItem(DODGE_STORAGE_KEY) || '{}');
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }

  function writeDodgeData(payload) {
    localStorage.setItem(DODGE_STORAGE_KEY, JSON.stringify(payload));
  }

  function getDayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  function normalizeTokenState(data) {
    const next = { ...data };
    const today = getDayKey();
    if (next.aiTokenDate !== today) {
      next.aiTokenDate = today;
      next.aiTokensUsedToday = 0;
    }
    if (!Number.isFinite(next.aiTokensUsedToday) || next.aiTokensUsedToday < 0) next.aiTokensUsedToday = 0;
    if (!Number.isFinite(next.aiPurchasedTokens) || next.aiPurchasedTokens < 0) next.aiPurchasedTokens = 0;
    if (!Array.isArray(next.ownedModifiers)) next.ownedModifiers = ['Balanced'];
    if (typeof next.selectedModifier !== 'string') next.selectedModifier = 'Balanced';
    if (!Array.isArray(next.ownedPowerups)) next.ownedPowerups = [];
    if (!Number.isFinite(next.coins) || next.coins < 0) next.coins = 0;
    if (!Number.isFinite(next.bestScore) || next.bestScore < 0) next.bestScore = 0;
    return next;
  }

  function availableAiTokensFromState(data) {
    const freeRemaining = Math.max(0, FREE_DAILY_AI_TOKENS - data.aiTokensUsedToday);
    return freeRemaining + Math.max(0, data.aiPurchasedTokens);
  }

  function tryConsumeAiToken() {
    const raw = getDodgeData();
    const data = normalizeTokenState(raw);
    const available = availableAiTokensFromState(data);
    if (available <= 0) return false;

    const freeRemaining = Math.max(0, FREE_DAILY_AI_TOKENS - data.aiTokensUsedToday);
    if (freeRemaining > 0) data.aiTokensUsedToday += 1;
    else data.aiPurchasedTokens = Math.max(0, data.aiPurchasedTokens - 1);

    writeDodgeData(data);
    return true;
  }

  function productFromCard(card) {
    return {
      name: card.querySelector('.product-name')?.textContent?.trim() || 'Unknown Executor',
      description: card.querySelector('.summary')?.textContent?.trim() || 'No description available',
      price: card.querySelector('.price')?.textContent?.trim() || 'Unknown',
      sunc: card.querySelector('.sunc')?.textContent?.trim() || 'Unknown'
    };
  }

  function cleanInsightText(text) {
    return String(text || '')
      .replace(/⚠️\s*\*\*IMPORTANT NOTICE\*\*[\s\S]*?continue to work normally\./gi, '')
      .replace(/pollinations legacy text api[\s\S]*?models\./gi, '')
      .split('\n')
      .map(line => line.replace(/([A-Za-z0-9])\.(\s*)$/g, '$1$2'))
      .join('\n')
      .trim();
  }

  function renderMarkdown(markdownText) {
    const source = String(markdownText || '').replace(/\r\n/g, '\n').trim();
    if (!source) return '<p>No insight available</p>';

    const lines = source.split('\n');
    const htmlParts = [];
    let inList = false;

    const inlineFormat = text => {
      let value = escapeHtml(text);
      value = value.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      value = value.replace(/\*(.+?)\*/g, '<em>$1</em>');
      value = value.replace(/`(.+?)`/g, '<code>$1</code>');
      return value;
    };

    lines.forEach(rawLine => {
      const line = rawLine.trim();
      if (!line) {
        if (inList) {
          htmlParts.push('</ul>');
          inList = false;
        }
        return;
      }

      if (/^[-*]\s+/.test(line)) {
        if (!inList) {
          htmlParts.push('<ul>');
          inList = true;
        }
        htmlParts.push(`<li>${inlineFormat(line.replace(/^[-*]\s+/, ''))}</li>`);
        return;
      }

      if (inList) {
        htmlParts.push('</ul>');
        inList = false;
      }

      const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        htmlParts.push(`<h${level + 2}>${inlineFormat(headingMatch[2])}</h${level + 2}>`);
        return;
      }

      htmlParts.push(`<p>${inlineFormat(line)}</p>`);
    });

    if (inList) htmlParts.push('</ul>');
    return htmlParts.join('');
  }

  function buildFallbackInsight(product) {
    return [
      `AI Insight failed, please report this bug to https://discord.gg/VsfrtZxT`
    ].join('\n\n');
  }

  function getInsightCache() {
    try {
      const parsed = JSON.parse(localStorage.getItem(AI_CACHE_KEY) || '{}');
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }

  function writeInsightCache(cache) {
    try {
      localStorage.setItem(AI_CACHE_KEY, JSON.stringify(cache));
    } catch {
      // no-op
    }
  }

  function getInsightCacheKey(product) {
    return [product.name, product.price, product.sunc, product.description].join('|').toLowerCase();
  }

  function pause(ms) {
    return new Promise(resolve => window.setTimeout(resolve, ms));
  }

  async function requestInsight(prompt) {
    let lastError = null;

    for (let attempt = 0; attempt < AI_MAX_ATTEMPTS; attempt += 1) {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), AI_REQUEST_TIMEOUT_MS);

      try {
        const response = await fetch(`${AI_ENDPOINT}${encodeURIComponent(prompt)}`, { signal: controller.signal });
        if (!response.ok) throw new Error(`AI request failed (${response.status})`);
        const text = (await response.text()).trim();
        if (!text) throw new Error('AI request returned an empty response');
        return text;
      } catch (error) {
        lastError = error;
        const backoffMs = 350 * (2 ** attempt);
        if (attempt < AI_MAX_ATTEMPTS - 1) await pause(backoffMs);
      } finally {
        window.clearTimeout(timeoutId);
      }
    }

    throw lastError || new Error('AI request failed');
  }

  async function generateInsight(product) {
    const prompt = [
      'You are an expert Roblox executor risk and reliability analyst',
      '',
      'Mission',
      '- Produce a high quality practical insight for one executor',
      '- Use site data first and only add external knowledge when highly likely',
      '- If uncertain, explicitly say data is limited',
      '',
      'Hard rules',
      '- No hype no fluff no emojis',
      '- No invented facts no fake metrics no fake incidents',
      '- No trailing periods at line ends',
      '- Keep output concise and specific',
      '',
      'Output format exactly',
      'Reliability snapshot',
      '- Stability assessment in 1 line',
      '- sUNC interpretation in 1 line',
      '',
      'Risk profile',
      '- Trust and safety risk in 1 line',
      '- Likely user fit in 1 line',
      '',
      'Actionable guidance',
      '- Main caution',
      '- Main recommendation',
      '- Most notable limitation',
      '',
      'Verdict',
      '- One clear line saying who should or should not use it',
      '',
      'Word budget 90 to 150 words',
      '',
      `Executor: ${product.name}`,
      `Description: ${product.description}`,
      `Pricing: ${product.price}`,
      `sUNC: ${product.sunc}`
    ].join('\n');

    const cache = getInsightCache();
    const cacheKey = getInsightCacheKey(product);
    const cachedInsight = cache[cacheKey];
    if (typeof cachedInsight === 'string' && cachedInsight.trim()) return cachedInsight;

    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const rawText = await requestInsight(prompt);
        const cleaned = cleanInsightText(rawText);
        if (cleaned) {
          cache[cacheKey] = cleaned;
          writeInsightCache(cache);
          return cleaned;
        }
      } catch (error) {
        if (attempt >= 2) throw error;
      }
    }

    return buildFallbackInsight(product);
  }

  async function handleInsightClick(card, button) {
    const result = document.querySelector('#executorInsightResult');
    if (!result) return;

    const product = productFromCard(card);
    const mainContent = document.querySelector('.main-content');
    if (mainContent) mainContent.scrollTo({ top: 0, behavior: 'smooth' });
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (!tryConsumeAiToken()) {
      window.alert('You have no AI Insight tokens remaining. Daily tokens reset at midnight, or you can buy more in the Token Shop.');
      return;
    }

    button.disabled = true;
    button.textContent = 'Generating...';
    result.hidden = false;
    result.innerHTML = `<strong class="no-text-select">${escapeHtml(product.name)}</strong><p>Generating AI insight...</p>`;

    try {
      const insight = await generateInsight(product);
      result.innerHTML = `<strong class="no-text-select">${escapeHtml(product.name)}</strong>${renderMarkdown(insight)}`;
    } catch (error) {
      result.innerHTML = `<strong class="no-text-select">${escapeHtml(product.name)}</strong>${renderMarkdown(buildFallbackInsight(product))}`;
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
