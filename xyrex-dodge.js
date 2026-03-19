(() => {
  const STORAGE_KEY = 'xyrex_dodge_save_v2';
  const LEGACY_STORAGE_KEY = 'xyrex_dodge_save_v1';
  const FREE_DAILY_AI_TOKENS = 5;
  const BOARD = { width: 960, height: 620, lanes: 6 };
  const THEMES = {
    bg: '#07111f',
    panel: 'rgba(13, 24, 44, 0.86)',
    panelAlt: 'rgba(20, 34, 61, 0.88)',
    border: 'rgba(128, 182, 255, 0.22)',
    accent: '#6ce5ff',
    accent2: '#8d84ff',
    accent3: '#7bffba',
    warning: '#ffd166',
    danger: '#ff6f9f',
    text: '#f5f8ff',
    subtext: '#bfd0ee',
    track: '#10213d',
    cardShadow: '0 18px 50px rgba(0, 0, 0, 0.34)',
  };

  const MODIFIERS = {
    Balanced: { price: 0, description: 'A stable all-round setup for every run', playerSpeed: 1, coinBonus: 1, pressure: 1, waveBonus: 1 },
    'Rich Run': { price: 160, description: 'Higher coin gains for efficient survival runs', playerSpeed: 1, coinBonus: 1.35, pressure: 1.14, waveBonus: 1.08 },
    Swift: { price: 125, description: 'Sharper lane swaps and faster response windows', playerSpeed: 1.1, coinBonus: 1, pressure: 1.06, waveBonus: 1 },
    Zen: { price: 220, description: 'Slower movement with steadier pressure and safer pacing', playerSpeed: 0.9, coinBonus: 0.92, pressure: 0.92, waveBonus: 0.95 },
    Challenger: { price: 260, description: 'Explosive scoring with intense obstacle pressure', playerSpeed: 1.05, coinBonus: 1.6, pressure: 1.3, waveBonus: 1.2 },
  };

  const POWERUPS = {
    None: { price: 0, description: 'No active powerup effects' },
    Quickstep: { price: 200, description: 'Instant lane snapping for precise dodges' },
    'Block Slowdown': { price: 240, description: 'Slows dynamic difficulty ramping to reduce pressure spikes' },
    'Shield Matrix': { price: 280, description: 'Start each run with one extra life' },
    'Lucky Drift': { price: 190, description: 'Boosts run coin gains by 20%' },
  };

  const GAME_MODES = {
    Classic: {
      description: 'Pure lane-dodge survival with steady difficulty ramping',
      speed: 1,
      interval: 1,
      pickups: 0.45,
      objective: 'Survive as long as possible and bank coins',
      modeScore: 1,
    },
    Blitz: {
      description: 'Fast dense waves with stronger score rewards',
      speed: 1.22,
      interval: 0.78,
      pickups: 0.35,
      objective: 'Push your reaction speed in short high-intensity sessions',
      modeScore: 1.35,
    },
    Gauntlet: {
      description: 'Longer runs with elite hazard formations and reward spikes',
      speed: 1.08,
      interval: 0.92,
      pickups: 0.5,
      objective: 'Clear elite waves and survive longer patterns',
      modeScore: 1.5,
    },
    Harvest: {
      description: 'More pickups less raw pressure and smoother farming routes',
      speed: 0.95,
      interval: 1.08,
      pickups: 0.82,
      objective: 'Farm coins and keep momentum high',
      modeScore: 0.95,
    },
    Story: {
      description: 'Progress through handcrafted sectors objectives and dialogue',
      speed: 1,
      interval: 1,
      pickups: 0.55,
      objective: 'Finish every sector objective to complete the campaign',
      modeScore: 1.15,
    },
  };

  const STORY_CHAPTERS = [
    {
      id: 'sector-01',
      title: 'Sector One: Wake Protocol',
      briefing: 'The arena core is unstable so survive long enough to restore the first lane beacon',
      objectiveLabel: 'Reach 25 score and collect 4 shards',
      targetScore: 25,
      targetPickups: 4,
      reward: 120,
    },
    {
      id: 'sector-02',
      title: 'Sector Two: Crosswind Array',
      briefing: 'Cross-lane turbulence is corrupting the route planner so hold a stable route under pressure',
      objectiveLabel: 'Reach 40 score and collect 5 shards',
      targetScore: 40,
      targetPickups: 5,
      reward: 180,
    },
    {
      id: 'sector-03',
      title: 'Sector Three: Final Echo',
      briefing: 'The final echo wall is closing so finish the run with a high score burst and a preserved shield',
      objectiveLabel: 'Reach 60 score and finish with at least 1 life',
      targetScore: 60,
      requireLife: true,
      reward: 260,
    },
  ];

  const MISSIONS = [
    'Finish a run in any mode',
    'Collect three energy shards in one run',
    'Reach 18 score in one run',
    'Use a powerup and finish above 20 score',
  ];

  const DEFAULT_DATA = {
    coins: 0,
    bestScore: 0,
    bestByMode: {},
    totalRuns: 0,
    totalPickups: 0,
    longestCombo: 0,
    missionsClaimed: {},
    dailyProgress: {
      dayKey: '',
      runs: 0,
      pickups: 0,
      bestScore: 0,
      usedPowerup: false,
    },
    ownedModifiers: ['Balanced'],
    selectedModifier: 'Balanced',
    ownedPowerups: [],
    selectedPowerup: 'None',
    selectedMode: 'Classic',
    storyProgress: 0,
    storyRewardsClaimed: [],
    aiTokenDate: '',
    aiTokensUsedToday: 0,
    aiPurchasedTokens: 0,
    activeCheats: [],
    betaDismissed: false,
  };

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const pick = items => items[Math.floor(Math.random() * items.length)];
  const betaFeaturesEnabled = () => localStorage.getItem('xyrex_beta_features') === 'enabled';
  const localDayKey = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  function readStorage() {
    const keys = [STORAGE_KEY, LEGACY_STORAGE_KEY];
    for (const key of keys) {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        return { ...DEFAULT_DATA, ...(JSON.parse(raw) || {}) };
      } catch {
        // Ignore invalid data and fall back.
      }
    }
    return { ...DEFAULT_DATA };
  }

  function saveStorage(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function injectStyles() {
    if (document.getElementById('xyrex-dodge-beta-style')) return;
    const style = document.createElement('style');
    style.id = 'xyrex-dodge-beta-style';
    style.textContent = `
      .xy-dodge-shell { color: ${THEMES.text}; font-family: Inter, system-ui, sans-serif; display: grid; gap: 12px; }
      .xy-dodge-shell * { box-sizing: border-box; }
      .xy-dodge-shell button, .xy-dodge-shell select { font: inherit; }
      .xy-dodge-shell button { cursor: pointer; }
      .xy-dodge-shell[data-beta='false'] .xy-dodge-hero-copy,
      .xy-dodge-shell[data-beta='false'] .xy-dodge-panel--beta,
      .xy-dodge-shell[data-beta='false'] .xy-dodge-panel--overview,
      .xy-dodge-shell[data-beta='false'] .xy-dodge-kicker { display: none; }
      .xy-dodge-hero, .xy-dodge-panel, .xy-dodge-board, .xy-dodge-modal-card {
        background: linear-gradient(180deg, ${THEMES.panelAlt}, ${THEMES.panel}); border: 1px solid ${THEMES.border};
        border-radius: 18px; box-shadow: ${THEMES.cardShadow};
      }
      .xy-dodge-hero { display: grid; grid-template-columns: minmax(0, 1.3fr) minmax(240px, 0.8fr); gap: 12px; padding: 10px 14px; }
      .xy-dodge-heading { display: grid; gap: 8px; align-content: start; }
      .xy-dodge-kicker { display: inline-flex; width: fit-content; padding: 5px 10px; border-radius: 999px; background: rgba(108,229,255,0.12); color: ${THEMES.accent}; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
      .xy-dodge-heading h2 { margin: 0; font-size: clamp(24px, 3vw, 34px); line-height: 1.05; }
      .xy-dodge-heading p, .xy-dodge-panel p { margin: 0; color: ${THEMES.subtext}; line-height: 1.45; font-size: 13px; }
      .xy-dodge-stat-grid, .xy-dodge-quick-grid, .xy-dodge-mode-grid, .xy-dodge-shop-grid, .xy-dodge-meta-grid { display: grid; gap: 10px; }
      .xy-dodge-stat-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
      .xy-dodge-chip, .xy-dodge-mode-card, .xy-dodge-mini-card, .xy-dodge-story-card, .xy-dodge-mission-card {
        background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 10px 12px;
      }
      .xy-dodge-chip span, .xy-dodge-mini-card span { display:block; font-size:11px; color:${THEMES.subtext}; text-transform:uppercase; letter-spacing:.04em; }
      .xy-dodge-chip strong, .xy-dodge-mode-card strong, .xy-dodge-mini-card strong { display: block; font-size: 17px; margin-top: 4px; }
      .xy-dodge-layout { display: grid; grid-template-columns: minmax(0, 1.7fr) minmax(280px, 0.74fr); gap: 12px; align-items: start; }
      .xy-dodge-board { padding: 12px; display: grid; gap: 10px; min-width: 0; }
      .xy-dodge-toolbar, .xy-dodge-control-row, .xy-dodge-mobile-controls, .xy-dodge-segmented { display: flex; flex-wrap: wrap; gap: 8px; }
      .xy-dodge-toolbar { justify-content: space-between; align-items: center; }
      .xy-dodge-badges { display: flex; flex-wrap: wrap; gap: 6px; }
      .xy-dodge-badge { padding: 6px 10px; border-radius: 999px; background: rgba(141,132,255,0.12); color: ${THEMES.text}; font-size: 12px; }
      .xy-dodge-canvas-wrap { position: relative; background: radial-gradient(circle at top, rgba(108,229,255,0.08), transparent 40%), ${THEMES.track}; border-radius: 16px; overflow: hidden; min-height: 250px; }
      .xy-dodge-canvas { display: block; width: 100%; height: auto; aspect-ratio: 960 / 620; border-radius: 16px; }
      .xy-dodge-overlay { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; padding: 16px; background: rgba(2, 7, 17, 0.64); backdrop-filter: blur(6px); }
      .xy-dodge-overlay[hidden] { display: none; }
      .xy-dodge-modal-card { max-width: 500px; width: min(100%, 500px); padding: 20px; }
      .xy-dodge-side { display: grid; gap: 12px; min-width: 0; align-content: start; }
      .xy-dodge-panel { padding: 12px; display: grid; gap: 10px; min-width: 0; overflow: hidden; }
      .xy-dodge-panel h3, .xy-dodge-panel h4 { margin: 0; font-size: 16px; }
      .xy-dodge-button, .xy-dodge-select, .xy-dodge-mobile-controls button {
        border: 1px solid rgba(108,229,255,0.18); border-radius: 12px; background: rgba(14, 22, 44, 0.98); color: ${THEMES.text};
        min-height: 38px; min-width: 0; width: 100%; padding: 8px 12px; transition: transform 0.16s ease, background 0.16s ease, border-color 0.16s ease, box-shadow 0.2s ease;
      }
      .xy-dodge-button:hover, .xy-dodge-select:hover, .xy-dodge-mobile-controls button:hover { transform: translateY(-1px); background: rgba(22, 34, 67, 0.98); }
      .xy-dodge-button--primary { background: linear-gradient(135deg, rgba(108,229,255,0.22), rgba(141,132,255,0.18)); border-color: rgba(108,229,255,0.28); }
      .xy-dodge-button--danger { background: rgba(255,111,159,0.16); }
      .xy-dodge-button[disabled], .xy-dodge-select[disabled] { opacity: 0.55; cursor: not-allowed; transform: none; }
      .xy-dodge-mode-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .xy-dodge-mode-card[data-active='true'], .xy-dodge-segmented button[data-active='true'] { border-color: rgba(108,229,255,0.5); box-shadow: inset 0 0 0 1px rgba(108,229,255,0.22), 0 0 22px rgba(108,229,255,0.08); }
      .xy-dodge-story-card[data-locked='true'] { opacity: 0.65; }
      .xy-dodge-progress { height: 8px; border-radius: 999px; background: rgba(255,255,255,0.08); overflow: hidden; }
      .xy-dodge-progress > span { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, ${THEMES.accent}, ${THEMES.accent2}); transition: width .25s ease; }
      .xy-dodge-mini-card small, .xy-dodge-panel small { color: ${THEMES.subtext}; font-size: 12px; }
      .xy-dodge-note { color: ${THEMES.subtext}; font-size: 12px; }
      .xy-dodge-mobile-controls { justify-content: center; }
      .xy-dodge-mobile-controls[hidden] { display: none; }
      .xy-dodge-mobile-controls button { flex: 1; min-width: 120px; font-size: 18px; }
      .xy-dodge-select { appearance: none; -webkit-appearance:none; color-scheme: dark; background-image: linear-gradient(45deg, transparent 50%, ${THEMES.subtext} 50%), linear-gradient(135deg, ${THEMES.subtext} 50%, transparent 50%); background-position: calc(100% - 18px) calc(50% - 3px), calc(100% - 12px) calc(50% - 3px); background-size: 6px 6px, 6px 6px; background-repeat: no-repeat; padding-right: 32px; }
      .xy-dodge-select option { background: #111a34; color: ${THEMES.text}; }
      .xy-dodge-select:focus { outline: 2px solid rgba(108,229,255,0.3); outline-offset: 2px; box-shadow: 0 0 0 3px rgba(108,229,255,0.14); }
      .xy-dodge-panel input[type='checkbox'] { appearance:none; -webkit-appearance:none; width:16px; height:16px; margin:0 8px 0 0; border:1px solid rgba(141,156,255,0.72); border-radius:4px; background:rgba(16,24,49,0.96); box-shadow:inset 0 0 0 1px rgba(108,229,255,0.12); vertical-align:middle; position:relative; }
      .xy-dodge-panel input[type='checkbox']:checked { background:${THEMES.accent2}; border-color:${THEMES.accent}; }
      .xy-dodge-panel input[type='checkbox']:checked::after { content:'✓'; position:absolute; left:3px; top:-1px; color:#061121; font-size:11px; font-weight:800; }
      .xy-dodge-panel label { display:flex; align-items:center; color:${THEMES.subtext}; }
      .xy-dodge-control-row > .xy-dodge-button { width: auto; flex: 1 1 0; }
      .xy-dodge-shell-classic .xy-dodge-mini-card strong { font-size: 18px; }
      .xy-dodge-toast { padding: 8px 12px; border-radius: 12px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); font-size: 13px; }
      .xy-dodge-toast[data-tone='warning'] { background: rgba(255, 209, 102, 0.13); }
      .xy-dodge-toast[data-tone='danger'] { background: rgba(255, 111, 159, 0.18); }
      .xy-dodge-toast[data-tone='ok'] { animation: xyPulse 0.35s ease; }
      .xy-dodge-segmented { background: rgba(255,255,255,0.04); border-radius: 14px; padding: 4px; }
      .xy-dodge-segmented button { flex: 1; min-width: 88px; }
      .xy-dodge-compact-grid { display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap:10px; }
      @keyframes xyPulse { 0% { transform: scale(.98); } 100% { transform: scale(1); } }
      @media (max-width: 1120px) { .xy-dodge-layout, .xy-dodge-hero { grid-template-columns: 1fr; } .xy-dodge-stat-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
      @media (max-width: 720px) {
        .xy-dodge-mode-grid, .xy-dodge-stat-grid, .xy-dodge-compact-grid { grid-template-columns: 1fr; }
        .xy-dodge-shell { gap: 10px; }
        .xy-dodge-panel, .xy-dodge-board, .xy-dodge-hero { padding: 12px; border-radius: 16px; }
      }
      @media (orientation: landscape) and (max-width: 960px) {
        .xy-dodge-layout { grid-template-columns: 1.22fr 0.78fr; }
        .xy-dodge-canvas-wrap { min-height: 220px; }
      }
    `;
    document.head.appendChild(style);
  }

  class XyrexDodgeGame {
    constructor(mount) {
      this.mount = mount;
      this.data = this.loadData();
      this.running = false;
      this.paused = false;
      this.gameOver = false;
      this.lastTs = 0;
      this.rafId = 0;
      this.score = 0;
      this.runCoins = 0;
      this.level = 1;
      this.combo = 0;
      this.bestComboRun = 0;
      this.storyPickups = 0;
      this.missionIndex = 0;
      this.previewModifier = this.data.selectedModifier;
      this.previewPowerup = this.data.selectedPowerup;
      this.spawnTimer = 0;
      this.pickupTimer = 0;
      this.particles = [];
      this.blocks = [];
      this.pickups = [];
      this.dialogueTimer = 0;
      this.storyChapter = this.resolveStoryChapter();
      this.ensureTokenState();
      injectStyles();
      this.buildUi();
      this.attachGlobalListeners();
      this.hydrateRemoteProgress();
    }

    loadData() {
      const loaded = readStorage();
      const normalized = {
        ...DEFAULT_DATA,
        ...loaded,
        ownedModifiers: Array.isArray(loaded.ownedModifiers) && loaded.ownedModifiers.length ? loaded.ownedModifiers.filter(item => MODIFIERS[item]) : ['Balanced'],
        ownedPowerups: Array.isArray(loaded.ownedPowerups) ? loaded.ownedPowerups.filter(item => POWERUPS[item]) : [],
        selectedModifier: MODIFIERS[loaded.selectedModifier] ? loaded.selectedModifier : 'Balanced',
        selectedPowerup: POWERUPS[loaded.selectedPowerup] ? loaded.selectedPowerup : 'None',
        selectedMode: GAME_MODES[loaded.selectedMode] ? loaded.selectedMode : 'Classic',
        missionsClaimed: loaded.missionsClaimed && typeof loaded.missionsClaimed === 'object' ? loaded.missionsClaimed : {},
        storyRewardsClaimed: Array.isArray(loaded.storyRewardsClaimed) ? loaded.storyRewardsClaimed : [],
        activeCheats: Array.isArray(loaded.activeCheats) ? loaded.activeCheats.map(item => String(item).toLowerCase()) : [],
      };
      saveStorage(normalized);
      return normalized;
    }

    saveData() {
      saveStorage(this.data);
      if (this.syncTimer) clearTimeout(this.syncTimer);
      this.syncTimer = window.setTimeout(() => {
        window.XyrexAuth?.saveAccountProgress?.('dodge', this.data);
      }, 150);
    }

    async hydrateRemoteProgress() {
      try {
        const remote = await window.XyrexAuth?.loadAccountProgress?.('dodge');
        if (!remote || typeof remote !== 'object') return;
        this.data = {
          ...this.data,
          ...remote,
          ownedModifiers: Array.isArray(remote.ownedModifiers) && remote.ownedModifiers.length ? remote.ownedModifiers.filter(item => MODIFIERS[item]) : this.data.ownedModifiers,
          ownedPowerups: Array.isArray(remote.ownedPowerups) ? remote.ownedPowerups.filter(item => POWERUPS[item]) : this.data.ownedPowerups,
          selectedModifier: MODIFIERS[remote.selectedModifier] ? remote.selectedModifier : this.data.selectedModifier,
          selectedPowerup: POWERUPS[remote.selectedPowerup] ? remote.selectedPowerup : this.data.selectedPowerup,
          selectedMode: GAME_MODES[remote.selectedMode] ? remote.selectedMode : this.data.selectedMode,
        };
        this.ensureTokenState();
        this.previewModifier = this.data.selectedModifier;
        this.previewPowerup = this.data.selectedPowerup;
        this.saveData();
        this.syncUi();
      } catch {
        // Ignore remote progress issues.
      }
    }

    ensureTokenState() {
      const today = localDayKey();
      if (this.data.aiTokenDate !== today) {
        this.data.aiTokenDate = today;
        this.data.aiTokensUsedToday = 0;
        this.saveData();
      }
    }

    availableAiTokens() {
      this.ensureTokenState();
      return Math.max(0, FREE_DAILY_AI_TOKENS - this.data.aiTokensUsedToday) + Math.max(0, this.data.aiPurchasedTokens);
    }

    resolveStoryChapter() {
      return STORY_CHAPTERS[clamp(this.data?.storyProgress || 0, 0, STORY_CHAPTERS.length - 1)] || STORY_CHAPTERS[0];
    }

    isBetaEnabled() {
      return betaFeaturesEnabled();
    }

    activeCheatSet() {
      return new Set((this.data.activeCheats || []).map(item => String(item).toLowerCase()).filter(Boolean));
    }

    hasEnabledCheat() {
      return this.activeCheatSet().size > 0;
    }

    buildUi() {
      const betaEnabled = this.isBetaEnabled();
      const visibleMode = betaEnabled ? this.data.selectedMode : 'Classic';
      const classicProgress = this.data.bestScore || 0;
      this.mount.innerHTML = `
        <section class="xy-dodge-shell" data-beta="${betaEnabled}" aria-label="Xyrex Dodge">
          <section class="xy-dodge-hero">
            <div class="xy-dodge-heading">
              <span class="xy-dodge-kicker">${betaEnabled ? 'Beta Features active' : 'Classic layout active'}</span>
              <h2>Xyrex Dodge</h2>
              <p class="xy-dodge-hero-copy">The beta overhaul is now tighter and easier to read with compact tabs animations and progression features that stay gated behind Beta Features</p>
              <div class="xy-dodge-stat-grid">
                <div class="xy-dodge-chip"><span>Coins</span><strong id="xyBank">0</strong></div>
                <div class="xy-dodge-chip"><span>Best</span><strong id="xyBest">0</strong></div>
                <div class="xy-dodge-chip"><span>Runs</span><strong id="xyRuns">0</strong></div>
                <div class="xy-dodge-chip"><span>Powerup</span><strong id="xyPowerupLabel">${this.data.selectedPowerup}</strong></div>
              </div>
            </div>
            <div class="xy-dodge-panel xy-dodge-panel--overview">
              <div class="xy-dodge-meta-grid">
                <div class="xy-dodge-mini-card"><span>Mode</span><strong id="xyCurrentModeLabel">${visibleMode}</strong><small id="xyModeObjective">Survive and score</small></div>
                <div class="xy-dodge-mini-card"><span>AI Tokens</span><strong id="xyTokenCount">0</strong><small>Daily + purchased</small></div>
                <div class="xy-dodge-mini-card"><span>Story</span><strong id="xyStoryProgressLabel">0 / ${STORY_CHAPTERS.length}</strong><small>Sector progress</small></div>
              </div>
              <div id="xyBetaNotice" class="xy-dodge-toast" data-tone="warning" ${betaEnabled ? 'hidden' : ''}>Beta Features are disabled so turn them on in Settings to enable story mode additional game modes missions and the new responsive interface</div>
            </div>
          </section>

          <section class="xy-dodge-layout">
            <section class="xy-dodge-board">
              <div class="xy-dodge-toolbar">
                <div class="xy-dodge-badges">
                  <span class="xy-dodge-badge" id="xyRunScore">Score: 0</span>
                  <span class="xy-dodge-badge" id="xyRunCoins">Coins: 0</span>
                  <span class="xy-dodge-badge" id="xyRunLives">Lives: 1</span>
                </div>
                <div class="xy-dodge-control-row">
                  <button class="xy-dodge-button" id="xyPauseBtn" type="button">Pause</button>
                  <button class="xy-dodge-button xy-dodge-button--danger" id="xyRestartBtn" type="button">Restart</button>
                </div>
              </div>
              <div class="xy-dodge-canvas-wrap">
                <canvas class="xy-dodge-canvas" id="xyGameCanvas" width="${BOARD.width}" height="${BOARD.height}" tabindex="0" aria-label="Dodge game board"></canvas>
                <div class="xy-dodge-overlay" id="xyOverlay" hidden></div>
              </div>
              <div class="xy-dodge-mobile-controls" id="xyMobileControls" hidden>
                <button type="button" class="xy-dodge-button" data-mobile-move="left">◀ Move Left</button>
                <button type="button" class="xy-dodge-button" data-mobile-move="right">Move Right ▶</button>
              </div>
              <div class="xy-dodge-segmented" id="xyTabRow">
                <button class="xy-dodge-button" data-tab="modes" data-active="true" type="button">Modes</button>
                <button class="xy-dodge-button" data-tab="progression" data-active="false" type="button">Progress</button>
                <button class="xy-dodge-button" data-tab="loadout" data-active="false" type="button">Loadout</button>
              </div>
              <div id="xyTabContent"></div>
            </section>

            <aside class="xy-dodge-side">
              <section class="xy-dodge-panel">
                <h3>Status</h3>
                <div id="xyStatus" class="xy-dodge-toast">Ready</div>
                <small>${betaEnabled ? 'Compact beta layout enabled with advanced progression' : 'Beta Features are disabled so Dodge stays on the classic layout'}</small>
              </section>
              <section class="xy-dodge-panel xy-dodge-panel--mission">
                <h3>Mission</h3>
                <div id="xyMissionCard"></div>
              </section>
              <section class="xy-dodge-panel">
                <h3>Token Shop</h3>
                <div class="xy-dodge-shop-grid">
                  <button class="xy-dodge-button xy-dodge-button--primary" type="button" data-token-pack="1" data-token-cost="60">60 coins → 1 token</button>
                  <button class="xy-dodge-button xy-dodge-button--primary" type="button" data-token-pack="3" data-token-cost="150">150 coins → 3 tokens</button>
                  <button class="xy-dodge-button xy-dodge-button--primary" type="button" data-token-pack="7" data-token-cost="300">300 coins → 7 tokens</button>
                </div>
              </section>
              <section class="xy-dodge-panel xy-dodge-panel--beta" id="xyCheatCard" ${betaEnabled ? '' : 'hidden'}>
                <h3>Beta Utilities</h3>
                <label><input type="checkbox" data-cheat="autoplay" /> Auto Play</label>
                <label><input type="checkbox" data-cheat="nodeath" /> No Death</label>
                <label><input type="checkbox" data-cheat="slowtime" /> Slow Time</label>
                <label><input type="checkbox" data-cheat="ghost" /> Ghost Trail</label>
                <small>Coins are disabled while utilities are active</small>
              </section>
            </aside>
          </section>
        </section>
      `;

      this.canvas = this.mount.querySelector('#xyGameCanvas');
      this.ctx = this.canvas.getContext('2d');
      this.overlay = this.mount.querySelector('#xyOverlay');
      this.tabContent = this.mount.querySelector('#xyTabContent');
      this.pauseBtn = this.mount.querySelector('#xyPauseBtn');
      this.restartBtn = this.mount.querySelector('#xyRestartBtn');
      this.statusEl = this.mount.querySelector('#xyStatus');
      this.bestEl = this.mount.querySelector('#xyBest');
      this.bankEl = this.mount.querySelector('#xyBank');
      this.runsEl = this.mount.querySelector('#xyRuns');
      this.powerupLabelEl = this.mount.querySelector('#xyPowerupLabel');
      this.runScoreEl = this.mount.querySelector('#xyRunScore');
      this.runCoinsEl = this.mount.querySelector('#xyRunCoins');
      this.runLivesEl = this.mount.querySelector('#xyRunLives');
      this.currentModeLabelEl = this.mount.querySelector('#xyCurrentModeLabel');
      this.modeObjectiveEl = this.mount.querySelector('#xyModeObjective');
      this.tokenCountEl = this.mount.querySelector('#xyTokenCount');
      this.storyProgressLabelEl = this.mount.querySelector('#xyStoryProgressLabel');
      this.mobileControls = this.mount.querySelector('#xyMobileControls');
      this.missionCardEl = this.mount.querySelector('#xyMissionCard');
      this.cheatCard = this.mount.querySelector('#xyCheatCard');
      this.cheatInputs = Array.from(this.mount.querySelectorAll('[data-cheat]'));
      this.modifierSelect = this.mount.querySelector('#xyModifierSelect');
      this.powerupSelect = this.mount.querySelector('#xyPowerupSelect');
      this.buyModifierBtn = this.mount.querySelector('#xyBuyModifierBtn');
      this.buyPowerupBtn = this.mount.querySelector('#xyBuyPowerupBtn');

      if (this.tabContent) this.renderTab('modes');
      this.previewModifier = this.data.selectedModifier;
      this.previewPowerup = this.data.selectedPowerup;
      this.registerUiListeners();
      this.syncUi();
      this.applyResponsiveState();
    }

    registerUiListeners() {
      this.pauseBtn.addEventListener('click', () => this.togglePause());
      this.restartBtn.addEventListener('click', () => this.restart());
      this.mount.querySelectorAll('[data-token-pack]').forEach(button => {
        button.addEventListener('click', () => this.buyTokenPack(Number(button.dataset.tokenPack), Number(button.dataset.tokenCost)));
      });
      this.mount.querySelectorAll('[data-tab]').forEach(button => {
        button.addEventListener('click', () => this.renderTab(button.dataset.tab || 'modes'));
      });
      this.modifierSelect?.addEventListener('change', () => {
        this.previewModifier = this.modifierSelect.value;
        if (this.modifierDesc) this.modifierDesc.textContent = (MODIFIERS[this.previewModifier] || MODIFIERS.Balanced).description;
        this.syncLoadoutButtons();
      });
      this.powerupSelect?.addEventListener('change', () => {
        this.previewPowerup = this.powerupSelect.value;
        if (this.powerupDesc) this.powerupDesc.textContent = (POWERUPS[this.previewPowerup] || POWERUPS.None).description;
        this.syncLoadoutButtons();
      });
      this.buyModifierBtn?.addEventListener('click', () => this.buySelectedModifier());
      this.buyPowerupBtn?.addEventListener('click', () => this.buySelectedPowerup());
      this.mobileControls.querySelectorAll('[data-mobile-move]').forEach(button => {
        const onPress = event => {
          event.preventDefault();
          const move = button.getAttribute('data-mobile-move');
          this.queueMove(move);
        };
        button.addEventListener('pointerdown', onPress);
        button.addEventListener('touchstart', onPress, { passive: false });
      });
      this.cheatInputs.forEach(input => {
        input.addEventListener('change', () => {
          const set = this.activeCheatSet();
          const cheat = input.dataset.cheat;
          if (!cheat) return;
          if (input.checked) set.add(cheat);
          else set.delete(cheat);
          this.data.activeCheats = [...set];
          this.saveData();
          this.syncUi();
        });
      });

      this.handleKeyDown = event => {
        const key = event.key.toLowerCase();
        const tag = (event.target?.tagName || '').toLowerCase();
        const formTarget = ['input', 'textarea', 'select', 'button'].includes(tag);
        if ((key === 'arrowleft' || key === 'a') && !formTarget) {
          if (event.repeat) return;
          event.preventDefault();
          this.queueMove('left');
        }
        if ((key === 'arrowright' || key === 'd') && !formTarget) {
          if (event.repeat) return;
          event.preventDefault();
          this.queueMove('right');
        }
        if (key === 'p' && !formTarget) {
          event.preventDefault();
          this.togglePause();
        }
        if (key === 'r' && !formTarget) {
          event.preventDefault();
          this.restart();
        }
      };
      this.handleKeyUp = () => {};
    }

    queueMove(direction) {
      if (!this.running || this.paused || this.gameOver) return;
      if (direction === 'left') this.moveQueue.push(-1);
      if (direction === 'right') this.moveQueue.push(1);
    }

    attachGlobalListeners() {
      this.moveQueue = [];
      this.onResize = () => this.applyResponsiveState();
      window.addEventListener('resize', this.onResize);
      window.XyrexAccountScope?.onAccountChange?.(() => {
        this.data = this.loadData();
        this.storyChapter = this.resolveStoryChapter();
        this.ensureTokenState();
        this.previewModifier = this.data.selectedModifier;
        this.previewPowerup = this.data.selectedPowerup;
        this.syncUi();
      });
    }

    renderTab(tab) {
      if (!this.tabContent) return;
      this.activeTab = tab;
      this.mount.querySelectorAll('[data-tab]').forEach(button => {
        button.setAttribute('data-active', String(button.dataset.tab === tab));
      });
      if (tab === 'modes') this.tabContent.innerHTML = this.renderModesTab();
      if (tab === 'progression') this.tabContent.innerHTML = this.renderProgressionTab();
      if (tab === 'loadout') this.tabContent.innerHTML = this.renderLoadoutTab();
      this.bindDynamicUi();
    }

    renderModesTab() {
      const betaEnabled = this.isBetaEnabled();
      const cards = Object.entries(GAME_MODES)
        .filter(([name]) => betaEnabled || name === 'Classic')
        .map(([name, config]) => `
          <button class="xy-dodge-mode-card xy-dodge-button" type="button" data-mode="${name}" data-active="${this.data.selectedMode === name}">
            <strong>${name}</strong>
            <p>${config.description.replace(/\.$/, '')}</p>
            <small>${config.objective.replace(/\.$/, '')}</small>
          </button>
        `).join('');
      return `<div class="xy-dodge-mode-grid">${cards}</div>${betaEnabled ? '' : '<div class="xy-dodge-panel"><strong>Classic mode only</strong><p>Enable Beta Features to unlock Blitz Gauntlet Harvest and Story modes</p></div>'}`;
    }

    renderProgressionTab() {
      const storyProgress = this.data.storyProgress || 0;
      const storyCards = STORY_CHAPTERS.map((chapter, index) => {
        const locked = !this.isBetaEnabled() || index > storyProgress;
        const completed = index < storyProgress || this.data.storyRewardsClaimed.includes(chapter.id);
        return `
          <div class="xy-dodge-story-card" data-locked="${locked}">
            <strong>${chapter.title}</strong>
            <p>${chapter.briefing.replace(/\.$/, '')}</p>
            <small>${chapter.objectiveLabel.replace(/\.$/, '')}</small>
            <div class="xy-dodge-control-row">
              <span class="xy-dodge-badge">Reward: ${chapter.reward} coins</span>
              <span class="xy-dodge-badge">${completed ? 'Completed' : locked ? 'Locked' : 'Available'}</span>
            </div>
          </div>
        `;
      }).join('');
      if (!this.isBetaEnabled()) {
        return `
          <div class="xy-dodge-panel">
            <strong>Classic progression</strong>
            <p>Your best score is ${this.data.bestScore || 0} and your coins total ${this.data.coins || 0}</p>
            <small>Enable Beta Features to unlock Story progression and daily objectives</small>
          </div>
        `;
      }
      return `
        <div class="xy-dodge-panel" style="padding:0; background:none; border:none; box-shadow:none;">
          <div class="xy-dodge-story-card">
            <strong>Story Campaign</strong>
            <p>${this.storyChapter.briefing}</p>
            <div class="xy-dodge-progress"><span style="width:${((storyProgress) / STORY_CHAPTERS.length) * 100}%"></span></div>
          </div>
          ${storyCards}
        </div>
      `;
    }

    renderLoadoutTab() {
      const betaEnabled = this.isBetaEnabled();
      const modifierOptions = Object.entries(MODIFIERS).map(([name, item]) => `
        <option value="${name}">${name}${item.price ? ` · ${item.price}c` : ''}</option>
      `).join('');
      const powerupOptions = Object.entries(POWERUPS).map(([name, item]) => `
        <option value="${name}">${name}${item.price ? ` · ${item.price}c` : ''}</option>
      `).join('');
      const currentModifier = MODIFIERS[this.previewModifier] || MODIFIERS.Balanced;
      const currentPowerup = POWERUPS[this.previewPowerup] || POWERUPS.None;
      return `
        <div class="xy-dodge-panel">
          <strong>Loadout overview</strong>
          <p>Choose a modifier for run pacing and a powerup for a direct gameplay effect</p>
          <small>Owned gear can be equipped instantly while locked gear must be purchased first</small>
        </div>
        <div class="xy-dodge-quick-grid">
          <div class="xy-dodge-panel">
            <h4>Modifier</h4>
            <select id="xyModifierSelect" class="xy-dodge-select">${modifierOptions}</select>
            <p id="xyModifierDesc">${currentModifier.description}</p>
            <small>Effect: adjusts movement pressure and coin gain for the whole run</small>
            <button id="xyBuyModifierBtn" class="xy-dodge-button xy-dodge-button--primary" type="button">${this.data.ownedModifiers.includes(this.previewModifier) ? (this.data.selectedModifier === this.previewModifier ? 'Equipped' : 'Equip') : `Buy for ${currentModifier.price} coins`}</button>
          </div>
          <div class="xy-dodge-panel">
            <h4>Powerup</h4>
            <select id="xyPowerupSelect" class="xy-dodge-select">${powerupOptions}</select>
            <p id="xyPowerupDesc">${currentPowerup.description}</p>
            <small>Effect: applies a direct run bonus when equipped</small>
            <button id="xyBuyPowerupBtn" class="xy-dodge-button xy-dodge-button--primary" type="button">${this.previewPowerup === 'None' || this.data.ownedPowerups.includes(this.previewPowerup) ? (this.data.selectedPowerup === this.previewPowerup ? 'Equipped' : 'Equip') : `Buy for ${currentPowerup.price} coins`}</button>
          </div>
        </div>
      `;
    }

    bindDynamicUi() {
      this.modeButtons = Array.from(this.tabContent.querySelectorAll('[data-mode]'));
      this.modeButtons.forEach(button => button.addEventListener('click', () => {
        this.data.selectedMode = button.dataset.mode || 'Classic';
        this.saveData();
        this.storyChapter = this.resolveStoryChapter();
        this.renderTab('modes');
        this.syncUi();
        this.flashStatus(`${this.data.selectedMode} selected`, 'ok');
        if (this.running) this.restart();
      }));

      this.modifierSelect = this.tabContent.querySelector('#xyModifierSelect') || this.modifierSelect;
      this.powerupSelect = this.tabContent.querySelector('#xyPowerupSelect') || this.powerupSelect;
      this.modifierDesc = this.tabContent.querySelector('#xyModifierDesc');
      this.powerupDesc = this.tabContent.querySelector('#xyPowerupDesc');
      this.buyModifierBtn = this.tabContent.querySelector('#xyBuyModifierBtn') || this.buyModifierBtn;
      this.buyPowerupBtn = this.tabContent.querySelector('#xyBuyPowerupBtn') || this.buyPowerupBtn;

      if (this.modifierSelect) {
        this.modifierSelect.value = this.previewModifier;
        this.modifierSelect.addEventListener('change', () => {
          this.previewModifier = this.modifierSelect.value;
          this.renderTab('loadout');
          this.syncUi();
        });
      }
      if (this.powerupSelect) {
        this.powerupSelect.value = this.previewPowerup;
        this.powerupSelect.addEventListener('change', () => {
          this.previewPowerup = this.powerupSelect.value;
          this.renderTab('loadout');
          this.syncUi();
        });
      }
      this.buyModifierBtn?.addEventListener('click', () => this.buySelectedModifier());
      this.buyPowerupBtn?.addEventListener('click', () => this.buySelectedPowerup());
    }

    applyResponsiveState() {
      const touchDevice = window.matchMedia('(pointer: coarse)').matches || (navigator.maxTouchPoints || 0) > 0 || window.innerWidth <= 900;
      this.mobileControls.hidden = !touchDevice;
    }

    syncLoadoutButtons() {
      if (this.modifierSelect) this.modifierSelect.value = this.previewModifier;
      if (this.powerupSelect) this.powerupSelect.value = this.previewPowerup;
      const modifier = MODIFIERS[this.previewModifier] || MODIFIERS.Balanced;
      const powerup = POWERUPS[this.previewPowerup] || POWERUPS.None;
      if (this.modifierDesc) this.modifierDesc.textContent = modifier.description;
      if (this.powerupDesc) this.powerupDesc.textContent = powerup.description;
      if (this.buyModifierBtn) this.buyModifierBtn.textContent = this.data.ownedModifiers.includes(this.previewModifier) ? (this.data.selectedModifier === this.previewModifier ? 'Equipped' : 'Equip') : `Buy for ${modifier.price} coins`;
      if (this.buyPowerupBtn) this.buyPowerupBtn.textContent = this.previewPowerup === 'None' || this.data.ownedPowerups.includes(this.previewPowerup) ? (this.data.selectedPowerup === this.previewPowerup ? 'Equipped' : 'Equip') : `Buy for ${powerup.price} coins`;
    }

    syncUi() {
      const visibleModeName = this.isBetaEnabled() ? this.data.selectedMode : 'Classic';
      const mode = GAME_MODES[visibleModeName] || GAME_MODES.Classic;
      this.bestEl.textContent = String(this.data.bestScore || 0);
      this.bankEl.textContent = String(this.data.coins || 0);
      this.runsEl.textContent = String(this.data.totalRuns || 0);
      if (this.powerupLabelEl) this.powerupLabelEl.textContent = this.data.selectedPowerup;
      this.runScoreEl.textContent = `Score: ${this.score}`;
      this.runCoinsEl.textContent = `Coins: ${this.runCoins}`;
      this.runLivesEl.textContent = `Lives: ${this.lives || 1}`;
      if (this.currentModeLabelEl) this.currentModeLabelEl.textContent = visibleModeName;
      if (this.modeObjectiveEl) this.modeObjectiveEl.textContent = mode.objective;
      if (this.tokenCountEl) this.tokenCountEl.textContent = String(this.availableAiTokens());
      if (this.storyProgressLabelEl) this.storyProgressLabelEl.textContent = `${Math.min(this.data.storyProgress, STORY_CHAPTERS.length)} / ${STORY_CHAPTERS.length}`;
      if (this.missionCardEl) this.renderMissionCard();
      this.syncLoadoutButtons();
      this.updateCheatUi();
    }


    ensureDailyProgress() {
      const today = localDayKey();
      const progress = this.data.dailyProgress || {};
      if (progress.dayKey !== today) {
        this.data.dailyProgress = { dayKey: today, runs: 0, pickups: 0, bestScore: 0, usedPowerup: false };
        this.saveData();
      }
      return this.data.dailyProgress;
    }

    currentMissionState() {
      const today = localDayKey();
      const progress = this.ensureDailyProgress();
      this.missionIndex = [...today].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % MISSIONS.length;
      const mission = MISSIONS[this.missionIndex];
      const completed = (
        (this.missionIndex === 0 && progress.runs >= 1) ||
        (this.missionIndex === 1 && progress.pickups >= 3) ||
        (this.missionIndex === 2 && progress.bestScore >= 18) ||
        (this.missionIndex === 3 && progress.usedPowerup && progress.bestScore >= 20)
      );
      const claimed = Boolean(this.data.missionsClaimed?.[today]);
      return { today, mission, completed, claimed };
    }

    renderMissionCard() {
      const { today, mission, completed, claimed } = this.currentMissionState();
      this.missionCardEl.innerHTML = `
        <div class="xy-dodge-mission-card">
          <strong>Daily objective</strong>
          <p>${mission}</p>
          <div class="xy-dodge-control-row">
            <span class="xy-dodge-badge">Reward: 90 coins</span>
            <button class="xy-dodge-button" type="button" id="xyClaimMissionBtn" ${(!completed || claimed) ? 'disabled' : ''}>${claimed ? 'Completed' : completed ? 'Claim reward' : 'In progress'}</button>
          </div>
        </div>
      `;
      this.missionCardEl.querySelector('#xyClaimMissionBtn')?.addEventListener('click', () => {
        if (!completed || claimed) return;
        this.data.coins += 90;
        this.data.missionsClaimed = { ...(this.data.missionsClaimed || {}), [today]: true };
        this.saveData();
        this.syncUi();
        this.flashStatus('Mission reward claimed', 'ok');
      });
    }

    updateCheatUi() {
      const betaEnabled = this.isBetaEnabled();
      if (this.cheatCard) this.cheatCard.hidden = !betaEnabled;
      const cheats = this.activeCheatSet();
      this.cheatInputs.forEach(input => {
        input.disabled = !betaEnabled;
        input.checked = cheats.has(String(input.dataset.cheat || ''));
      });
    }

    flashStatus(text, tone = 'ok') {
      this.statusEl.textContent = text;
      this.statusEl.dataset.tone = tone === 'danger' ? 'danger' : tone === 'warning' ? 'warning' : 'ok';
      clearTimeout(this.statusTimer);
      this.statusTimer = setTimeout(() => {
        this.statusEl.textContent = this.gameOver ? 'Run ended' : this.paused ? 'Paused' : 'Ready';
        this.statusEl.dataset.tone = 'ok';
      }, 1400);
    }

    buySelectedModifier() {
      const modifierName = this.previewModifier;
      const modifier = MODIFIERS[modifierName] || MODIFIERS.Balanced;
      if (this.data.ownedModifiers.includes(modifierName)) {
        this.data.selectedModifier = modifierName;
        this.saveData();
        this.syncUi();
        this.flashStatus(`${modifierName} equipped`, 'ok');
        return;
      }
      if (this.data.coins < modifier.price) {
        this.flashStatus('Not enough coins', 'warning');
        return;
      }
      this.data.coins -= modifier.price;
      this.data.ownedModifiers.push(modifierName);
      this.data.selectedModifier = modifierName;
      this.saveData();
      this.renderTab('loadout');
      this.syncUi();
      this.flashStatus(`${modifierName} unlocked and equipped`, 'ok');
    }

    buySelectedPowerup() {
      const powerupName = this.previewPowerup;
      const powerup = POWERUPS[powerupName] || POWERUPS.None;
      if (powerupName === 'None') {
        this.data.selectedPowerup = 'None';
        this.saveData();
        this.syncUi();
        this.flashStatus('No powerup equipped', 'ok');
        return;
      }
      if (this.data.ownedPowerups.includes(powerupName)) {
        this.data.selectedPowerup = powerupName;
        this.saveData();
        this.syncUi();
        this.flashStatus(`${powerupName} equipped`, 'ok');
        return;
      }
      if (this.data.coins < powerup.price) {
        this.flashStatus('Not enough coins', 'warning');
        return;
      }
      this.data.coins -= powerup.price;
      this.data.ownedPowerups.push(powerupName);
      this.data.selectedPowerup = powerupName;
      this.saveData();
      this.renderTab('loadout');
      this.syncUi();
      this.flashStatus(`${powerupName} unlocked and equipped`, 'ok');
    }

    buyTokenPack(amount, cost) {
      if (!Number.isFinite(amount) || !Number.isFinite(cost) || amount <= 0 || cost <= 0) return;
      if (this.data.coins < cost) {
        this.flashStatus('Not enough coins for tokens', 'warning');
        return;
      }
      this.data.coins -= cost;
      this.data.aiPurchasedTokens += amount;
      this.saveData();
      this.syncUi();
      this.flashStatus(`Purchased ${amount} AI token${amount > 1 ? 's' : ''}`, 'ok');
    }

    start() {
      if (this.running) return;
      this.running = true;
      this.resetState();
      document.addEventListener('keydown', this.handleKeyDown, { capture: true });
      document.addEventListener('keyup', this.handleKeyUp);
      this.lastTs = performance.now();
      this.canvas.focus({ preventScroll: true });
      this.rafId = requestAnimationFrame(this.loop);
    }

    stop() {
      this.running = false;
      cancelAnimationFrame(this.rafId);
      document.removeEventListener('keydown', this.handleKeyDown, { capture: true });
      document.removeEventListener('keyup', this.handleKeyUp);
    }

    destroy() {
      this.stop();
      clearTimeout(this.statusTimer);
      clearTimeout(this.syncTimer);
      window.removeEventListener('resize', this.onResize);
      this.mount.innerHTML = '';
    }

    resetState() {
      const visibleModeName = this.isBetaEnabled() ? this.data.selectedMode : 'Classic';
      const mode = GAME_MODES[visibleModeName] || GAME_MODES.Classic;
      const modifier = MODIFIERS[this.data.selectedModifier] || MODIFIERS.Balanced;
      const ownedSelectedPowerup = this.data.selectedPowerup === 'None' || this.data.ownedPowerups.includes(this.data.selectedPowerup);
      this.modifier = modifier;
      this.mode = !this.isBetaEnabled() ? GAME_MODES.Classic : mode;
      this.powerups = new Set(ownedSelectedPowerup && this.data.selectedPowerup !== 'None' ? [this.data.selectedPowerup] : []);
      this.paused = false;
      this.gameOver = false;
      this.score = 0;
      this.runCoins = 0;
      this.combo = 0;
      this.bestComboRun = 0;
      this.storyPickups = 0;
      this.level = 1;
      this.spawnTimer = 0;
      this.pickupTimer = 0;
      this.dialogueTimer = 0;
      this.blocks = [];
      this.pickups = [];
      this.particles = [];
      this.startTs = performance.now();
      this.lives = this.powerups.has('Shield Matrix') ? 2 : 1;
      this.player = { lane: 2, targetLane: 2, x: 2.5 * (BOARD.width / BOARD.lanes), y: BOARD.height - 76, w: 82, h: 34 };
      this.overlay.hidden = true;
      this.overlay.innerHTML = '';
      this.pauseBtn.textContent = 'Pause';
      this.syncUi();
      this.flashStatus(`${this.mode === GAME_MODES.Classic ? 'Classic' : this.data.selectedMode} run started`, 'ok');
    }

    restart() {
      this.resetState();
    }

    togglePause() {
      if (!this.running || this.gameOver) return;
      this.paused = !this.paused;
      this.pauseBtn.textContent = this.paused ? 'Resume' : 'Pause';
      this.flashStatus(this.paused ? 'Paused' : 'Resumed', this.paused ? 'warning' : 'ok');
    }

    currentSpeed(elapsed) {
      const cheatSlow = this.activeCheatSet().has('slowtime') ? 0.65 : 1;
      const slowdown = this.powerups.has('Block Slowdown') ? 0.74 : 1;
      return clamp((3.4 + elapsed * 0.1 + this.score * 0.016) * this.mode.speed * this.modifier.pressure * cheatSlow * slowdown, 2.8, 18);
    }

    currentSpawnInterval(elapsed) {
      const cheatSlow = this.activeCheatSet().has('slowtime') ? 1.25 : 1;
      const slowdown = this.powerups.has('Block Slowdown') ? 1.28 : 1;
      const modeModifier = this.mode.interval;
      return clamp((1.15 - elapsed * 0.0022 - this.score * 0.0011) * modeModifier * cheatSlow * slowdown, 0.22, 1.6);
    }

    lanePressure() {
      const pressure = Array(BOARD.lanes).fill(0);
      for (const block of this.blocks) {
        const distance = Math.max(20, this.player.y - block.y);
        pressure[block.lane] += 200 / distance;
      }
      return pressure;
    }

    safeLanes() {
      const blocked = new Set();
      for (const block of this.blocks) {
        if (block.y + block.h > this.player.y - 60 && block.y < this.player.y + 20) blocked.add(block.lane);
      }
      return [...Array(BOARD.lanes).keys()].filter(lane => !blocked.has(lane));
    }

    choosePattern() {
      const patterns = [[0], [1], [2], [3], [4], [5], [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [0, 2], [1, 3], [2, 4], [3, 5], [0, 3], [1, 4], [2, 5], [0, 1, 3], [1, 2, 4], [2, 3, 5], [0, 2, 4], [1, 3, 5], [0, 1, 4], [1, 4, 5], [0, 2, 5], [0, 3, 4], [1, 2, 5]];
      const safe = this.safeLanes();
      const pressure = this.lanePressure();
      const currentLane = this.player.targetLane;
      let bestScore = -Infinity;
      let bestPattern = patterns[0];
      for (const pattern of patterns) {
        const futureSafe = [...Array(BOARD.lanes).keys()].filter(lane => !pattern.includes(lane));
        if (!futureSafe.length) continue;
        let score = pattern.length * (0.55 + this.mode.modeScore * 0.2);
        const openPairs = futureSafe.slice().sort((a, b) => a - b).filter((lane, index, arr) => index > 0 && lane === arr[index - 1] + 1).length;
        const predictablePivot = futureSafe.length === 2 && Math.abs(futureSafe[0] - futureSafe[1]) === 1;
        for (const lane of pattern) score += Math.max(0, 2.6 - pressure[lane]) + Math.abs(lane - currentLane) * 0.45;
        if (safe.length && safe.every(lane => pattern.includes(lane))) score -= 40;
        if (predictablePivot) score -= 12;
        score -= openPairs * 4;
        score += Math.abs((this.lastOpenLane ?? currentLane) - futureSafe[0]) * 0.6;
        score += Math.random() * 0.3;
        if (score > bestScore) {
          bestScore = score;
          bestPattern = pattern;
        }
      }
      return bestPattern;
    }

    spawnWave(elapsed) {
      this.level = 1 + Math.floor(this.score / 18);
      const laneWidth = BOARD.width / BOARD.lanes;
      const speed = this.currentSpeed(elapsed);
      const pattern = this.choosePattern();
      pattern.forEach(lane => {
        this.blocks.push({ lane, x: lane * laneWidth + 12, y: -48, w: laneWidth - 24, h: 36, speed, color: lane % 2 ? THEMES.danger : THEMES.accent2 });
      });
      const openLanes = [...Array(BOARD.lanes).keys()].filter(lane => !pattern.includes(lane));
      this.lastOpenLane = openLanes.length ? pick(openLanes) : this.lastOpenLane;
      const pickupChance = clamp(this.mode.pickups + Math.min(0.22, this.level * 0.015), 0.5, 0.96);
      if (openLanes.length && Math.random() < pickupChance) {
        const lane = this.lastOpenLane ?? openLanes[0];
        const size = 12;
        this.pickups.push({ lane, x: lane * laneWidth + laneWidth / 2, y: -30, size, speed, targetX: lane * laneWidth + laneWidth / 2 });
      }
    }

    updatePlayer() {
      const cheats = this.activeCheatSet();
      if (cheats.has('autoplay') || cheats.has('ghost')) {
        const safe = this.safeLanes();
        if (safe.length) {
          const pressure = this.lanePressure();
          this.player.targetLane = safe.reduce((best, lane) => {
            if (pressure[lane] !== pressure[best]) return pressure[lane] < pressure[best] ? lane : best;
            return Math.abs(lane - this.player.targetLane) < Math.abs(best - this.player.targetLane) ? lane : best;
          }, safe[0]);
        }
      }
      while (this.moveQueue.length) {
        const delta = this.moveQueue.shift();
        this.player.targetLane = clamp(this.player.targetLane + delta, 0, BOARD.lanes - 1);
      }
      const laneWidth = BOARD.width / BOARD.lanes;
      const targetX = this.player.targetLane * laneWidth + laneWidth / 2;
      const quickstep = this.powerups.has('Quickstep');
      const lerpSpeed = quickstep ? 1 : 0.17 * this.modifier.playerSpeed;
      this.player.x += (targetX - this.player.x) * lerpSpeed;
    }

    intersectsPlayer(entity) {
      const px1 = this.player.x - this.player.w / 2;
      const px2 = this.player.x + this.player.w / 2;
      const py1 = this.player.y - this.player.h / 2;
      const py2 = this.player.y + this.player.h / 2;
      if ('size' in entity) {
        return entity.x >= px1 && entity.x <= px2 && entity.y >= py1 && entity.y <= py2;
      }
      return !(px2 < entity.x || px1 > entity.x + entity.w || py2 < entity.y || py1 > entity.y + entity.h);
    }

    collectPickup() {
      this.storyPickups += 1;
      this.data.totalPickups += 1;
      const progress = this.ensureDailyProgress();
      progress.pickups += 1;
      if (!this.hasEnabledCheat()) this.runCoins += this.powerups.has('Lucky Drift') ? 3 : 2;
      this.flashStatus('Energy shard collected', 'ok');
    }

    handleCollision() {
      if (this.activeCheatSet().has('nodeath')) {
        this.flashStatus('No Death blocked the hit', 'warning');
        return;
      }
      if (this.lives > 1) {
        this.lives -= 1;
        this.blocks = this.blocks.filter(block => block.y < this.player.y - 70 || block.y > this.player.y + 70);
        this.flashStatus('Shield consumed keep going', 'warning');
        return;
      }
      this.endRun();
    }

    updateBlocks(dt) {
      const alive = [];
      for (const block of this.blocks) {
        block.y += block.speed * dt * 60;
        if (this.intersectsPlayer(block)) {
          this.handleCollision();
          if (this.gameOver) return;
          continue;
        }
        if (block.y > BOARD.height) {
          this.score += Math.max(1, Math.round(this.mode.modeScore));
          if (!this.hasEnabledCheat()) {
            const baseReward = Math.max(1, Math.round(this.modifier.coinBonus * this.mode.modeScore));
            const luckyReward = this.powerups.has('Lucky Drift') ? Math.ceil(baseReward * 1.2) : baseReward;
            this.runCoins += luckyReward;
          }
        } else {
          alive.push(block);
        }
      }
      this.blocks = alive;
    }

    updatePickups(dt) {
      const alive = [];
      for (const pickup of this.pickups) {
        pickup.y += pickup.speed * dt * 60;
        pickup.x += (pickup.targetX - pickup.x) * 0.2;
        if (this.intersectsPlayer(pickup)) {
          this.collectPickup();
          continue;
        }
        if (pickup.y <= BOARD.height + 24) alive.push(pickup);
      }
      this.pickups = alive;
    }

    checkStoryProgress() {
      if (!this.isBetaEnabled() || this.data.selectedMode !== 'Story') return;
      const chapter = this.storyChapter;
      if (!chapter) return;
      const scoreMet = this.score >= (chapter.targetScore || 0);
      const pickupsMet = !chapter.targetPickups || this.storyPickups >= chapter.targetPickups;
      const lifeMet = !chapter.requireLife || this.lives >= 1;
      if (scoreMet && pickupsMet && lifeMet) {
        if (!this.data.storyRewardsClaimed.includes(chapter.id)) {
          this.data.coins += chapter.reward;
          this.data.storyRewardsClaimed.push(chapter.id);
        }
        this.data.storyProgress = Math.min(STORY_CHAPTERS.length, (this.data.storyProgress || 0) + 1);
        this.storyChapter = this.resolveStoryChapter();
        this.flashStatus(`Story chapter cleared: ${chapter.title}`, 'ok');
      }
    }

    endRun() {
      if (this.gameOver) return;
      this.gameOver = true;
      this.data.totalRuns += 1;
      const progress = this.ensureDailyProgress();
      progress.runs += 1;
      progress.bestScore = Math.max(progress.bestScore || 0, this.score);
      progress.usedPowerup = progress.usedPowerup || (this.data.selectedPowerup !== 'None' && this.powerups.size > 0);
      this.data.bestScore = Math.max(this.data.bestScore, this.score);
      this.data.bestByMode[this.data.selectedMode] = Math.max(this.data.bestByMode[this.data.selectedMode] || 0, this.score);
      this.data.longestCombo = Math.max(this.data.longestCombo, this.bestComboRun);
      this.checkStoryProgress();
      this.data.coins += this.hasEnabledCheat() ? 0 : this.runCoins;
      this.saveData();
      this.syncUi();
      this.overlay.hidden = false;
      this.overlay.innerHTML = `
        <div class="xy-dodge-modal-card">
          <h3>Run complete</h3>
          <p>Mode: <strong>${this.mode === GAME_MODES.Classic ? 'Classic' : this.data.selectedMode}</strong></p>
          <p>Score: <strong>${this.score}</strong></p>
          <p>Coins earned: <strong>${this.hasEnabledCheat() ? 0 : this.runCoins}</strong></p>
          <p>Pickups: <strong>${this.storyPickups}</strong></p>
          <button class="xy-dodge-button xy-dodge-button--primary" id="xyOverlayRestartBtn" type="button">Play again</button>
        </div>
      `;
      this.overlay.querySelector('#xyOverlayRestartBtn')?.addEventListener('click', () => this.restart());
    }

    drawRoundedRect(ctx, x, y, w, h, r, fill, stroke) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
      if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }

    draw() {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, BOARD.width, BOARD.height);
      const gradient = ctx.createLinearGradient(0, 0, 0, BOARD.height);
      gradient.addColorStop(0, '#07101f');
      gradient.addColorStop(1, '#02060d');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, BOARD.width, BOARD.height);

      for (let lane = 0; lane <= BOARD.lanes; lane += 1) {
        const x = lane * (BOARD.width / BOARD.lanes);
        ctx.strokeStyle = 'rgba(115, 164, 255, 0.22)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, BOARD.height);
        ctx.stroke();
      }
      for (let y = 40; y < BOARD.height; y += 80) {
        ctx.strokeStyle = 'rgba(115, 164, 255, 0.12)';
        ctx.setLineDash([8, 8]);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(BOARD.width, y);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      this.blocks.forEach(block => {
        this.drawRoundedRect(ctx, block.x - 2, block.y - 2, block.w + 4, block.h + 4, 8, 'rgba(0,0,0,0.3)');
        this.drawRoundedRect(ctx, block.x, block.y, block.w, block.h, 8, 'rgba(255,111,159,0.92)', 'rgba(255,235,244,0.8)');
      });
      this.pickups.forEach(pickup => {
        ctx.beginPath();
        ctx.fillStyle = 'rgba(123,255,186,0.95)';
        ctx.arc(pickup.x, pickup.y, pickup.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(226,255,239,0.9)';
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      const playerX = this.player.x - this.player.w / 2;
      const playerY = this.player.y - this.player.h / 2;
      this.drawRoundedRect(ctx, playerX - 2, playerY - 2, this.player.w + 4, this.player.h + 4, 9, 'rgba(0,0,0,0.38)');
      this.drawRoundedRect(ctx, playerX, playerY, this.player.w, this.player.h, 9, 'rgba(108,229,255,0.95)', 'rgba(233,252,255,0.96)');

      if (this.mode === GAME_MODES.Story && this.isBetaEnabled()) {
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.font = 'bold 18px Inter, system-ui, sans-serif';
        ctx.fillText(this.storyChapter.title, 24, 34);
        ctx.font = '14px Inter, system-ui, sans-serif';
        ctx.fillStyle = 'rgba(191,208,238,0.9)';
        ctx.fillText(this.storyChapter.objectiveLabel, 24, 58);
      }
    }

    loop = timestamp => {
      if (!this.running) return;
      const dt = clamp((timestamp - this.lastTs) / 1000, 0, 0.045);
      this.lastTs = timestamp;
      if (!this.paused && !this.gameOver) {
        const elapsed = (timestamp - this.startTs) / 1000;
        this.spawnTimer += dt;
        if (this.spawnTimer >= this.currentSpawnInterval(elapsed)) {
          this.spawnTimer = 0;
          this.spawnWave(elapsed);
        }
        this.updatePlayer();
        this.updateBlocks(dt);
        this.updatePickups(dt);

      }
      this.draw();
      this.syncUi();
      this.rafId = requestAnimationFrame(this.loop);
    };
  }

  let gameInstance = null;

  function readTokenSummary() {
    const parsed = readStorage();
    const today = localDayKey();
    const usedToday = parsed.aiTokenDate === today ? Math.max(0, Number(parsed.aiTokensUsedToday) || 0) : 0;
    const purchased = Math.max(0, Number(parsed.aiPurchasedTokens) || 0);
    const freeRemaining = Math.max(0, FREE_DAILY_AI_TOKENS - usedToday);
    return { available: freeRemaining + purchased, freeRemaining, purchased };
  }

  function consumeAiToken() {
    const data = readStorage();
    const today = localDayKey();
    if (data.aiTokenDate !== today) {
      data.aiTokenDate = today;
      data.aiTokensUsedToday = 0;
    }
    const purchased = Math.max(0, Number(data.aiPurchasedTokens) || 0);
    const usedToday = Math.max(0, Number(data.aiTokensUsedToday) || 0);
    const freeRemaining = Math.max(0, FREE_DAILY_AI_TOKENS - usedToday);
    if (freeRemaining + purchased <= 0) return false;
    if (freeRemaining > 0) data.aiTokensUsedToday = usedToday + 1;
    else data.aiPurchasedTokens = purchased - 1;
    saveStorage(data);
    return true;
  }

  function ensureGame() {
    const mount = document.querySelector('#xyrexDodgeMount');
    if (!mount) return null;
    if (!gameInstance) gameInstance = new XyrexDodgeGame(mount);
    return gameInstance;
  }

  window.XyrexDodge = {
    start() {
      ensureGame()?.start();
    },
    stop() {
      gameInstance?.stop();
    },
    destroy() {
      gameInstance?.destroy();
      gameInstance = null;
    },
    getTokenSummary() {
      return readTokenSummary();
    },
    consumeAiToken() {
      return consumeAiToken();
    },
  };
})();
