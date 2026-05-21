(function () {
  const STORAGE = {
    fragments: 'xyrex_lore_fragments',
    unlocked: 'xyrex_archive_unlocked',
    level: 'xyrex_corruption_level'
  };
  const FRAGMENTS = ['NULL', 'TRUST', 'INDEX', 'MIRROR', '1.337'];
  const keyBuffer = [];
  const sequenceGoal = ['logo', 'search', 'footer', 'featured', 'logo'];
  let sequence = [];
  let matrixTimer = null;

  const state = {
    fragments: new Set(JSON.parse(localStorage.getItem(STORAGE.fragments) || '[]')),
    archiveUnlocked: localStorage.getItem(STORAGE.unlocked) === '1',
    level: Number(localStorage.getItem(STORAGE.level) || 0)
  };

  function saveState() {
    localStorage.setItem(STORAGE.fragments, JSON.stringify([...state.fragments]));
    localStorage.setItem(STORAGE.unlocked, state.archiveUnlocked ? '1' : '0');
    localStorage.setItem(STORAGE.level, String(state.level));
  }

  function collectFragment(id, source = 'Unknown') {
    if (!FRAGMENTS.includes(id) || state.fragments.has(id)) return;
    state.fragments.add(id);
    saveState();
    toast(`FRAGMENT RECOVERED: ${id} · source: ${source}`);
    console.info(`[XYREX ARCHIVE] Fragment detected: ${state.fragments.size}/5`);
    if (state.fragments.size === FRAGMENTS.length) {
      state.archiveUnlocked = true;
      saveState();
      toast('ARCHIVE ACCESS GRANTED');
    }
  }

  function unlockArchive() { state.archiveUnlocked = true; saveState(); openArchive(); }

  function initHiddenTerminal() {
    const root = document.createElement('section');
    root.className = 'xyrex-terminal';
    root.innerHTML = `<div class="lore-backdrop"></div><div class="lore-panel"><div class="lore-panel-header"><strong>Recovered Layer Terminal</strong><button class="lore-panel-close" type="button">Close</button></div><div class="lore-output" id="loreOutput"></div><form class="lore-input-row"><input class="lore-input" autocomplete="off" placeholder="Type command..." /><button class="lore-submit" type="submit">Run</button></form></div>`;
    document.body.appendChild(root);
    const output = root.querySelector('#loreOutput');
    const input = root.querySelector('.lore-input');
    const form = root.querySelector('form');

    const write = text => output.insertAdjacentHTML('beforeend', `<div>> ${text}</div>`);
    const commands = {
      help: 'help, status, logs, decrypt, protocol, null, restore, clear',
      status: 'SYSTEM STATUS: UNSTABLE\nARCHIVE LAYER: PARTIALLY RECOVERED\nNULL TRACE: ACTIVE',
      logs: () => { collectFragment('INDEX', 'terminal.logs'); openArchive(); return 'Opening archive logs...'; },
      decrypt: '01001110 01010101 01001100 01001100 -> NULL',
      protocol: 'Protocol 1.337 is dormant. Activation requires recovered key fragments.',
      null: 'NULL is not absence. NULL is what remains after deletion.',
      restore: () => { restoreSite(); return 'Corruption effects removed.'; },
      clear: () => { output.innerHTML = ''; return ''; }
    };
    form.addEventListener('submit', e => {
      e.preventDefault(); const cmd = input.value.trim().toLowerCase(); if (!cmd) return;
      write(cmd); const response = commands[cmd]; write(typeof response === 'function' ? response() : (response || 'Unknown command.')); input.value = '';
    });
    root.querySelector('.lore-panel-close').addEventListener('click', () => root.classList.remove('is-open'));
    root.querySelector('.lore-backdrop').addEventListener('click', () => root.classList.remove('is-open'));

    function openTerminal() { root.classList.add('is-open'); input.focus(); }

    let typed = '';
    document.addEventListener('keydown', e => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'x') { e.preventDefault(); openTerminal(); return; }
      if (e.key.length === 1) typed = (typed + e.key.toLowerCase()).slice(-12);
      if (typed.endsWith('archive') || typed.endsWith('xyrex')) openTerminal();
    });

    return { openTerminal };
  }

  function openArchive() {
    const modal = document.querySelector('.xyrex-archive-modal');
    if (modal) return modal.classList.add('is-open');
    const wrap = document.createElement('section');
    wrap.className = 'xyrex-archive-modal is-open';
    wrap.innerHTML = `<div class="lore-backdrop"></div><div class="lore-panel"><div class="lore-panel-header"><strong>The Archive · Recovered Layer</strong><button class="lore-panel-close" type="button">Close</button></div><div class="archive-log">[LOG 001] RECOVERED\nThe first scan returned 47 executors.\nThe second returned 48.\nThe extra entry had no name.</div><div class="archive-log">[LOG 002] DAMAGED\nUser trust score was never meant to measure trust.\nIt measured ██████████.</div><div class="archive-log">[LOG 003] PARTIAL\nWKH DUFKLYH LV QRW GHDG</div><div class="archive-log">[LOG 004] RECOVERED\nUFJPVE9DT0xfMS4zMzc=</div><div class="archive-log">[LOG 005] TRACE\nFinal key format: NULL-TRUST-INDEX-MIRROR-1.337</div></div>`;
    document.body.appendChild(wrap);
    wrap.querySelector('.lore-panel-close').addEventListener('click', () => wrap.classList.remove('is-open'));
    wrap.querySelector('.lore-backdrop').addEventListener('click', () => wrap.classList.remove('is-open'));
  }

  function activateCorruption(level) {
    restoreSite();
    state.level = Math.max(1, Math.min(3, level)); saveState();
    document.body.classList.add(`lore-corruption-l${state.level}`);
    if (state.level === 3) {
      const canvas = document.createElement('canvas'); canvas.className = 'lore-matrix'; document.body.appendChild(canvas);
      const ctx = canvas.getContext('2d'); const chars = 'NULL01XYREX1337';
      const resize = () => { canvas.width = innerWidth; canvas.height = innerHeight; };
      resize(); window.addEventListener('resize', resize, { passive: true });
      matrixTimer = setInterval(() => {
        ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(83,240,198,0.7)'; ctx.font = '14px monospace';
        for (let i = 0; i < 24; i++) ctx.fillText(chars[Math.floor(Math.random() * chars.length)], Math.random() * canvas.width, Math.random() * canvas.height);
      }, 120);
    }
    toast(`Protocol engaged: Level ${state.level}. Press R or use Restore Site.`);
  }

  function restoreSite() {
    [1, 2, 3].forEach(level => document.body.classList.remove(`lore-corruption-l${level}`));
    const matrix = document.querySelector('.lore-matrix'); if (matrix) matrix.remove();
    if (matrixTimer) { clearInterval(matrixTimer); matrixTimer = null; }
    state.level = 0; saveState();
  }

  function toast(message) {
    const el = document.createElement('div'); el.className = 'lore-toast'; el.textContent = message; document.body.appendChild(el);
    setTimeout(() => el.remove(), 2800);
  }

  function initLoreSystem() {
    console.log('%c[XYREX ARCHIVE] Fragment detected: 2/5', 'color:#8f7bff;font-weight:700');
    console.log('[XYREX ARCHIVE] Binary clue: 01001110 01010101 01001100 01001100');
    console.log('[XYREX ARCHIVE] Base64 clue: UFJPVE9DT0xfMS4zMzc=');
    document.body.insertAdjacentHTML('beforeend', '<div class="lore-fragment-hint" aria-hidden="true">// The directory was not built. It was recovered.</div>');

    const terminal = initHiddenTerminal();
    const brandBtn = document.querySelector('#brandHomeBtn');
    const search = document.querySelector('#searchInput');
    const footerGlyph = document.querySelector('.seo-hero-subtitle') || document.querySelector('.topnav');
    const featured = document.querySelector('.product-card, .card, .executor-card');

    const clickNode = (node, token) => node && node.addEventListener('click', () => {
      sequence.push(token); sequence = sequence.slice(-sequenceGoal.length);
      if (JSON.stringify(sequence) === JSON.stringify(sequenceGoal)) { collectFragment('MIRROR', 'ui-sequence'); unlockArchive(); }
    });
    clickNode(brandBtn, 'logo'); clickNode(search, 'search'); clickNode(footerGlyph, 'footer'); clickNode(featured, 'featured'); clickNode(brandBtn, 'logo');

    let logoClicks = 0;
    brandBtn?.addEventListener('click', () => { logoClicks += 1; if (logoClicks >= 7) { terminal.openTerminal(); collectFragment('NULL', 'logo-7'); logoClicks = 0; } });

    document.addEventListener('keydown', e => {
      if (e.key.length === 1) { keyBuffer.push(e.key.toLowerCase()); if (keyBuffer.length > 5) keyBuffer.shift(); }
      if (keyBuffer.join('') === 'xyrex') collectFragment('TRUST', 'key-sequence');
      if (e.key.toLowerCase() === 'r') restoreSite();
    });

    const restoreBtn = document.createElement('button');
    restoreBtn.className = 'lore-restore-btn'; restoreBtn.textContent = 'Restore Site';
    restoreBtn.style.position = 'fixed'; restoreBtn.style.left = '16px'; restoreBtn.style.bottom = '16px'; restoreBtn.style.zIndex = '1300';
    restoreBtn.addEventListener('click', restoreSite);
    document.body.appendChild(restoreBtn);

    if (state.fragments.has('NULL') && state.fragments.has('TRUST') && state.fragments.has('INDEX')) collectFragment('1.337', 'composite');
    if (state.archiveUnlocked) toast('Archive state recovered. Use terminal command: logs');
  }

  window.XyrexLore = { initLoreSystem, initHiddenTerminal, initCorruptionProtocol: () => {}, unlockArchive, activateCorruption, restoreSite, collectFragment };
})();
