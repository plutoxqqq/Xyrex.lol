(function () {
  const AI_ENDPOINT = 'https://text.pollinations.ai/';
  const AI_REQUEST_TIMEOUT_MS = 14000;
  const AI_MAX_ATTEMPTS = 4;
  const AI_TOKEN_STORAGE_KEY = 'xyrex_ai_tokens_v1';
  const FREE_DAILY_AI_TOKENS = 5;
  let cssLoaded = false;
  let gridObserver = null;
  function loadCss() {
    if (cssLoaded || document.querySelector('link[data-new-ui-css="true"]')) {
      cssLoaded = true;
      return;
    }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/new-ui.css?v=2.1.1';
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
  function getAiTokenData() {
    try {
      const parsed = JSON.parse(localStorage.getItem(AI_TOKEN_STORAGE_KEY) || '{}');
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }
  function writeAiTokenData(payload) {
    localStorage.setItem(AI_TOKEN_STORAGE_KEY, JSON.stringify(payload));
  }
  function getDayKey() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
    const raw = getAiTokenData();
    const data = normalizeTokenState(raw);
    const available = availableAiTokensFromState(data);
    if (available <= 0) return false;
    const freeRemaining = Math.max(0, FREE_DAILY_AI_TOKENS - data.aiTokensUsedToday);
    if (freeRemaining > 0) data.aiTokensUsedToday += 1;
    else data.aiPurchasedTokens = Math.max(0, data.aiPurchasedTokens - 1);
    writeAiTokenData(data);
    return true;
  }
  function productFromCard(card) {
    return {
      name: card.querySelector('.product-name')?.textContent?.trim() || 'Unknown Executor',
      description: card.querySelector('.summary')?.textContent?.trim() || 'No description available',
      price: card.querySelector('.price')?.textContent?.trim() || 'Unknown',
      sunc: card.querySelector('.sunc')?.textContent?.trim() || 'Unknown',
      status: card.dataset.status || 'Unknown',
      trustLevel: card.dataset.trustLevel || 'Unknown',
      stability: card.dataset.stability || 'Unknown',
      platform: card.dataset.platform || 'Unknown',
      keySystem: card.dataset.keySystem || 'Unknown',
      tags: card.dataset.tags || 'Unknown',
      execution: card.dataset.execution || 'Unknown'
    };
  }
  function extractInsightPayload(text) {
    const raw = String(text || '').trim();
    if (!raw) return '';
    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'string') return parsed;
      if (typeof parsed?.content === 'string') return parsed.content;
      if (typeof parsed?.response === 'string') return parsed.response;
      if (typeof parsed?.text === 'string') return parsed.text;
      if (Array.isArray(parsed?.choices) && typeof parsed.choices[0]?.message?.content === 'string') {
        return parsed.choices[0].message.content;
      }
    } catch {
      // no-op
    }
    const fenced = raw.match(/```(?:json|text|markdown)?\s*([\s\S]*?)```/i);
    if (fenced?.[1]) return fenced[1].trim();
    return raw;
  }
  function cleanInsightText(text) {
    const extracted = extractInsightPayload(text)
      .replace(/\{\s*"role"\s*:\s*"assistant"[\s\S]*$/i, '')
      .replace(/"reasoning_content"\s*:\s*"[\s\S]*?"\s*,?/gi, '')
      .replace(/⚠️\s*\*\*IMPORTANT NOTICE\*\*[\s\S]*?continue to work normally\.?/gi, '')
      .replace(/pollinations legacy text api[\s\S]*?models\.?/gi, '')
      .replace(/^\s*\{[\s\S]*\}\s*$/g, '')
      .trim();
    return extracted
      .split('\n')
      .map(line => line.replace(/\s+/g, ' ').trim())
      .filter(Boolean)
      .map(line => line.replace(/([A-Za-z0-9])\.(\s*)$/g, '$1$2'))
      .join('\n')
      .trim();
  }
  function renderInsightText(text) {
    const cleaned = cleanInsightText(text).replace(/\s+/g, ' ').trim();
    return cleaned || buildFallbackInsight({ name: 'Executor' });
  }

  function buildFallbackInsight(product) {
    return `${product.name} has mixed public signals and should be treated with controlled caution. Best for: experienced users who can test in isolated environments and verify files before each update. Avoid if: you need predictable uptime, low-maintenance setup, or minimal detection exposure. Risk level: medium to high, based on uncertain trust and uneven operational consistency. Confidence score: 6/10.`;
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
        const nonce = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const response = await fetch(`${AI_ENDPOINT}${encodeURIComponent(`${prompt}
Response nonce: ${nonce}`)}`, { signal: controller.signal });
        if (!response.ok) throw new Error(`AI request failed (${response.status})`);
        const text = (await response.text()).trim();
        if (!text) throw new Error('AI request returned an empty response');
        const cleaned = renderInsightText(text);
        if (!cleaned) throw new Error('AI request returned invalid content');
        return cleaned;
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
      'You are an expert analyst specializing in Roblox exploit executors',
      '',
      'Your task is to generate a concise, accurate, and realistic insight about the executor below, using both the provided data and inferred knowledge based on typical community reputation patterns',
      '',
      'IMPORTANT:',
      'You do NOT have live internet access. Do NOT claim to have searched, checked websites, or verified sources in real time',
      '',
      'Rules:',
      '- Write 80 to 120 words only',
      '- Use one compact paragraph only',
      '- Include these exact labels in the paragraph: Best for:, Avoid if:, Risk level:, Confidence score: x/10',
      '- Tone must be analytical, direct, and realistic with no fluff and no emojis',
      '- Do not use bullet points',
      '- Do not claim research, reports, or source verification',
      '- If trust, stability, or status looks weak, call out practical risk clearly',
      '- If sUNC and reliability look strong, justify why the strength is credible',
      '',
      `Name: ${product.name}`,
      `Platform: ${product.platform}`,
      `sUNC: ${product.sunc}`,
      `Stability: ${product.stability}`,
      `Trust Level: ${product.trustLevel}`,
      `Execution Level: ${product.execution}`,
      `Key System: ${product.keySystem}`,
      `Price: ${product.price}`,
      `Status: ${product.status}`,
      `Tags: ${product.tags}`,
      `Description: ${product.description}`,
      '',
      'Only output the insight paragraph'
    ].join('\n');

    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const cleaned = await requestInsight(prompt);
        if (cleaned) return cleaned;
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
      result.innerHTML = `<strong class="no-text-select">${escapeHtml(product.name)}</strong><p>${escapeHtml(insight)}</p>`;
    } catch (error) {
      result.innerHTML = `<strong class="no-text-select">${escapeHtml(product.name)}</strong><p>${escapeHtml(buildFallbackInsight(product))}</p>`;
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
  }
  function enable() {
    loadCss();
    document.body.classList.add('new-ui-enabled');
    ensureInsightsPanel();
    enhanceCardsForNewUi();
    watchGridUpdates();
  }
  function disable() {
    document.body.classList.remove('new-ui-enabled');
    stopWatchingGridUpdates();
    restoreDefaultCardActions();
    removeInjectedElements();
  }
  window.XyrexNewUI = {
    enable,
    disable
  };
})();
