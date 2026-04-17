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
    Balanced: { price: 0, description: 'Standard handling and balanced rewards. Best for learning patterns without drawbacks.', playerSpeed: 1, coinBonus: 1, pressure: 1, waveBonus: 1 },
    Swift: { price: 125, description: 'Increases lane-change speed by 20% so you can correct mistakes faster.', playerSpeed: 1.2, coinBonus: 1, pressure: 1.08, waveBonus: 1 },
    Fortune: { price: 180, description: 'Raises coin income by 35%, but wave pressure rises slightly during longer runs.', playerSpeed: 1, coinBonus: 1.35, pressure: 1.14, waveBonus: 1.08 },
    Bulwark: { price: 220, description: 'Reduces incoming pressure for safer runs, but your ship changes lanes more slowly.', playerSpeed: 0.9, coinBonus: 0.92, pressure: 0.92, waveBonus: 0.95 },
    Chaos: { price: 260, description: 'Greatly boosts score and coin potential, but hazard speed and density ramp up harder.', playerSpeed: 1.1, coinBonus: 1.6, pressure: 1.3, waveBonus: 1.2 },
  };

  const POWERUPS = {
    None: { price: 0, description: 'No active powerup is equipped for this run.' },
    Quickstep: { price: 200, description: 'Your ship snaps directly into the next lane instead of sliding across it.' },
    'Shield Matrix': { price: 280, description: 'Each run starts with one extra life, letting you survive one additional collision.' },
    'Lucky Drift': { price: 190, description: 'Raises coin rewards earned during the run by 20%.' },
    'Time Bloom': { price: 320, description: 'Every 12 combo steps slightly slows active hazards for a short recovery window.' },
    'Magnet Pulse': { price: 240, description: 'Nearby energy shards drift toward your lane, making pickups easier to secure.' },
  };

  const VISUAL_THEMES = {
    Neon: { price: 0, description: 'Default high-contrast palette tuned for clarity.', accent: '#6ce5ff', accent2: '#8d84ff', danger: '#ff6f9f', track: '#10213d' },
    Amethyst: { price: 180, description: 'Purple-forward palette with softer hazard contrast.', accent: '#c6a1ff', accent2: '#866dff', danger: '#ff92ce', track: '#1a1238' },
    Obsidian: { price: 220, description: 'Dark tactical palette with crisp cyan lanes.', accent: '#7ae7ff', accent2: '#8da8ff', danger: '#ff7f8f', track: '#0d151f' },
    Synthwave: { price: 260, description: 'High-energy neon blend with vivid lane and pickup glow.', accent: '#ff7cd2', accent2: '#8c7bff', danger: '#ff5f86', track: '#24143f' }
  };

  const GAME_MODES = {
    Classic: {
      description: 'Steady survival mode with predictable scaling and no special rule changes.',
      speed: 1,
      interval: 1,
      pickups: 0.45,
      objective: 'Survive as long as possible and earn coins from clean dodges.',
      modeScore: 1,
    },
    Blitz: {
      description: 'A faster ruleset with denser patterns, shorter gaps, and higher score payout.',
      speed: 1.22,
      interval: 0.78,
      pickups: 0.35,
      objective: 'Chase short, high-pressure runs where fast reactions matter most.',
      modeScore: 1.35,
    },
    Gauntlet: {
      description: 'Extended runs with harder formations that spike reward value as you stabilize.',
      speed: 1.08,
      interval: 0.92,
      pickups: 0.5,
      objective: 'Survive elite waves and maintain long combo chains.',
      modeScore: 1.5,
    },
    Harvest: {
      description: 'A lower-pressure route with more shard spawns and better farming potential.',
      speed: 0.95,
      interval: 1.08,
      pickups: 0.82,
      objective: 'Collect extra shards, farm coins, and keep your combo active.',
      modeScore: 0.95,
    },
    Story: {
      description: 'Play through objective-based sectors with fixed goals and campaign rewards.',
      speed: 1,
      interval: 1,
      pickups: 0.55,
      objective: 'Complete each sector objective to finish the campaign path.',
      modeScore: 1.15,
    },
  };

  const STORY_CHAPTERS = [
    {
      id: 'sector-01',
      title: 'Sector One: Wake Protocol',
      briefing: 'The arena core is unstable. Survive long enough to restore the first lane beacon.',
      objectiveLabel: 'Reach 25 score and collect 4 shards.',
      targetScore: 25,
      targetPickups: 4,
      reward: 120,
    },
    {
      id: 'sector-02',
      title: 'Sector Two: Crosswind Array',
      briefing: 'Cross-lane turbulence is corrupting the route planner. Maintain a clean combo under pressure.',
      objectiveLabel: 'Reach 40 score and keep a combo streak of 10.',
      targetScore: 40,
      targetCombo: 10,
      reward: 180,
    },
    {
      id: 'sector-03',
      title: 'Sector Three: Final Echo',
      briefing: 'The final echo wall is closing. Finish the run with a high-score burst and a preserved shield.',
      objectiveLabel: 'Reach 60 score and finish with at least 1 life.',
      targetScore: 60,
      requireLife: true,
      reward: 260,
    },
  ];

  const DAILY_OBJECTIVES = [
    { id: 'daily-run', title: 'Finish 1 run', description: 'Complete a full run in any mode.', reward: 90, type: 'run' },
    { id: 'daily-shards', title: 'Collect 3 shards', description: 'Collect at least 3 energy shards in a single run.', reward: 90, type: 'pickups', target: 3 },
    { id: 'daily-coins', title: 'Earn 25 coins', description: 'Finish one run with at least 25 coins earned.', reward: 90, type: 'coins', target: 25 },
    { id: 'daily-powerup', title: 'Score 20 with a powerup', description: 'Finish a run at 20 score or higher while an owned powerup is equipped.', reward: 90, type: 'powerupScore', target: 20 },
  ];

  const DEFAULT_DATA = {
    coins: 0,
    bestScore: 0,
    bestByMode: {},
    totalRuns: 0,
    totalPickups: 0,
    longestCombo: 0,
    dailyObjective: null,
    ownedModifiers: ['Balanced'],
    selectedModifier: 'Balanced',
    ownedPowerups: [],
    selectedPowerup: 'None',
    ownedVisualThemes: ['Neon'],
    selectedVisualTheme: 'Neon',
    selectedMode: 'Classic',
    storyProgress: 0,
    storyRewardsClaimed: [],
    aiTokenDate: '',
    aiTokensUsedToday: 0,
    aiPurchasedTokens: 0,
    activeCheats: [],
    betaDismissed: false,
    dailyStreak: 0,
    lastDailyClaimDate: '',
  };

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const withAlpha = (hexColor, alpha, fallback) => {
    const normalized = String(hexColor || '').trim();
    if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(normalized)) {
      const value = normalized.length === 4
        ? `#${normalized[1]}${normalized[1]}${normalized[2]}${normalized[2]}${normalized[3]}${normalized[3]}`
        : normalized;
      const r = parseInt(value.slice(1, 3), 16);
      const g = parseInt(value.slice(3, 5), 16);
      const b = parseInt(value.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    return fallback;
  };
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
      .xy-dodge-shell[data-beta='false'] .xy-dodge-panel--overview { display: none; }
      .xy-dodge-hero, .xy-dodge-panel, .xy-dodge-board, .xy-dodge-modal-card {
        background: linear-gradient(180deg, ${THEMES.panelAlt}, ${THEMES.panel}); border: 1px solid ${THEMES.border};
        border-radius: 18px; box-shadow: ${THEMES.cardShadow};
      }
      .xy-dodge-hero { display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(240px, 0.85fr); gap: 12px; padding: 14px; }
      .xy-dodge-heading { display: grid; gap: 8px; align-content: start; }
      .xy-dodge-kicker { display: inline-flex; width: fit-content; padding: 5px 10px; border-radius: 999px; background: rgba(108,229,255,0.12); color: ${THEMES.accent}; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
      .xy-dodge-heading h2 { margin: 0; font-size: clamp(24px, 3vw, 34px); }
      .xy-dodge-heading p, .xy-dodge-panel p { margin: 0; color: ${THEMES.subtext}; line-height: 1.45; font-size: 13px; }
      .xy-dodge-stat-grid, .xy-dodge-quick-grid, .xy-dodge-mode-grid, .xy-dodge-shop-grid, .xy-dodge-meta-grid { display: grid; gap: 10px; }
      .xy-dodge-stat-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
      .xy-dodge-chip, .xy-dodge-mode-card, .xy-dodge-mini-card, .xy-dodge-story-card, .xy-dodge-mission-card, .xy-dodge-loadout-option {
        background: ${withAlpha(THEMES.panelAlt, 0.7, 'rgba(255,255,255,0.04)')}; border: 1px solid ${withAlpha(THEMES.accent2, 0.24, 'rgba(255,255,255,0.08)')}; border-radius: 14px; padding: 10px 12px;
      }
      .xy-dodge-chip span, .xy-dodge-mini-card span { display:block; font-size:11px; color:${THEMES.subtext}; text-transform:uppercase; letter-spacing:.04em; }
      .xy-dodge-chip strong, .xy-dodge-mode-card strong, .xy-dodge-mini-card strong { display: block; font-size: 17px; margin-top: 4px; }
      .xy-dodge-layout { display: grid; grid-template-columns: minmax(0, 1.6fr) minmax(260px, 0.78fr); gap: 12px; align-items: start; }
      .xy-dodge-board { padding: 12px; display: grid; gap: 10px; }
      .xy-dodge-toolbar, .xy-dodge-control-row, .xy-dodge-mobile-controls, .xy-dodge-segmented { display: flex; flex-wrap: wrap; gap: 8px; }
      .xy-dodge-control-row { align-items: center; }
      .xy-dodge-toolbar { justify-content: space-between; align-items: center; }
      .xy-dodge-badges { display: flex; flex-wrap: wrap; gap: 6px; }
      .xy-dodge-badge { padding: 6px 10px; border-radius: 999px; background: ${withAlpha(THEMES.accent2, 0.18, 'rgba(141,132,255,0.12)')}; color: ${THEMES.text}; font-size: 12px; display:inline-flex; align-items:center; justify-content:center; text-align:center; min-height:30px; line-height:1.2; }
      .xy-dodge-canvas-wrap { position: relative; background: radial-gradient(circle at top, ${withAlpha(THEMES.accent, 0.16, 'rgba(108,229,255,0.08)')}, transparent 40%), ${THEMES.track}; border-radius: 16px; overflow: hidden; min-height: 250px; }
      .xy-dodge-canvas { display: block; width: 100%; height: auto; aspect-ratio: 960 / 620; border-radius: 16px; }
      .xy-dodge-overlay { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; padding: 16px; background: rgba(2, 7, 17, 0.64); backdrop-filter: blur(6px); }
      .xy-dodge-overlay[hidden] { display: none; }
      .xy-dodge-modal-card { max-width: 500px; width: min(100%, 500px); padding: 20px; }
      .xy-dodge-side { display: grid; gap: 12px; }
      .xy-dodge-panel { padding: 12px; display: grid; gap: 10px; }
      .xy-dodge-panel h3, .xy-dodge-panel h4 { margin: 0; font-size: 16px; }
      .xy-dodge-button, .xy-dodge-select, .xy-dodge-mobile-controls button {
        border: 1px solid ${withAlpha(THEMES.accent2, 0.3, 'rgba(154, 205, 255, 0.24)')}; border-radius: 12px; background: linear-gradient(180deg, ${withAlpha(THEMES.panelAlt, 0.94, 'rgba(16, 31, 58, 0.96)')}, ${withAlpha(THEMES.panel, 0.95, 'rgba(10, 20, 40, 0.96)')}); color: ${THEMES.text};
        min-height: 42px; padding: 10px 12px; transition: transform 0.16s ease, background 0.16s ease, border-color 0.16s ease, box-shadow 0.2s ease; box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);
      }
      .xy-dodge-select { appearance: none; -webkit-appearance: none; background-image: linear-gradient(180deg, ${withAlpha(THEMES.panelAlt, 0.95, 'rgba(16, 31, 58, 0.98)')}, ${withAlpha(THEMES.panel, 0.96, 'rgba(10, 20, 40, 0.98)')}), linear-gradient(45deg, transparent 50%, ${THEMES.subtext} 50%), linear-gradient(135deg, ${THEMES.subtext} 50%, transparent 50%); background-repeat: no-repeat; background-position: 0 0, calc(100% - 18px) 50%, calc(100% - 12px) 50%; background-size: 100% 100%, 6px 6px, 6px 6px; padding-right: 34px; }
      .xy-dodge-button:hover, .xy-dodge-mobile-controls button:hover { transform: translateY(-1px); background: linear-gradient(180deg, ${withAlpha(THEMES.panelAlt, 0.98, 'rgba(20, 39, 72, 0.98)')}, ${withAlpha(THEMES.panel, 0.98, 'rgba(12, 24, 45, 0.98)')}); border-color:${withAlpha(THEMES.accent2, 0.5, 'rgba(178,188,255,0.42)')}; }
      .xy-dodge-button--primary { background: linear-gradient(135deg, ${withAlpha(THEMES.accent, 0.24, 'rgba(108,229,255,0.22)')}, ${withAlpha(THEMES.accent2, 0.2, 'rgba(141,132,255,0.18)')}); border-color: ${withAlpha(THEMES.accent, 0.35, 'rgba(108,229,255,0.28)')}; }
      .xy-dodge-button--danger { background: rgba(255,111,159,0.16); }
      .xy-dodge-button[disabled], .xy-dodge-select[disabled] { opacity: 0.55; cursor: not-allowed; transform: none; }
      .xy-dodge-mode-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .xy-dodge-quick-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .xy-dodge-mode-card[data-active='true'], .xy-dodge-segmented button[data-active='true'] { border-color: ${withAlpha(THEMES.accent, 0.56, 'rgba(108,229,255,0.5)')}; box-shadow: inset 0 0 0 1px ${withAlpha(THEMES.accent, 0.28, 'rgba(108,229,255,0.22)')}, 0 0 22px ${withAlpha(THEMES.accent, 0.14, 'rgba(108,229,255,0.08)')}; }
      .xy-dodge-story-card[data-locked='true'] { opacity: 0.65; }
      .xy-dodge-progress { height: 8px; border-radius: 999px; background: rgba(255,255,255,0.08); overflow: hidden; }
      .xy-dodge-progress > span { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, ${THEMES.accent}, ${THEMES.accent2}); transition: width .25s ease; }
      .xy-dodge-mini-card small, .xy-dodge-panel small { color: ${THEMES.subtext}; font-size: 12px; }
      .xy-dodge-note { color: ${THEMES.subtext}; font-size: 12px; }
      .xy-dodge-mobile-controls { justify-content: center; }
      .xy-dodge-mobile-controls[data-visible='true'] { display: flex; }
      .xy-dodge-mobile-controls[hidden] { display: none; }
      .xy-dodge-mobile-controls button { flex: 1; min-width: 120px; font-size: 18px; }
      .xy-dodge-toast { padding: 8px 12px; border-radius: 12px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); font-size: 13px; }
      .xy-dodge-toast[data-tone='warning'] { background: rgba(255, 209, 102, 0.13); }
      .xy-dodge-toast[data-tone='danger'] { background: rgba(255, 111, 159, 0.18); }
      .xy-dodge-toast[data-tone='ok'] { animation: xyPulse 0.35s ease; }
      .xy-dodge-segmented { background: ${withAlpha(THEMES.panelAlt, 0.62, 'rgba(255,255,255,0.04)')}; border-radius: 14px; padding: 4px; border:1px solid ${withAlpha(THEMES.accent2, 0.28, 'rgba(178,188,255,0.22)')}; }
      .xy-dodge-segmented button { flex: 1; min-width: 88px; }
      .xy-dodge-compact-grid { display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap:10px; }
      .xy-dodge-loadout-grid { display: grid; gap: 10px; }
      .xy-dodge-loadout-option { text-align: left; width: 100%; cursor: pointer; transition: border-color 0.16s ease, transform 0.16s ease, box-shadow 0.16s ease; }
      .xy-dodge-loadout-option:hover { transform: translateY(-1px); border-color: ${withAlpha(THEMES.accent, 0.48, 'rgba(108,229,255,0.4)')}; }
      .xy-dodge-loadout-option[data-active='true'] { border-color: ${withAlpha(THEMES.accent, 0.58, 'rgba(108,229,255,0.52)')}; box-shadow: inset 0 0 0 1px ${withAlpha(THEMES.accent, 0.26, 'rgba(108,229,255,0.24)')}, 0 0 18px ${withAlpha(THEMES.accent, 0.12, 'rgba(108,229,255,0.08)')}; }
      .xy-dodge-loadout-option h5 { margin: 0; font-size: 14px; }
      .xy-dodge-loadout-option p { margin: 6px 0; }
      .xy-dodge-effect-list { margin: 0; padding-left: 18px; color: ${THEMES.subtext}; display: grid; gap: 4px; font-size: 12px; }
      .xy-dodge-effect-list li::marker { color: ${THEMES.accent}; }
      .xy-dodge-utility-label { display: flex; align-items: center; gap: 8px; color: ${THEMES.text}; font-size: 13px; }
      .xy-dodge-utility-label input[type='checkbox'] { appearance:none; -webkit-appearance:none; width:16px; height:16px; margin:0; border:1px solid ${withAlpha(THEMES.accent2, 0.62, 'rgba(178,188,255,.7)')}; border-radius:4px; background:${withAlpha(THEMES.panelAlt, 0.92, 'rgba(21,30,62,.96)')}; box-shadow:inset 0 0 0 1px ${withAlpha(THEMES.accent, 0.22, 'rgba(129,146,255,.18)')}; cursor:pointer; position:relative; flex:0 0 auto; }
      .xy-dodge-utility-label input[type='checkbox']:checked { background:${THEMES.accent2}; border-color:${THEMES.accent}; }
      .xy-dodge-utility-label input[type='checkbox']:checked::after { content:''; position:absolute; left:5px; top:1px; width:4px; height:8px; border:solid ${withAlpha(THEMES.bg, 0.9, '#0b1024')}; border-width:0 2px 2px 0; transform:rotate(45deg); }
      .xy-dodge-claim-button-wrap { display:flex; gap:8px; flex-wrap:wrap; }
      @keyframes xyPulse { 0% { transform: scale(.98); } 100% { transform: scale(1); } }
      @media (max-width: 1120px) { .xy-dodge-layout, .xy-dodge-hero { grid-template-columns: 1fr; } .xy-dodge-stat-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
      @media (max-width: 720px) {
        .xy-dodge-toolbar { flex-direction: column; align-items: stretch; }
        .xy-dodge-control-row { width: 100%; flex-wrap: nowrap; }
        .xy-dodge-control-row > * { flex: 1; }
        .xy-dodge-mode-grid, .xy-dodge-stat-grid, .xy-dodge-compact-grid, .xy-dodge-quick-grid { grid-template-columns: 1fr; }
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
      this.dailyObjective = null;
      this.spawnTimer = 0;
      this.pickupTimer = 0;
      this.particles = [];
      this.blocks = [];
      this.pickups = [];
      this.dialogueTimer = 0;
      this.storyChapter = this.resolveStoryChapter();
      this.lastUiSyncAt = 0;
      this.uiStateCache = {};
      this.lastMissionSignature = '';
      this.updateThemeColors();
      this.ensureTokenState();
      this.ensureDailyObjectiveState();
      injectStyles();
      this.buildUi();
      this.attachGlobalListeners();
      this.hydrateRemoteProgress();
    }

    updateThemeColors() {
      const css = getComputedStyle(document.documentElement);
      const read = (name, fallback) => (css.getPropertyValue(name).trim() || fallback);
      THEMES.bg = read('--bg', THEMES.bg);
      THEMES.panel = read('--panel', THEMES.panel);
      THEMES.panelAlt = read('--panel-2', THEMES.panelAlt);
      THEMES.border = withAlpha(read('--periwinkle-2', THEMES.accent2), 0.28, THEMES.border);
      THEMES.accent = read('--periwinkle', THEMES.accent);
      THEMES.accent2 = read('--periwinkle-2', THEMES.accent2);
      THEMES.accent3 = read('--accent-success', THEMES.accent3);
      THEMES.warning = read('--accent-warning', THEMES.warning);
      THEMES.text = read('--text', THEMES.text);
      THEMES.subtext = read('--muted', THEMES.subtext);
      THEMES.track = read('--bg-2', THEMES.track);
      THEMES.cardShadow = `0 20px 52px ${withAlpha(read('--periwinkle', THEMES.accent), 0.22, 'rgba(0,0,0,0.36)')}`;
      const visualProfile = VISUAL_THEMES[this.data.selectedVisualTheme] || VISUAL_THEMES.Neon;
      THEMES.accent = visualProfile.accent;
      THEMES.accent2 = visualProfile.accent2;
      THEMES.danger = visualProfile.danger;
      THEMES.track = visualProfile.track;
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
        ownedVisualThemes: Array.isArray(loaded.ownedVisualThemes) && loaded.ownedVisualThemes.length ? loaded.ownedVisualThemes.filter(item => VISUAL_THEMES[item]) : ['Neon'],
        selectedVisualTheme: VISUAL_THEMES[loaded.selectedVisualTheme] ? loaded.selectedVisualTheme : 'Neon',
        selectedMode: GAME_MODES[loaded.selectedMode] ? loaded.selectedMode : 'Classic',
        dailyObjective: loaded.dailyObjective && typeof loaded.dailyObjective === 'object' ? loaded.dailyObjective : null,
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
          ownedVisualThemes: Array.isArray(remote.ownedVisualThemes) && remote.ownedVisualThemes.length ? remote.ownedVisualThemes.filter(item => VISUAL_THEMES[item]) : this.data.ownedVisualThemes,
          selectedVisualTheme: VISUAL_THEMES[remote.selectedVisualTheme] ? remote.selectedVisualTheme : this.data.selectedVisualTheme,
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
    isTouchDevice() {
      const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
      const noHover = window.matchMedia('(hover: none)').matches;
      const touchPoints = (navigator.maxTouchPoints || 0) > 0;
      const mobileAgent = /android|iphone|ipad|ipod|tablet/i.test(navigator.userAgent || '');
      return coarsePointer && noHover && touchPoints && mobileAgent;
    }


    activeCheatSet() {
      return new Set((this.data.activeCheats || []).map(item => String(item).toLowerCase()).filter(Boolean));
    }

    hasEnabledCheat() {
      return this.activeCheatSet().size > 0;
    }

    dailyObjectiveForDate(dayKey = localDayKey()) {
      let hash = 0;
      for (const char of dayKey) hash = ((hash * 31) + char.charCodeAt(0)) >>> 0;
      return DAILY_OBJECTIVES[hash % DAILY_OBJECTIVES.length];
    }

    ensureDailyObjectiveState() {
      const dayKey = localDayKey();
      const objective = this.dailyObjectiveForDate(dayKey);
      const stored = this.data.dailyObjective;
      const needsReset = !stored || stored.date !== dayKey || stored.objectiveId !== objective.id;
      if (needsReset) {
        this.data.dailyObjective = {
          date: dayKey,
          objectiveId: objective.id,
          completed: false,
          rewardClaimed: false,
        };
        this.saveData();
      }
      this.dailyObjective = { ...this.data.dailyObjective, meta: objective };
      return this.dailyObjective;
    }

    completeDailyObjective() {
      const state = this.ensureDailyObjectiveState();
      if (state.completed) return false;
      state.completed = true;
      this.data.dailyObjective = {
        date: state.date,
        objectiveId: state.objectiveId,
        completed: true,
        rewardClaimed: Boolean(state.rewardClaimed),
      };
      this.dailyObjective = { ...this.data.dailyObjective, meta: state.meta };
      this.saveData();
      this.syncUi();
      this.flashStatus(`Daily objective completed: ${state.meta.title}.`, 'ok');
      return true;
    }

    claimDailyObjective() {
      const state = this.ensureDailyObjectiveState();
      if (!state.completed) {
        this.flashStatus('Finish the objective before claiming the reward.', 'warning');
        return false;
      }
      if (state.rewardClaimed) {
        this.flashStatus('Today’s reward has already been claimed.', 'warning');
        return false;
      }
      this.data.coins += state.meta.reward;
      const previousClaimDate = this.data.lastDailyClaimDate || '';
      const oneDayMs = 24 * 60 * 60 * 1000;
      const isConsecutive = previousClaimDate && (new Date(state.date).getTime() - new Date(previousClaimDate).getTime()) === oneDayMs;
      this.data.dailyStreak = isConsecutive ? (this.data.dailyStreak || 0) + 1 : 1;
      this.data.lastDailyClaimDate = state.date;
      const streakBonus = this.data.dailyStreak > 1 ? Math.min(80, this.data.dailyStreak * 10) : 0;
      if (streakBonus > 0) this.data.coins += streakBonus;
      if (this.data.dailyStreak % 3 === 0) this.data.aiPurchasedTokens += 1;
      this.data.dailyObjective = {
        date: state.date,
        objectiveId: state.objectiveId,
        completed: true,
        rewardClaimed: true,
      };
      this.dailyObjective = { ...this.data.dailyObjective, meta: state.meta };
      this.saveData();
      this.syncUi();
      this.flashStatus(`Daily reward claimed. Streak: ${this.data.dailyStreak}.`, 'ok');
      return true;
    }

    evaluateDailyObjective(runSummary = {}) {
      const state = this.ensureDailyObjectiveState();
      if (state.completed) return;
      const { type, target = 0 } = state.meta;
      const hasOwnedPowerup = this.data.selectedPowerup !== 'None' && this.data.ownedPowerups.includes(this.data.selectedPowerup);
      const completed = (
        (type === 'run' && Boolean(runSummary.finishedRun)) ||
        (type === 'pickups' && (runSummary.pickups || 0) >= target) ||
        (type === 'coins' && (runSummary.runCoins || 0) >= target) ||
        (type === 'powerupScore' && hasOwnedPowerup && (runSummary.score || 0) >= target)
      );
      if (completed) this.completeDailyObjective();
    }

    performLaneMove(direction) {
      if (!this.player) return;
      if (direction === 'left') this.player.targetLane = Math.max(0, this.player.targetLane - 1);
      if (direction === 'right') this.player.targetLane = Math.min(BOARD.lanes - 1, this.player.targetLane + 1);
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
              <p class="xy-dodge-hero-copy">The beta overhaul is now tighter and easier to read, with compact tabs, animations, and progression features that stay gated behind Beta Features.</p>
              <div class="xy-dodge-stat-grid">
                <div class="xy-dodge-chip"><span>Coins</span><strong id="xyBank">0</strong></div>
                <div class="xy-dodge-chip"><span>Best</span><strong id="xyBest">0</strong></div>
                <div class="xy-dodge-chip"><span>Runs</span><strong id="xyRuns">0</strong></div>
                <div class="xy-dodge-chip"><span>Combo</span><strong id="xyComboBest">0</strong></div>
                <div class="xy-dodge-chip"><span>Streak</span><strong id="xyDailyStreak">0</strong></div>
              </div>
            </div>
            <div class="xy-dodge-panel xy-dodge-panel--overview">
              <div class="xy-dodge-meta-grid">
                <div class="xy-dodge-mini-card"><span>Mode</span><strong id="xyCurrentModeLabel">${visibleMode}</strong><small id="xyModeObjective">Survive and score.</small></div>
                <div class="xy-dodge-mini-card"><span>AI Tokens</span><strong id="xyTokenCount">0</strong><small>Daily + purchased.</small></div>
                <div class="xy-dodge-mini-card"><span>Story</span><strong id="xyStoryProgressLabel">0 / ${STORY_CHAPTERS.length}</strong><small>Sector progress.</small></div>
                <div class="xy-dodge-mini-card"><span>Theme</span><strong id="xyVisualThemeLabel">Neon</strong><small>Unlockable visuals.</small></div>
              </div>
              <div id="xyBetaNotice" class="xy-dodge-toast" data-tone="warning" ${betaEnabled ? 'hidden' : ''}>Beta Features are disabled. Enable them in Settings to unlock Story mode, additional game modes, missions, and the new responsive interface.</div>
            </div>
          </section>

          <section class="xy-dodge-layout">
            <section class="xy-dodge-board">
              <div class="xy-dodge-toolbar">
                <div class="xy-dodge-badges">
                  <span class="xy-dodge-badge" id="xyRunScore">Score: 0</span>
                  <span class="xy-dodge-badge" id="xyRunCoins">Coins: 0</span>
                  <span class="xy-dodge-badge" id="xyRunCombo">Combo: 0</span>
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
                <small>${betaEnabled ? 'Compact beta layout enabled. Tabs, animations, and advanced progression are active.' : 'Beta Features are disabled, so Dodge stays on the compact classic layout with only progression boosts.'}</small>
              </section>
              <section class="xy-dodge-panel xy-dodge-panel--mission">
                <h3>Daily objective</h3>
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
                <label class="xy-dodge-utility-label"><input type="checkbox" data-cheat="autoplay" /> Auto Play</label>
                <label class="xy-dodge-utility-label"><input type="checkbox" data-cheat="nodeath" /> No Death</label>
                <label class="xy-dodge-utility-label"><input type="checkbox" data-cheat="slowtime" /> Slow Time</label>
                <label class="xy-dodge-utility-label"><input type="checkbox" data-cheat="ghost" /> Ghost Trail</label>
                <small>Coins are disabled while utilities are active.</small>
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
      this.comboBestEl = this.mount.querySelector('#xyComboBest');
      this.dailyStreakEl = this.mount.querySelector('#xyDailyStreak');
      this.runScoreEl = this.mount.querySelector('#xyRunScore');
      this.runCoinsEl = this.mount.querySelector('#xyRunCoins');
      this.runComboEl = this.mount.querySelector('#xyRunCombo');
      this.runLivesEl = this.mount.querySelector('#xyRunLives');
      this.currentModeLabelEl = this.mount.querySelector('#xyCurrentModeLabel');
      this.modeObjectiveEl = this.mount.querySelector('#xyModeObjective');
      this.tokenCountEl = this.mount.querySelector('#xyTokenCount');
      this.storyProgressLabelEl = this.mount.querySelector('#xyStoryProgressLabel');
      this.visualThemeLabelEl = this.mount.querySelector('#xyVisualThemeLabel');
      this.mobileControls = this.mount.querySelector('#xyMobileControls');
      this.missionCardEl = this.mount.querySelector('#xyMissionCard');
      this.cheatCard = this.mount.querySelector('#xyCheatCard');
      this.cheatInputs = Array.from(this.mount.querySelectorAll('[data-cheat]'));
      this.modifierSelect = this.mount.querySelector('#xyModifierSelect');
      this.powerupSelect = this.mount.querySelector('#xyPowerupSelect');
      this.buyModifierBtn = this.mount.querySelector('#xyBuyModifierBtn');
      this.buyPowerupBtn = this.mount.querySelector('#xyBuyPowerupBtn');

      if (this.tabContent) this.renderTab('modes');
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
      this.mount.addEventListener('click', event => {
        const claimButton = event.target?.closest?.('#xyClaimMissionBtn');
        if (claimButton) this.claimDailyObjective();
      });
      this.mobileControls.querySelectorAll('[data-mobile-move]').forEach(button => {
        const onPress = event => {
          event.preventDefault();
          const move = button.getAttribute('data-mobile-move');
          this.performLaneMove(move);
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
          event.preventDefault();
          if (event.repeat) return;
          this.performLaneMove('left');
        }
        if ((key === 'arrowright' || key === 'd') && !formTarget) {
          event.preventDefault();
          if (event.repeat) return;
          this.performLaneMove('right');
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

    attachGlobalListeners() {
      this.keys = { left: false, right: false };
      this.onResize = () => this.applyResponsiveState();
      window.addEventListener('resize', this.onResize);
      window.XyrexAccountScope?.onAccountChange?.(() => {
        this.data = this.loadData();
        this.storyChapter = this.resolveStoryChapter();
        this.ensureTokenState();
        this.ensureDailyObjectiveState();
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
          <button class="xy-dodge-mode-card xy-dodge-button" type="button" data-mode="${name}" data-active="${(betaEnabled ? this.data.selectedMode : 'Classic') === name}">
            <strong>${name}</strong>
            <p>${config.description}</p>
            <small>${config.objective}</small>
          </button>
        `).join('');
      const selected = GAME_MODES[betaEnabled ? this.data.selectedMode : 'Classic'] || GAME_MODES.Classic;
      return `<div class="xy-dodge-panel"><p>${betaEnabled ? 'Switching modes instantly restarts the current run so the rules always stay accurate.' : 'Classic layout keeps only Classic mode active until Beta Features are enabled in Settings.'}</p></div><div class="xy-dodge-mode-grid">${cards}</div><div class="xy-dodge-panel"><strong>Current mode effect</strong><p>${selected.description}</p><small>${selected.objective}</small></div>`;
    }

    renderProgressionTab() {
      const storyProgress = this.data.storyProgress || 0;
      const storyCards = STORY_CHAPTERS.map((chapter, index) => {
        const locked = !this.isBetaEnabled() || index > storyProgress;
        const completed = index < storyProgress || this.data.storyRewardsClaimed.includes(chapter.id);
        return `
          <div class="xy-dodge-story-card" data-locked="${locked}">
            <strong>${chapter.title}</strong>
            <p>${chapter.briefing}</p>
            <small>${chapter.objectiveLabel}</small>
            <div class="xy-dodge-control-row">
              <span class="xy-dodge-badge">Reward: ${chapter.reward} coins</span>
              <span class="xy-dodge-badge">${completed ? 'Completed' : locked ? 'Locked' : 'Available'}</span>
            </div>
          </div>
        `;
      }).join('');
      return `
        <div class="xy-dodge-panel" style="padding:0; background:none; border:none; box-shadow:none;">
          <div class="xy-dodge-story-card">
            <strong>Progress overview</strong>
            <p>${this.isBetaEnabled() ? this.storyChapter.briefing : 'Classic mode keeps your score, runs, and unlocks active while advanced progression stays disabled.'}</p>
            <div class="xy-dodge-progress"><span style="width:${((storyProgress) / STORY_CHAPTERS.length) * 100}%"></span></div>
          </div>
          ${storyCards}
          <div class="xy-dodge-story-card">
            <strong>Long-term progression</strong>
            <p>Your best score is <strong>${this.data.bestScore || 0}</strong>, total runs are <strong>${this.data.totalRuns || 0}</strong>, and your best combo is <strong>${this.data.longestCombo || 0}</strong>.</p>
            <small>${this.isBetaEnabled() ? 'Story sectors unlock in order and reward coins once.' : 'Enable Beta Features to unlock multi-mode progression and story sectors.'}</small>
          </div>
        </div>
      `;
    }

    describeModifierEffects(modifier) {
      return [
        `Lane speed: ${modifier.playerSpeed > 1 ? '+' : modifier.playerSpeed < 1 ? '-' : '±'}${Math.round(Math.abs(modifier.playerSpeed - 1) * 100)}%`,
        `Coin gain: ${modifier.coinBonus > 1 ? '+' : modifier.coinBonus < 1 ? '-' : '±'}${Math.round(Math.abs(modifier.coinBonus - 1) * 100)}%`,
        `Hazard pressure: ${modifier.pressure > 1 ? '+' : modifier.pressure < 1 ? '-' : '±'}${Math.round(Math.abs(modifier.pressure - 1) * 100)}%`,
      ];
    }

    describePowerupEffects(name) {
      const effects = {
        None: ['No extra effect applied.'],
        Quickstep: ['Lane changes snap instantly with no slide delay.'],
        'Shield Matrix': ['Start each run with one extra life.'],
        'Lucky Drift': ['Run coin rewards gain a 20% bonus.'],
        'Time Bloom': ['Every 12 combo steps slightly slows active hazards.'],
        'Magnet Pulse': ['Nearby energy shards pull toward your lane.'],
      };
      return effects[name] || ['Effect data unavailable.'];
    }

    renderLoadoutOptionList(type, options, selectedName, ownedItems) {
      return `<div class="xy-dodge-loadout-grid">${Object.entries(options).map(([name, item]) => {
        const owned = (type === 'powerup' && name === 'None') || ownedItems.includes(name);
        const effects = type === 'modifier'
          ? this.describeModifierEffects(item)
          : type === 'powerup'
            ? this.describePowerupEffects(name)
            : ['Visual profile changes lane, hazard, and panel colors.'];
        return `<button class="xy-dodge-loadout-option xy-dodge-button" type="button" data-loadout-type="${type}" data-loadout-name="${name}" data-active="${selectedName === name}"><h5>${name}${item.price ? ` · ${item.price}c` : ''}</h5><p>${item.description}</p><ul class="xy-dodge-effect-list">${effects.map(effect => `<li>${effect}</li>`).join('')}</ul><small>${owned ? 'Owned / ready to equip' : 'Purchase required before use'}</small></button>`;
      }).join('')}</div>`;
    }

    renderLoadoutTab() {
      const currentModifier = MODIFIERS[this.data.selectedModifier] || MODIFIERS.Balanced;
      const currentPowerup = POWERUPS[this.data.selectedPowerup] || POWERUPS.None;
      const currentVisualTheme = VISUAL_THEMES[this.data.selectedVisualTheme] || VISUAL_THEMES.Neon;
      return `
        <div class="xy-dodge-panel">
          <strong>Current loadout effects</strong>
          <p><strong>Modifier:</strong> ${currentModifier.description}</p>
          <ul class="xy-dodge-effect-list">${this.describeModifierEffects(currentModifier).map(effect => `<li>${effect}</li>`).join('')}</ul>
          <p><strong>Powerup:</strong> ${currentPowerup.description}</p>
          <ul class="xy-dodge-effect-list">${this.describePowerupEffects(this.data.selectedPowerup).map(effect => `<li>${effect}</li>`).join('')}</ul>
          <small>Switching your loadout restarts the run so the equipped effect applies immediately.</small>
        </div>
        <div class="xy-dodge-quick-grid">
          <div class="xy-dodge-panel">
            <h4>Modifier</h4>
            ${this.renderLoadoutOptionList('modifier', MODIFIERS, this.data.selectedModifier, this.data.ownedModifiers)}
            <button id="xyBuyModifierBtn" class="xy-dodge-button xy-dodge-button--primary" type="button">${this.data.ownedModifiers.includes(this.data.selectedModifier) ? 'Equip modifier' : `Buy for ${currentModifier.price} coins`}</button>
          </div>
          <div class="xy-dodge-panel">
            <h4>Powerup</h4>
            ${this.renderLoadoutOptionList('powerup', POWERUPS, this.data.selectedPowerup, this.data.ownedPowerups)}
            <button id="xyBuyPowerupBtn" class="xy-dodge-button xy-dodge-button--primary" type="button">${this.data.selectedPowerup === 'None' || this.data.ownedPowerups.includes(this.data.selectedPowerup) ? 'Equip powerup' : `Buy for ${currentPowerup.price} coins`}</button>
          </div>
          <div class="xy-dodge-panel">
            <h4>Visual theme</h4>
            ${this.renderLoadoutOptionList('visualTheme', VISUAL_THEMES, this.data.selectedVisualTheme, this.data.ownedVisualThemes)}
            <button id="xyBuyVisualThemeBtn" class="xy-dodge-button xy-dodge-button--primary" type="button">${this.data.ownedVisualThemes.includes(this.data.selectedVisualTheme) ? 'Equip theme' : `Buy for ${currentVisualTheme.price} coins`}</button>
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
        this.restart();
        this.renderTab('modes');
        this.syncUi();
        this.flashStatus(`${this.data.selectedMode} selected.`, 'ok');
      }));

      this.buyModifierBtn = this.tabContent.querySelector('#xyBuyModifierBtn') || this.buyModifierBtn;
      this.buyPowerupBtn = this.tabContent.querySelector('#xyBuyPowerupBtn') || this.buyPowerupBtn;
      this.buyVisualThemeBtn = this.tabContent.querySelector('#xyBuyVisualThemeBtn') || this.buyVisualThemeBtn;
      this.tabContent.querySelectorAll('[data-loadout-type]').forEach(button => {
        button.addEventListener('click', () => {
          const type = button.getAttribute('data-loadout-type');
          const name = button.getAttribute('data-loadout-name') || '';
          if (type === 'modifier') this.data.selectedModifier = name;
          if (type === 'powerup') this.data.selectedPowerup = name;
          if (type === 'visualTheme') this.data.selectedVisualTheme = name;
          this.updateThemeColors();
          this.saveData();
          this.restart();
          this.renderTab(this.activeTab || 'loadout');
          this.syncUi();
        });
      });
      this.buyModifierBtn?.addEventListener('click', () => this.buySelectedModifier());
      this.buyPowerupBtn?.addEventListener('click', () => this.buySelectedPowerup());
      this.buyVisualThemeBtn?.addEventListener('click', () => this.buySelectedVisualTheme());
    }

    applyResponsiveState() {
      const mobileUiEnabled = window.matchMedia('(max-width: 900px), (pointer: coarse)').matches || this.isTouchDevice();
      this.mobileControls.hidden = !mobileUiEnabled;
      this.mobileControls.dataset.visible = String(mobileUiEnabled);
    }

    syncLoadoutButtons() {
      const modifier = MODIFIERS[this.data.selectedModifier] || MODIFIERS.Balanced;
      const powerup = POWERUPS[this.data.selectedPowerup] || POWERUPS.None;
      const visualTheme = VISUAL_THEMES[this.data.selectedVisualTheme] || VISUAL_THEMES.Neon;
      if (this.buyModifierBtn) this.buyModifierBtn.textContent = this.data.ownedModifiers.includes(this.data.selectedModifier) ? 'Equip modifier' : `Buy for ${modifier.price} coins`;
      if (this.buyPowerupBtn) this.buyPowerupBtn.textContent = this.data.selectedPowerup === 'None' || this.data.ownedPowerups.includes(this.data.selectedPowerup) ? 'Equip powerup' : `Buy for ${powerup.price} coins`;
      if (this.buyVisualThemeBtn) this.buyVisualThemeBtn.textContent = this.data.ownedVisualThemes.includes(this.data.selectedVisualTheme) ? 'Equip theme' : `Buy for ${visualTheme.price} coins`;
    }

    syncUi() {
      const visibleModeName = this.isBetaEnabled() ? this.data.selectedMode : 'Classic';
      const mode = GAME_MODES[visibleModeName] || GAME_MODES.Classic;
      this.ensureDailyObjectiveState();
      const now = performance.now();
      if (now - this.lastUiSyncAt < 90) return;
      this.lastUiSyncAt = now;

      const writeIfChanged = (key, next, target, formatter = value => value) => {
        if (!target) return;
        if (this.uiStateCache[key] === next) return;
        this.uiStateCache[key] = next;
        target.textContent = formatter(next);
      };

      writeIfChanged('bestScore', this.data.bestScore || 0, this.bestEl, String);
      writeIfChanged('coinBank', this.data.coins || 0, this.bankEl, String);
      writeIfChanged('totalRuns', this.data.totalRuns || 0, this.runsEl, String);
      writeIfChanged('longestCombo', this.data.longestCombo || 0, this.comboBestEl, String);
      writeIfChanged('dailyStreak', this.data.dailyStreak || 0, this.dailyStreakEl, String);
      writeIfChanged('runScore', this.score, this.runScoreEl, value => `Score: ${value}`);
      writeIfChanged('runCoins', this.runCoins, this.runCoinsEl, value => `Coins: ${value}`);
      writeIfChanged('runCombo', this.combo, this.runComboEl, value => `Combo: ${value}`);
      writeIfChanged('runLives', this.lives || 1, this.runLivesEl, value => `Lives: ${value}`);
      writeIfChanged('modeName', visibleModeName, this.currentModeLabelEl);
      writeIfChanged('modeObjective', mode.objective, this.modeObjectiveEl);
      writeIfChanged('availableTokens', this.availableAiTokens(), this.tokenCountEl, String);
      writeIfChanged('storyProgress', `${Math.min(this.data.storyProgress, STORY_CHAPTERS.length)} / ${STORY_CHAPTERS.length}`, this.storyProgressLabelEl);
      writeIfChanged('visualTheme', this.data.selectedVisualTheme || 'Neon', this.visualThemeLabelEl, String);
      if (this.missionCardEl) {
        const missionState = this.ensureDailyObjectiveState();
        const missionSignature = JSON.stringify({
          id: missionState.id,
          progress: missionState.progress,
          completed: missionState.completed,
          rewardClaimed: missionState.rewardClaimed
        });
        if (missionSignature !== this.lastMissionSignature) {
          this.lastMissionSignature = missionSignature;
          this.renderMissionCard();
        }
      }
      this.syncLoadoutButtons();
      this.updateCheatUi();
    }

    renderMissionCard() {
      const state = this.ensureDailyObjectiveState();
      const objective = state.meta;
      const detailText = state.rewardClaimed
        ? 'Reward claimed for today. A new objective will appear at local midnight.'
        : state.completed
          ? 'Objective complete. Claim your reward before local midnight.'
          : 'Resets at midnight in the player’s local time zone.';
      this.missionCardEl.innerHTML = `
        <div class="xy-dodge-mission-card">
          <strong>${objective.title}</strong>
          <p>${objective.description}</p>
          <div class="xy-dodge-control-row">
            <span class="xy-dodge-badge">Reward: ${objective.reward} coins</span>
            <span class="xy-dodge-badge">${state.rewardClaimed ? 'Claimed' : state.completed ? 'Ready to claim' : 'In progress'}</span>
          </div>
          <div class="xy-dodge-claim-button-wrap">
            <button class="xy-dodge-button xy-dodge-button--primary" type="button" id="xyClaimMissionBtn" ${state.completed && !state.rewardClaimed ? '' : 'disabled'}>${state.rewardClaimed ? 'Reward claimed' : state.completed ? 'Claim reward' : 'Finish objective first'}</button>
          </div>
          <small>${detailText}</small>
        </div>
      `;
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
        this.statusEl.textContent = this.gameOver ? 'Run ended.' : this.paused ? 'Paused.' : 'Ready.';
        this.statusEl.dataset.tone = 'ok';
      }, 1400);
    }

    buySelectedModifier() {
      const modifier = MODIFIERS[this.data.selectedModifier] || MODIFIERS.Balanced;
      if (this.data.ownedModifiers.includes(this.data.selectedModifier)) {
        this.restart();
        this.renderTab('loadout');
        this.syncUi();
        this.flashStatus('Modifier equipped.', 'ok');
        return;
      }
      if (this.data.coins < modifier.price) {
        this.flashStatus('Not enough coins.', 'warning');
        return;
      }
      this.data.coins -= modifier.price;
      this.data.ownedModifiers.push(this.data.selectedModifier);
      this.saveData();
      this.renderTab('loadout');
      this.syncUi();
      this.flashStatus(`${this.data.selectedModifier} unlocked.`, 'ok');
    }

    buySelectedPowerup() {
      const powerup = POWERUPS[this.data.selectedPowerup] || POWERUPS.None;
      if (this.data.selectedPowerup === 'None') {
        this.flashStatus('No purchase needed for None.', 'warning');
        return;
      }
      if (this.data.ownedPowerups.includes(this.data.selectedPowerup)) {
        this.restart();
        this.renderTab('loadout');
        this.syncUi();
        this.flashStatus('Powerup equipped.', 'ok');
        return;
      }
      if (this.data.coins < powerup.price) {
        this.flashStatus('Not enough coins.', 'warning');
        return;
      }
      this.data.coins -= powerup.price;
      this.data.ownedPowerups.push(this.data.selectedPowerup);
      this.saveData();
      this.renderTab('loadout');
      this.syncUi();
      this.flashStatus(`${this.data.selectedPowerup} unlocked.`, 'ok');
    }

    buySelectedVisualTheme() {
      const visualTheme = VISUAL_THEMES[this.data.selectedVisualTheme] || VISUAL_THEMES.Neon;
      if (this.data.ownedVisualThemes.includes(this.data.selectedVisualTheme)) {
        this.updateThemeColors();
        this.restart();
        this.renderTab('loadout');
        this.syncUi();
        this.flashStatus('Theme equipped.', 'ok');
        return;
      }
      if (this.data.coins < visualTheme.price) {
        this.flashStatus('Not enough coins.', 'warning');
        return;
      }
      this.data.coins -= visualTheme.price;
      this.data.ownedVisualThemes.push(this.data.selectedVisualTheme);
      this.updateThemeColors();
      this.saveData();
      this.restart();
      this.renderTab('loadout');
      this.syncUi();
      this.flashStatus(`${this.data.selectedVisualTheme} theme unlocked.`, 'ok');
    }

    buyTokenPack(amount, cost) {
      if (!Number.isFinite(amount) || !Number.isFinite(cost) || amount <= 0 || cost <= 0) return;
      if (this.data.coins < cost) {
        this.flashStatus('Not enough coins for tokens.', 'warning');
        return;
      }
      this.data.coins -= cost;
      this.data.aiPurchasedTokens += amount;
      this.saveData();
      this.syncUi();
      this.flashStatus(`Purchased ${amount} AI token${amount > 1 ? 's' : ''}.`, 'ok');
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
      this.ensureDailyObjectiveState();
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
      this.flashStatus(`${this.data.selectedMode} run started.`, 'ok');
    }

    restart() {
      this.resetState();
    }

    togglePause() {
      if (!this.running || this.gameOver) return;
      this.paused = !this.paused;
      this.pauseBtn.textContent = this.paused ? 'Resume' : 'Pause';
      this.flashStatus(this.paused ? 'Paused.' : 'Resumed.', this.paused ? 'warning' : 'ok');
    }

    currentSpeed(elapsed) {
      const cheatSlow = this.activeCheatSet().has('slowtime') ? 0.65 : 1;
      return clamp((3.4 + elapsed * 0.1 + this.score * 0.016) * this.mode.speed * this.modifier.pressure * cheatSlow, 2.8, 18);
    }

    currentSpawnInterval(elapsed) {
      const cheatSlow = this.activeCheatSet().has('slowtime') ? 1.25 : 1;
      const modeModifier = this.mode.interval;
      return clamp((1.15 - elapsed * 0.0022 - this.score * 0.0011) * modeModifier * cheatSlow, 0.22, 1.6);
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
      const patterns = [[0], [1], [2], [3], [4], [5], [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [0, 2], [1, 3], [2, 4], [3, 5], [0, 3], [1, 4], [2, 5], [0, 1, 3], [1, 2, 4], [2, 3, 5], [0, 2, 4], [1, 3, 5]];
      const safe = this.safeLanes();
      const pressure = this.lanePressure();
      const currentLane = this.player.targetLane;
      let bestScore = -Infinity;
      let bestPattern = patterns[0];
      for (const pattern of patterns) {
        const futureSafe = [...Array(BOARD.lanes).keys()].filter(lane => !pattern.includes(lane));
        if (!futureSafe.length) continue;
        let score = pattern.length * (0.55 + this.mode.modeScore * 0.2);
        for (const lane of pattern) score += Math.max(0, 2.4 - pressure[lane]) + Math.abs(lane - currentLane) * 0.35;
        if (safe.length && safe.every(lane => pattern.includes(lane))) score -= 40;
        score += Math.random() * 0.5;
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
      if (this.isBetaEnabled() && Math.random() < this.mode.pickups) {
        const openLanes = [...Array(BOARD.lanes).keys()].filter(lane => !pattern.includes(lane));
        const lane = pick(openLanes.length ? openLanes : [2]);
        this.pickups.push({ lane, x: lane * laneWidth + laneWidth / 2, y: -30, size: 11, speed: speed * 0.82 });
      }
    }

    chooseAutoplayLane() {
      const safe = this.safeLanes();
      if (!safe.length) return this.player.targetLane;
      const pressure = this.lanePressure();
      const pickupCandidate = this.pickups
        .filter(pickup => safe.includes(pickup.lane) && pickup.y > BOARD.height * 0.18 && pickup.y < this.player.y + 24)
        .sort((a, b) => {
          const scoreA = pressure[a.lane] + Math.abs(a.lane - this.player.targetLane) * 0.18 + Math.abs(this.player.y - a.y) * 0.002;
          const scoreB = pressure[b.lane] + Math.abs(b.lane - this.player.targetLane) * 0.18 + Math.abs(this.player.y - b.y) * 0.002;
          return scoreA - scoreB;
        })[0];
      if (pickupCandidate && pressure[pickupCandidate.lane] < 1.35) return pickupCandidate.lane;
      return safe.reduce((best, lane) => {
        if (pressure[lane] !== pressure[best]) return pressure[lane] < pressure[best] ? lane : best;
        return Math.abs(lane - this.player.targetLane) < Math.abs(best - this.player.targetLane) ? lane : best;
      }, safe[0]);
    }

    updatePlayer() {
      const cheats = this.activeCheatSet();
      if (cheats.has('autoplay') || cheats.has('ghost')) {
        this.player.targetLane = this.chooseAutoplayLane();
      }
      if (cheats.has('ghost')) {
        if ((this.frameCounter || 0) % 2 === 0) {
          this.particles.push({
            x: this.player.x,
            y: this.player.y + 4,
            vx: 0,
            vy: 0.18,
            life: 0.34,
            size: 6,
            color: withAlpha(THEMES.accent, 0.26, 'rgba(108,229,255,0.26)')
          });
        }
        if (this.particles.length > 72) this.particles.shift();
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
      this.combo += 2;
      this.bestComboRun = Math.max(this.bestComboRun, this.combo);
      this.data.totalPickups += 1;
      if (!this.hasEnabledCheat()) this.runCoins += this.powerups.has('Lucky Drift') ? 3 : 2;
      this.flashStatus('Energy shard collected.', 'ok');
    }

    handleCollision() {
      if (this.activeCheatSet().has('nodeath')) {
        this.flashStatus('No Death blocked the hit.', 'warning');
        return;
      }
      if (this.lives > 1) {
        this.lives -= 1;
        this.blocks = this.blocks.filter(block => block.y < this.player.y - 70 || block.y > this.player.y + 70);
        this.flashStatus('Shield consumed. Keep going.', 'warning');
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
          this.combo += 1;
          this.bestComboRun = Math.max(this.bestComboRun, this.combo);
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
        if (this.powerups.has('Magnet Pulse')) {
          pickup.x += (this.player.x - pickup.x) * 0.04;
        }
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
      const comboMet = !chapter.targetCombo || this.bestComboRun >= chapter.targetCombo;
      const lifeMet = !chapter.requireLife || this.lives >= 1;
      if (scoreMet && pickupsMet && comboMet && lifeMet) {
        if (!this.data.storyRewardsClaimed.includes(chapter.id)) {
          this.data.coins += chapter.reward;
          this.data.storyRewardsClaimed.push(chapter.id);
        }
        this.data.storyProgress = Math.min(STORY_CHAPTERS.length, (this.data.storyProgress || 0) + 1);
        this.storyChapter = this.resolveStoryChapter();
        this.flashStatus(`Story chapter cleared: ${chapter.title}.`, 'ok');
      }
    }

    updateParticles(dt) {
      this.particles = this.particles
        .map(particle => ({
          ...particle,
          x: particle.x + (particle.vx || 0),
          y: particle.y + (particle.vy || 0) * dt * 60,
          life: particle.life - dt,
        }))
        .filter(particle => particle.life > 0);
    }

    endRun() {
      if (this.gameOver) return;
      this.gameOver = true;
      this.data.totalRuns += 1;
      this.data.bestScore = Math.max(this.data.bestScore, this.score);
      this.data.bestByMode[this.data.selectedMode] = Math.max(this.data.bestByMode[this.data.selectedMode] || 0, this.score);
      this.data.longestCombo = Math.max(this.data.longestCombo, this.bestComboRun);
      this.checkStoryProgress();
      this.evaluateDailyObjective({ finishedRun: true, pickups: this.storyPickups, score: this.score, runCoins: this.runCoins });
      this.data.coins += this.hasEnabledCheat() ? 0 : this.runCoins;
      this.saveData();
      this.syncUi();
      this.overlay.hidden = false;
      this.overlay.innerHTML = `
        <div class="xy-dodge-modal-card">
          <h3>Run complete</h3>
          <p>Mode: <strong>${this.data.selectedMode}</strong></p>
          <p>Score: <strong>${this.score}</strong></p>
          <p>Coins earned: <strong>${this.hasEnabledCheat() ? 0 : this.runCoins}</strong></p>
          <p>Pickups: <strong>${this.storyPickups}</strong> · Best combo: <strong>${this.bestComboRun}</strong></p>
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
      gradient.addColorStop(0, THEMES.bg);
      gradient.addColorStop(1, THEMES.track);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, BOARD.width, BOARD.height);

      for (let lane = 0; lane <= BOARD.lanes; lane += 1) {
        const x = lane * (BOARD.width / BOARD.lanes);
        ctx.strokeStyle = withAlpha(THEMES.accent2, 0.3, 'rgba(115, 164, 255, 0.22)');
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, BOARD.height);
        ctx.stroke();
      }
      for (let y = 40; y < BOARD.height; y += 80) {
        ctx.strokeStyle = withAlpha(THEMES.accent, 0.18, 'rgba(115, 164, 255, 0.12)');
        ctx.setLineDash([8, 8]);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(BOARD.width, y);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      this.blocks.forEach(block => {
        this.drawRoundedRect(ctx, block.x - 2, block.y - 2, block.w + 4, block.h + 4, 8, 'rgba(0,0,0,0.3)');
        this.drawRoundedRect(ctx, block.x, block.y, block.w, block.h, 8, THEMES.danger, withAlpha(THEMES.text, 0.7, 'rgba(255,235,244,0.8)'));
      });
      this.pickups.forEach(pickup => {
        ctx.beginPath();
        ctx.fillStyle = THEMES.accent3;
        ctx.arc(pickup.x, pickup.y, pickup.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = THEMES.text;
        ctx.lineWidth = 2;
        ctx.stroke();
      });
      this.particles.forEach(particle => {
        ctx.globalAlpha = Math.max(0, particle.life);
        ctx.beginPath();
        ctx.fillStyle = particle.color || 'rgba(108,229,255,0.25)';
        ctx.arc(particle.x, particle.y, particle.size || 4, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      const playerX = this.player.x - this.player.w / 2;
      const playerY = this.player.y - this.player.h / 2;
      this.drawRoundedRect(ctx, playerX - 2, playerY - 2, this.player.w + 4, this.player.h + 4, 9, 'rgba(0,0,0,0.38)');
      this.drawRoundedRect(ctx, playerX, playerY, this.player.w, this.player.h, 9, THEMES.accent, THEMES.text);

      if (this.data.selectedMode === 'Story' && this.isBetaEnabled()) {
        ctx.fillStyle = THEMES.text;
        ctx.font = 'bold 18px Inter, system-ui, sans-serif';
        ctx.fillText(this.storyChapter.title, 24, 34);
        ctx.font = '14px Inter, system-ui, sans-serif';
        ctx.fillStyle = THEMES.subtext;
        ctx.fillText(this.storyChapter.objectiveLabel, 24, 58);
      }
    }

    loop = timestamp => {
      if (!this.running) return;
      if ((this.frameCounter = (this.frameCounter || 0) + 1) % 180 === 0 && this.isBetaEnabled()) {
        this.updateThemeColors();
      }
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
        if (this.powerups.has('Time Bloom') && this.combo > 0 && this.combo % 12 === 0) {
          this.blocks.forEach(block => { block.speed *= 0.995; });
        }
      }
      this.updateParticles(dt);
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
