(function () {
  'use strict';

  const STORAGE = {
    fragments: 'xyrex_lore_fragments',
    unlocked: 'xyrex_archive_unlocked',
    level: 'xyrex_corruption_level'
  };

  const FRAGMENT_ORDER = ['NULL', 'TRUST', 'INDEX', 'MIRROR', '1.337'];
  const SURFACE_PHRASES = [
    'ARCHIVE NODE 03 FAILED TO RESPOND.',
    'The directory was not built.',
    'Do not trust entries marked VERIFIED after 03:17.',
    'NULL remembers every filter you opened.'
  ];

  const ARCHIVE_LOGS = [
    '[LOG 001] RECOVERED\nThe first scan returned 47 executors.\nThe second returned 48.\nThe extra entry had no name.',
    '[LOG 002] DAMAGED\nTrust score did not measure trust.\nIt measured ██████████.',
    '[LOG 003] PARTIAL\nWKH DUFKLYH LV QRW GHDG',
    '[LOG 004] TRACE\nUFJPVE9DT0xfMS4zMzc=',
    '[LOG 005] MIRROR\nNULL-TRUST-INDEX-MIRROR-1.337',
    '[LOG 006] FRAGMENT\n01001110 01010101 01001100 01001100',
    '[LOG 007] DAMAGED\nProtocol 1.337 was not made to activate.\nIt was made to erase activation.'
  ];

  const runtime = {
    initialized: false,
    typedBuffer: '',
    keySequenceBuffer: [],
    clickSequence: [],
    logoClicks: 0,
    matrixInterval: null,
    flickerInterval: null,
    statusInterval: null,
    matrixResize: null,
    terminalRoot: null,
    archiveRoot: null,
    restoreButton: null,
    statusPill: null
  };

  const state = {
    fragments: new Set(parseJson(localStorage.getItem(STORAGE.fragments), [])),
    archiveUnlocked: localStorage.getItem(STORAGE.unlocked) === '1',
    corruptionLevel: Number(localStorage.getItem(STORAGE.level) || 0)
  };

  function parseJson(value, fallback) {
    try { return JSON.parse(value); } catch { return fallback; }
  }

  function saveState() {
    localStorage.setItem(STORAGE.fragments, JSON.stringify([...state.fragments]));
    localStorage.setItem(STORAGE.unlocked, state.archiveUnlocked ? '1' : '0');
    localStorage.setItem(STORAGE.level, String(state.corruptionLevel));
  }

  function getProgress() {
    return `${state.fragments.size}/${FRAGMENT_ORDER.length}`;
  }

  function toast(message, timeout = 2800) {
    const el = document.createElement('div');
    el.className = 'lore-toast';
    el.textContent = message;
    document.body.appendChild(el);
    window.setTimeout(() => el.remove(), timeout);
  }

  function maybeCollectCompositeFragment() {
    const needed = ['NULL', 'TRUST', 'INDEX', 'MIRROR'];
    if (needed.every(name => state.fragments.has(name))) {
      collectFragment('1.337', 'composite.key');
    }
  }

  function collectFragment(id, source) {
    if (!FRAGMENT_ORDER.includes(id) || state.fragments.has(id)) return false;
    state.fragments.add(id);
    saveState();
    toast(`Fragment recovered: ${id} · ${source}`);
    console.info(`[XYREX ARCHIVE] Fragment detected: ${getProgress()}`);
    updateStatusPill();
    if (state.fragments.size === FRAGMENT_ORDER.length) {
      state.archiveUnlocked = true;
      saveState();
      toast('ARCHIVE ACCESS GRANTED');
    }
    return true;
  }

  function ensureTerminal() {
    if (runtime.terminalRoot) return runtime.terminalRoot;
    const root = document.createElement('section');
    root.className = 'xyrex-terminal';
    root.innerHTML = `
      <div class="lore-backdrop" data-close-terminal></div>
      <div class="lore-panel" role="dialog" aria-modal="true" aria-label="Recovered Layer Terminal">
        <div class="lore-panel-header">
          <strong>Recovered Layer Terminal</strong>
          <button class="lore-panel-close" type="button" data-close-terminal>Close</button>
        </div>
        <div class="lore-output" id="loreOutput"></div>
        <form class="lore-input-row" autocomplete="off">
          <input class="lore-input" placeholder="Command: help" />
          <button class="lore-submit" type="submit">Run</button>
        </form>
      </div>`;
    document.body.appendChild(root);

    const output = root.querySelector('#loreOutput');
    const input = root.querySelector('.lore-input');
    const form = root.querySelector('form');

    const print = (text, klass = '') => {
      const row = document.createElement('div');
      row.className = `lore-line ${klass}`.trim();
      row.textContent = text;
      output.appendChild(row);
      output.scrollTop = output.scrollHeight;
    };

    const fastDecrypt = callback => {
      print('Decrypting fragments...', 'lore-line-muted');
      const frames = ['[##......] 22%', '[####....] 49%', '[######..] 73%', '[########] 100%'];
      let i = 0;
      const timer = setInterval(() => {
        if (i >= frames.length) {
          clearInterval(timer);
          callback();
          return;
        }
        print(frames[i], 'lore-line-accent');
        i += 1;
      }, 130);
    };

    const commands = {
      help: () => print('help, status, logs, decrypt, protocol, null, restore, clear'),
      status: () => print('SYSTEM STATUS: UNSTABLE\nARCHIVE LAYER: PARTIALLY RECOVERED\nNULL TRACE: ACTIVE'),
      logs: () => {
        collectFragment('INDEX', 'terminal.logs');
        openArchive();
        print('Opening recovered logs...');
      },
      decrypt: () => fastDecrypt(() => {
        collectFragment('TRUST', 'terminal.decrypt');
        print('Result: 01001110 01010101 01001100 01001100 -> NULL');
      }),
      protocol: () => {
        const unlocked = state.fragments.size === FRAGMENT_ORDER.length;
        print(unlocked ? 'Protocol 1.337 ready. Run: protocol 1.337' : 'Protocol 1.337 dormant. Recover all fragments first.');
      },
      null: () => print('NULL is not absence. NULL is what remains after deletion.'),
      restore: () => {
        restoreSite();
        print('Corruption effects removed.');
      },
      clear: () => {
        output.innerHTML = '';
      }
    };

    form.addEventListener('submit', event => {
      event.preventDefault();
      const raw = input.value.trim();
      if (!raw) return;
      print(`> ${raw}`);
      const cmd = raw.toLowerCase();

      if (cmd === 'protocol 1.337') {
        if (state.fragments.size === FRAGMENT_ORDER.length) {
          activateCorruption(3);
          print('Protocol 1.337 engaged.', 'lore-line-warning');
        } else {
          print('Missing fragments. Required key: NULL-TRUST-INDEX-MIRROR-1.337');
        }
      } else if (commands[cmd]) {
        commands[cmd]();
      } else {
        print('Unknown command. Type help.');
      }

      input.value = '';
    });

    root.querySelectorAll('[data-close-terminal]').forEach(el => el.addEventListener('click', () => closeTerminal()));

    runtime.terminalRoot = root;
    return root;
  }

  function openTerminal() {
    const terminal = ensureTerminal();
    terminal.classList.add('is-open');
    terminal.querySelector('.lore-input')?.focus();
  }

  function closeTerminal() {
    runtime.terminalRoot?.classList.remove('is-open');
  }

  function ensureArchive() {
    if (runtime.archiveRoot) return runtime.archiveRoot;
    const root = document.createElement('section');
    root.className = 'xyrex-archive-modal';
    root.innerHTML = `
      <div class="lore-backdrop" data-close-archive></div>
      <div class="lore-panel" role="dialog" aria-modal="true" aria-label="Recovered Archive Logs">
        <div class="lore-panel-header">
          <strong>The Archive</strong>
          <button class="lore-panel-close" type="button" data-close-archive>Close</button>
        </div>
        <div class="archive-wrap"></div>
      </div>`;
    const wrap = root.querySelector('.archive-wrap');
    ARCHIVE_LOGS.forEach(log => {
      const block = document.createElement('article');
      block.className = 'archive-log';
      block.textContent = log;
      wrap.appendChild(block);
    });
    document.body.appendChild(root);
    root.querySelectorAll('[data-close-archive]').forEach(el => el.addEventListener('click', () => root.classList.remove('is-open')));
    runtime.archiveRoot = root;
    return root;
  }

  function openArchive() {
    if (!state.archiveUnlocked) {
      toast('Archive locked. Recover more fragments first.');
      return;
    }
    ensureArchive().classList.add('is-open');
  }

  function updateStatusPill() {}

  function initCorruptionProtocol() {}

  function applyRandomFlicker() {
    const cards = Array.from(document.querySelectorAll('.product-card, .executor-card, .card')).slice(0, 8);
    if (!cards.length) return;
    const target = cards[Math.floor(Math.random() * cards.length)];
    target.classList.add('lore-flicker-once');
    window.setTimeout(() => target.classList.remove('lore-flicker-once'), 450);
  }

  function startMatrixOverlay() {
    if (document.querySelector('.lore-matrix')) return;
    const canvas = document.createElement('canvas');
    canvas.className = 'lore-matrix';
    document.body.appendChild(canvas);
    const context = canvas.getContext('2d');
    const chars = 'NULLXYZREX01337';

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });
    runtime.matrixResize = resize;

    runtime.matrixInterval = window.setInterval(() => {
      context.fillStyle = 'rgba(3, 2, 7, 0.14)';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = 'rgba(104, 255, 206, 0.72)';
      context.font = '13px monospace';
      for (let i = 0; i < 22; i += 1) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        context.fillText(char, Math.random() * canvas.width, Math.random() * canvas.height);
      }
    }, 130);
  }

  function stopMatrixOverlay() {
    const canvas = document.querySelector('.lore-matrix');
    if (canvas) canvas.remove();
    if (runtime.matrixInterval) {
      clearInterval(runtime.matrixInterval);
      runtime.matrixInterval = null;
    }
    if (runtime.matrixResize) {
      window.removeEventListener('resize', runtime.matrixResize);
      runtime.matrixResize = null;
    }
  }

  function activateCorruption(level) {
    const normalized = Math.max(1, Math.min(3, Number(level) || 1));
    restoreSite({ keepState: true });
    state.corruptionLevel = normalized;
    saveState();

    document.body.classList.add(`lore-corruption-l${normalized}`);
    toast(`Corruption Level ${normalized} engaged. Press R to restore.`);

    if (normalized >= 2) {
      runtime.flickerInterval = window.setInterval(applyRandomFlicker, 1400);
    }

    if (normalized === 3) {
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        startMatrixOverlay();
      }
      runtime.statusInterval = window.setInterval(() => {
        const phrase = SURFACE_PHRASES[Math.floor(Math.random() * SURFACE_PHRASES.length)];
        toast(phrase, 1700);
      }, 6200);
      console.warn('[XYREX ARCHIVE] Protocol 1.337 active. Monitoring containment drift.');
    }
  }

  function restoreSite(options = {}) {
    document.body.classList.remove('lore-corruption-l1', 'lore-corruption-l2', 'lore-corruption-l3');
    stopMatrixOverlay();

    if (runtime.flickerInterval) {
      clearInterval(runtime.flickerInterval);
      runtime.flickerInterval = null;
    }
    if (runtime.statusInterval) {
      clearInterval(runtime.statusInterval);
      runtime.statusInterval = null;
    }

    document.querySelectorAll('.lore-flicker-once').forEach(el => el.classList.remove('lore-flicker-once'));

    if (!options.keepState) {
      state.corruptionLevel = 0;
      saveState();
    }
  }

  function unlockArchive() {
    state.archiveUnlocked = true;
    saveState();
    openArchive();
  }

  function handlePuzzleInput(event) {
    if (event.target && /input|textarea/i.test(event.target.tagName)) return;

    if (event.key.toLowerCase() === 'r') restoreSite();

    if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'x') {
      event.preventDefault();
      openTerminal();
      collectFragment('NULL', 'shortcut.ctrl+shift+x');
      return;
    }

    if (event.key.length === 1) {
      runtime.typedBuffer = (runtime.typedBuffer + event.key.toLowerCase()).slice(-20);
      runtime.keySequenceBuffer.push(event.key.toLowerCase());
      if (runtime.keySequenceBuffer.length > 5) runtime.keySequenceBuffer.shift();

      if (runtime.typedBuffer.endsWith('archive') || runtime.typedBuffer.endsWith('xyrex')) {
        openTerminal();
      }
      if (runtime.keySequenceBuffer.join('') === 'xyrex') {
        collectFragment('TRUST', 'key.sequence.xyrex');
      }
    }
  }

  function addSurfaceClues() {
    console.log('%c[XYREX ARCHIVE] Fragment detected: 2/5', 'color:#9f87ff;font-weight:700;');
    console.log('[XYREX ARCHIVE] Binary clue: 01001110 01010101 01001100 01001100');
    console.log('[XYREX ARCHIVE] Base64 clue: UFJPVE9DT0xfMS4zMzc=');

    const subtitle = document.querySelector('.seo-hero-subtitle');
    if (subtitle) {
      subtitle.dataset.archiveTrace = 'ARCHIVE NODE 03 FAILED TO RESPOND.';
      subtitle.classList.add('lore-hover-target');
    }
  }

  function bindSequencePuzzle() {
    const steps = ['logo', 'search', 'footer', 'featured', 'logo'];

    const bind = (selector, token, collectOnClick) => {
      const element = document.querySelector(selector);
      if (!element) return;
      element.addEventListener('click', () => {
        runtime.clickSequence.push(token);
        runtime.clickSequence = runtime.clickSequence.slice(-steps.length);
        if (collectOnClick) collectOnClick();

        if (runtime.clickSequence.join('|') === steps.join('|')) {
          collectFragment('MIRROR', 'ui.sequence');
          state.archiveUnlocked = true;
          saveState();
          toast('Archive access granted.');
        }
      });
    };

    bind('#brandHomeBtn', 'logo', () => {
      runtime.logoClicks += 1;
      if (runtime.logoClicks >= 7) {
        runtime.logoClicks = 0;
        collectFragment('NULL', 'logo.7.clicks');
        openTerminal();
      }
    });
    bind('#searchInput', 'search');
    bind('.seo-hero-subtitle', 'footer');
    bind('.product-card, .executor-card, .card', 'featured');
  }

  function initLoreSystem() {
    if (runtime.initialized) return;
    runtime.initialized = true;

    ensureTerminal();
    ensureArchive();
    bindSequencePuzzle();

    document.addEventListener('keydown', handlePuzzleInput);

    maybeCollectCompositeFragment();

    if (state.archiveUnlocked) {
      toast('Recovered archive state detected. Use terminal command: logs');
    }

    if (state.corruptionLevel > 0) {
      activateCorruption(state.corruptionLevel);
    }
  }

  window.XyrexLore = {
    initLoreSystem,
    initHiddenTerminal: openTerminal,
    initCorruptionProtocol,
    unlockArchive,
    activateCorruption,
    restoreSite,
    collectFragment,
    openArchive
  };
})();
