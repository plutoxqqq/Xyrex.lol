(function () {
  'use strict';

  const STORAGE = {
    fragments: 'xyrex_lore_fragments_v2',
    loreTriggered: 'xyrex_lore_triggered_v2',
    corruptionLevel: 'xyrex_corruption_level_v2'
  };

  const FRAGMENTS = ['NULL', 'TRUST', 'INDEX', 'MIRROR', 'NODE03', 'TRACE', 'ECHO', 'VERIFIED', 'CONTAINMENT', '1.337'];
  const CLICK_SEQUENCE = ['logo', 'search', 'subtitle', 'featured', 'logo'];
  const ARCHIVE_LOGS = [
    'The first scan returned 47 executors. The second returned 48.',
    'The extra entry had no name.',
    'Trust score did not measure trust. It measured containment drift.',
    'VERIFIED was not a badge. It was a warning.',
    'NULL has no official site.',
    'Protocol 1.337 was not made to activate. It was made to reveal the damage.',
    'Archive Node 03 failed to respond at 03:17.',
    'The directory was rebuilt over the damaged layer.',
    'The filters remember what the user hides.',
    'The 48th card was never rendered.',
    'Search query "null" returned itself.',
    'The mirror sequence restored one route.',
    'The trust layer began copying scores between unrelated entries.',
    'The comparison table briefly listed an executor with no columns.',
    'The assistant answered a question nobody asked.',
    'The saved script panel stored one blank script with no author.',
    'Containment prevented the UI from showing the 48th result.',
    'Every VERIFIED mark after 03:17 should be treated as suspect.',
    'The archive can only be read from inside the corrupted layer.',
    'If Protocol 1.337 is active, the visible site is already a mirror.'
  ];

  const state = {
    fragments: new Set(parse(localStorage.getItem(STORAGE.fragments), [])),
    loreTriggered: localStorage.getItem(STORAGE.loreTriggered) === '1',
    corruptionLevel: Number(localStorage.getItem(STORAGE.corruptionLevel) || 0),
    typedBuffer: '',
    clickProgress: 0,
    subtitleClicks: 0,
    verifiedClicks: 0,
    toastCooldown: null,
    jitterTimer: null,
    phraseTimer: null
  };

  const ui = { terminal: null, archive: null, canvas: null };

  function parse(v, fallback) { try { return JSON.parse(v); } catch { return fallback; } }
  function save() {
    localStorage.setItem(STORAGE.fragments, JSON.stringify([...state.fragments]));
    localStorage.setItem(STORAGE.loreTriggered, state.loreTriggered ? '1' : '0');
    localStorage.setItem(STORAGE.corruptionLevel, String(state.corruptionLevel));
  }
  function isInputTarget(el) { return !!el && (el.closest('input, textarea, [contenteditable="true"]')); }

  function collectFragment(name, source) {
    if (!FRAGMENTS.includes(name) || state.fragments.has(name)) return;
    state.fragments.add(name);
    if (!state.loreTriggered) state.loreTriggered = true;
    autoUnlock1337();
    save();
    if (state.loreTriggered) toast(`Fragment recovered: ${name}`);
    console.info(`[XYREX ARCHIVE] ${name} recovered via ${source}.`);
  }

  function autoUnlock1337() {
    const base = FRAGMENTS.filter(f => f !== '1.337');
    if (base.every(f => state.fragments.has(f))) state.fragments.add('1.337');
  }

  function toast(msg) {
    if (!state.loreTriggered) return;
    const t = document.createElement('div');
    t.className = 'lore-toast';
    t.textContent = msg;
    document.body.appendChild(t);
    clearTimeout(state.toastCooldown);
    state.toastCooldown = setTimeout(() => t.remove(), 2500);
  }

  function buildTerminal() {
    if (ui.terminal) return ui.terminal;
    const root = document.createElement('section');
    root.className = 'xyrex-terminal';
    root.innerHTML = `<div class="lore-backdrop" data-close-terminal></div><div class="lore-panel"><div class="lore-panel-header"><strong>THE XYREX ARCHIVE // TERMINAL</strong><button class="lore-panel-close" data-close-terminal type="button">Close</button></div><div class="lore-output" id="loreOutput"></div><form class="lore-input-row"><input class="lore-input" placeholder="Type: help" autocomplete="off" /><button class="lore-submit" type="submit">Run</button></form></div>`;
    document.body.appendChild(root);
    root.querySelectorAll('[data-close-terminal]').forEach(el => el.addEventListener('click', closeTerminal));

    const output = root.querySelector('#loreOutput');
    const input = root.querySelector('.lore-input');
    const print = (line, cls = '') => {
      const div = document.createElement('div'); div.className = `lore-line ${cls}`.trim(); div.textContent = line; output.appendChild(div); output.scrollTop = output.scrollHeight;
    };

    const commandMap = {
      help: () => print('help, status, fragments, logs, decrypt, scan, mirror, null, node03, trace, verified, containment, protocol, protocol 1.337, restore, reset archive, reset archive confirm, clear'),
      status: () => {
        const ready = state.fragments.has('1.337');
        print(`Archive status: ${state.loreTriggered ? 'RECOVERING' : 'DORMANT'}`);
        print(`Corruption level: ${state.corruptionLevel}`);
        print(`Fragments recovered: ${state.fragments.size}/10`);
        print(`Protocol 1.337 ready: ${ready ? 'YES' : 'NO'}`);
      },
      fragments: () => {
        const missing = FRAGMENTS.filter(f => !state.fragments.has(f));
        print(`Recovered (${state.fragments.size}/10): ${[...state.fragments].sort().join(', ') || 'None'}`);
        missing.forEach((_, i) => print(`[REDACTED-${String(i + 1).padStart(2, '0')}]`, 'lore-line-warning'));
      },
      logs: () => {
        if (state.fragments.size < 5) return print('Archive locked. Minimum recovery threshold not met.', 'lore-line-warning');
        collectFragment('INDEX', 'terminal.logs');
        openArchive();
        print('Archive logs opened.');
      },
      decrypt: () => {
        print('Decrypting...', 'lore-line-muted');
        setTimeout(() => print('01001110 01010101 01001100 01001100 -> NULL', 'lore-line-accent'), 140);
        setTimeout(() => print('Hint: Node03 failure timestamp mirrors search echo: 03:17', 'lore-line-muted'), 260);
      },
      scan: () => {
        print('SCAN 001: 47 entries found'); print('SCAN 002: 48 entries found'); print('WARNING: unnamed entry detected', 'lore-line-warning'); print('TRUST DRIFT: rising'); print('CONTAINMENT: unstable'); collectFragment('INDEX', 'terminal.scan');
      },
      mirror: () => { print('Logo reflects Search.'); print('Search reflects Subtitle.'); print('Subtitle reflects Featured.'); print('Featured returns to Logo.'); },
      null: () => print('NULL is the unnamed 48th executor entry left in every scan route.'),
      node03: () => print('NODE03 failed at 03:17. Query that timestamp in search to recover the echo trace.'),
      trace: () => print('TRACE routes persist in normal queries. Search exactly: null'),
      verified: () => print('VERIFIED was recast as containment signal, not trust confirmation.'),
      containment: () => print(state.fragments.size < 5 ? 'Containment unstable. Access tier insufficient.' : 'Containment prevented rendering of the 48th card, but did not erase its traces.'),
      protocol: () => print(state.fragments.has('1.337') ? 'Protocol 1.337 ready.' : `Protocol 1.337 dormant. ${10 - state.fragments.size} fragments missing.`),
      restore: () => { restore(); print('Corruption effects removed.'); },
      'reset archive': () => print('Warning: this only resets hidden archive progress. Run: reset archive confirm', 'lore-line-warning'),
      'reset archive confirm': () => {
        localStorage.removeItem(STORAGE.fragments); localStorage.removeItem(STORAGE.loreTriggered); localStorage.removeItem(STORAGE.corruptionLevel);
        state.fragments = new Set(); state.loreTriggered = false; restore(); save();
        print('Archive progress reset. Normal site data untouched.');
      },
      clear: () => { output.innerHTML = ''; }
    };

    root.querySelector('form').addEventListener('submit', (e) => {
      e.preventDefault();
      const cmd = input.value.trim().toLowerCase();
      if (!cmd) return;
      print(`> ${cmd}`);
      if (cmd === 'protocol 1.337') {
        if (!state.fragments.has('1.337')) print('Protocol 1.337 dormant. Required fragments missing.', 'lore-line-warning');
        else { setCorruptionLevel(3); print('Protocol 1.337 engaged.', 'lore-line-accent'); }
      } else if (commandMap[cmd]) commandMap[cmd]();
      else print('Unknown command. Type help.', 'lore-line-warning');
      input.value = '';
    });

    ui.terminal = root;
    return root;
  }

  function openTerminal() { const t = buildTerminal(); t.classList.add('is-open'); t.querySelector('.lore-input')?.focus(); state.loreTriggered = true; save(); }
  function closeTerminal() { ui.terminal?.classList.remove('is-open'); }

  function buildArchive() {
    if (ui.archive) return ui.archive;
    const root = document.createElement('section');
    root.className = 'xyrex-archive-modal';
    root.innerHTML = '<div class="lore-backdrop" data-close-archive></div><div class="lore-panel"><div class="lore-panel-header"><strong>THE XYREX ARCHIVE // LOGS</strong><button class="lore-panel-close" data-close-archive type="button">Close</button></div><div class="archive-wrap"></div></div>';
    const wrap = root.querySelector('.archive-wrap');
    ARCHIVE_LOGS.forEach((log, i) => { const b = document.createElement('article'); b.className = 'archive-log'; b.textContent = `[LOG ${String(i + 1).padStart(3, '0')}] ${log}`; wrap.appendChild(b); });
    root.querySelectorAll('[data-close-archive]').forEach(el => el.addEventListener('click', () => root.classList.remove('is-open')));
    document.body.appendChild(root);
    ui.archive = root;
    return root;
  }
  function openArchive() { buildArchive().classList.add('is-open'); }

  function setCorruptionLevel(level) {
    state.corruptionLevel = Math.max(0, Math.min(3, Number(level) || 0));
    save();
    document.body.classList.remove('lore-corruption-l1', 'lore-corruption-l2', 'lore-corruption-l3');
    if (state.corruptionLevel > 0) document.body.classList.add(`lore-corruption-l${state.corruptionLevel}`);
    clearIntervals();
    if (state.corruptionLevel >= 1) state.jitterTimer = setInterval(jitterCard, 2400);
    if (state.corruptionLevel >= 2) state.phraseTimer = setInterval(() => toast('CONTAINMENT WARNING: DRIFT RISING'), 16000);
    if (state.corruptionLevel >= 3) enableOverlay(); else disableOverlay();
  }

  function jitterCard() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const card = document.querySelector('.product-card, .executor-card, .card');
    if (!card) return;
    card.classList.add('lore-flicker-once');
    setTimeout(() => card.classList.remove('lore-flicker-once'), 500);
  }

  function enableOverlay() {
    if (ui.canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const c = document.createElement('canvas'); c.className = 'lore-matrix'; document.body.appendChild(c); ui.canvas = c;
    const ctx = c.getContext('2d'); const chars = 'NULL01337XYREX';
    const resize = () => { c.width = innerWidth; c.height = innerHeight; };
    resize(); addEventListener('resize', resize);
    const cols = () => Math.floor(c.width / 14);
    let drops = Array(cols()).fill(0);
    const timer = setInterval(() => {
      if (!ctx) return;
      if (drops.length !== cols()) drops = Array(cols()).fill(0);
      ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(0, 0, c.width, c.height); ctx.fillStyle = '#6fffe3'; ctx.font = '12px monospace';
      drops.forEach((d, i) => { const ch = chars[Math.floor(Math.random() * chars.length)]; ctx.fillText(ch, i * 14, d * 14); drops[i] = d * 14 > c.height && Math.random() > 0.97 ? 0 : d + 1; });
    }, 70);
    c.dataset.timer = String(timer);
  }

  function disableOverlay() {
    if (!ui.canvas) return;
    clearInterval(Number(ui.canvas.dataset.timer || 0));
    ui.canvas.remove();
    ui.canvas = null;
  }

  function clearIntervals() { clearInterval(state.jitterTimer); clearInterval(state.phraseTimer); }
  function restore() { setCorruptionLevel(0); }

  function clickSequenceStep(step) {
    const expected = CLICK_SEQUENCE[state.clickProgress];
    state.clickProgress = expected === step ? state.clickProgress + 1 : (step === CLICK_SEQUENCE[0] ? 1 : 0);
    if (state.clickProgress === CLICK_SEQUENCE.length) { state.clickProgress = 0; collectFragment('MIRROR', 'mirror.sequence'); openTerminal(); }
  }

  document.addEventListener('click', (e) => {
    const t = e.target;
    if (!t) return;
    if (t.closest('#brandHomeBtn, .brand-btn, .brand')) clickSequenceStep('logo');
    if (t.closest('#searchInput, .search-input')) clickSequenceStep('search');
    if (t.closest('.seo-hero-subtitle')) {
      clickSequenceStep('subtitle');
      state.subtitleClicks += 1;
      if (state.subtitleClicks >= 3) collectFragment('NODE03', 'subtitle.click3');
    }
    if (t.closest('.product-card, .executor-card, .card, [data-featured="true"]')) clickSequenceStep('featured');
    if (t.closest('.legend-icon.verified')) {
      state.verifiedClicks += 1;
      if (state.verifiedClicks >= 5) collectFragment('VERIFIED', 'verified.click5');
    }
    if (t.closest('.btn-info, .more-info-btn, [data-action="more-info"], button')) {
      const txt = (t.textContent || '').toLowerCase();
      if (txt.includes('more info') && state.fragments.size >= 5) collectFragment('CONTAINMENT', 'modal.more-info');
    }
  });

  document.addEventListener('input', (e) => {
    const t = e.target;
    if (!(t instanceof HTMLInputElement)) return;
    if (t.matches('#searchInput, .search-input')) {
      const v = t.value.trim().toLowerCase();
      if (v === 'null') collectFragment('TRACE', 'search.null');
      if (v === '03:17') collectFragment('ECHO', 'search.0317');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeTerminal(); ui.archive?.classList.remove('is-open'); }
    if (e.key.toLowerCase() === 'r' && state.corruptionLevel > 0 && !isInputTarget(e.target)) restore();
    if (isInputTarget(e.target)) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key.length !== 1) return;
    state.typedBuffer = (state.typedBuffer + e.key.toLowerCase()).slice(-24);
    if (state.typedBuffer.endsWith('archive')) openTerminal();
    if (state.typedBuffer.endsWith('null')) collectFragment('NULL', 'typed.null');
    if (state.typedBuffer.endsWith('xyrex')) { collectFragment('TRUST', 'typed.xyrex'); console.info('[XYREX ARCHIVE] TRUST fragment resonance detected.'); }
  });

  const subtitle = document.querySelector('.seo-hero-subtitle');
  if (!subtitle) console.info('[XYREX ARCHIVE] Missing .seo-hero-subtitle hook. Mirror route degraded.');

  autoUnlock1337();
  if (state.corruptionLevel > 0) setCorruptionLevel(state.corruptionLevel);
})();
