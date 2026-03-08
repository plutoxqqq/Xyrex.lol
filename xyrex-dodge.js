(() => {
  const STORAGE_KEY = 'xyrex_dodge_save_v1';
  const FREE_DAILY_AI_TOKENS = 5;
  const THEME = {
    bg: '#0b1020',
    panel: '#11182a',
    card: '#19253d',
    card2: '#223150',
    accent: '#68e7ff',
    accent2: '#8f84ff',
    danger: '#ff648d',
    border: '#425b89',
    grid1: '#233556',
    grid2: '#1b2945',
    text: '#eef4ff',
    subtext: '#c2d2ef',
    success: '#84ffb1',
    warning: '#ffd166',
    gold: '#ffde7a',
    shadow: '#2b1430',
  };

  const MODIFIERS = {
    Balanced: { price: 0, desc: 'Steady all-round setup.', playerSpeed: 1.0, coinBonus: 1.0, pressure: 1.0 },
    'Rich Run': { price: 160, desc: 'More coins with higher pressure.', playerSpeed: 1.0, coinBonus: 1.5, pressure: 1.2 },
    Swift: { price: 100, desc: 'Faster movement with light pressure.', playerSpeed: 1.25, coinBonus: 1.0, pressure: 1.05 },
    Zen: { price: 140, desc: 'Calm pace and lighter rewards.', playerSpeed: 1.0, coinBonus: 0.5, pressure: 0.5 },
  };

  const POWERUPS = {
    None: { price: 0, desc: 'No active powerup effects.' },
    Quickstep: { price: 220, desc: 'Removes lane movement animation for instant repositioning.' },
    'Block Slowdown': { price: 260, desc: 'Slows difficulty ramping by 50% to reduce pressure spikes.' },
    'Shield Matrix': { price: 300, desc: 'Adds one extra life. The first collision consumes the shield.' },
    'Lucky Drift': { price: 180, desc: 'Increases run coin gains by 20% on all modifiers.' },
  };

  const DEFAULT_DATA = {
    coins: 0,
    bestScore: 0,
    ownedModifiers: ['Balanced'],
    selectedModifier: 'Balanced',
    ownedPowerups: [],
    selectedPowerup: 'None',
    aiTokenDate: '',
    aiTokensUsedToday: 0,
    aiPurchasedTokens: 0,
  };

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];

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
      this.spawnTimer = 0;
      this.startTs = 0;
      this.keys = { left: false, right: false };
      this.particles = [];
      this.ensureTokenState();
      this.buildUi();
    }

    loadData() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return { ...DEFAULT_DATA };
        const parsed = JSON.parse(raw);
        return {
          ...DEFAULT_DATA,
          ...parsed,
          ownedModifiers: Array.isArray(parsed.ownedModifiers) && parsed.ownedModifiers.length ? parsed.ownedModifiers : ['Balanced'],
          ownedPowerups: Array.isArray(parsed.ownedPowerups) ? parsed.ownedPowerups.filter(name => POWERUPS[name]) : [],
          selectedModifier: MODIFIERS[parsed.selectedModifier] ? parsed.selectedModifier : 'Balanced',
          selectedPowerup: POWERUPS[parsed.selectedPowerup] ? parsed.selectedPowerup : 'None',
        };
      } catch {
        return { ...DEFAULT_DATA };
      }
    }

    saveData() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    }

    dayKey() {
      return new Date().toISOString().slice(0, 10);
    }

    ensureTokenState() {
      const today = this.dayKey();
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

    buildUi() {
      this.mount.innerHTML = `
        <section class="xy-game-shell" aria-label="Xyrex Dodge game">
          <header class="xy-game-top">
            <div>
              <h2>Xyrex Dodge</h2>
              <p>Dodge the waves, earn coins, and unlock modifiers.</p>
            </div>
            <div class="xy-game-stats">
              <span id="xyBest">Best: 0</span>
              <span id="xyBank">Coins: 0</span>
            </div>
          </header>
          <div class="xy-game-main">
            <div class="xy-canvas-wrap">
              <canvas id="xyGameCanvas" width="960" height="620" aria-label="Game canvas" tabindex="0"></canvas>
              <div id="xyOverlay" class="xy-overlay" hidden></div>
            </div>
            <aside class="xy-sidepanel">
              <div class="xy-sidecard">
                <h3>Run</h3>
                <div id="xyRunScore">Score: 0</div>
                <div id="xyRunCoins">Coins: 0</div>
                <div id="xyStatus" class="xy-status running">Running</div>
                <div class="xy-run-actions">
                  <button id="xyPauseBtn" type="button">Pause</button>
                  <button id="xyRestartBtn" type="button">Restart</button>
                </div>
              </div>
              <div class="xy-sidecard">
                <h3>Modifier</h3>
                <select id="xyModifierSelect"></select>
                <p id="xyModifierDesc"></p>
                <button id="xyBuyBtn" type="button">Buy selected</button>
              </div>
              <div class="xy-sidecard">
                <h3>Powerups</h3>
                <select id="xyPowerupSelect"></select>
                <p id="xyPowerupDesc"></p>
                <button id="xyBuyPowerupBtn" type="button">Buy selected</button>
              </div>
              <div class="xy-sidecard">
                <h3>Token Shop</h3>
                <div id="xyTokenCount" class="xy-token-count"></div>
                <div class="xy-token-actions">
                  <button type="button" data-token-pack="1" data-token-cost="30">30 coins → 1 token</button>
                  <button type="button" data-token-pack="2" data-token-cost="50">50 coins → 2 tokens</button>
                  <button type="button" data-token-pack="5" data-token-cost="100">100 coins → 5 tokens</button>
                </div>
              </div>
            </aside>
          </div>
        </section>
      `;

      this.canvas = this.mount.querySelector('#xyGameCanvas');
      this.ctx = this.canvas.getContext('2d');
      this.overlay = this.mount.querySelector('#xyOverlay');
      this.bestEl = this.mount.querySelector('#xyBest');
      this.bankEl = this.mount.querySelector('#xyBank');
      this.runScoreEl = this.mount.querySelector('#xyRunScore');
      this.runCoinsEl = this.mount.querySelector('#xyRunCoins');
      this.statusEl = this.mount.querySelector('#xyStatus');
      this.pauseBtn = this.mount.querySelector('#xyPauseBtn');
      this.restartBtn = this.mount.querySelector('#xyRestartBtn');
      this.modSelect = this.mount.querySelector('#xyModifierSelect');
      this.modDesc = this.mount.querySelector('#xyModifierDesc');
      this.buyBtn = this.mount.querySelector('#xyBuyBtn');
      this.powerupSelect = this.mount.querySelector('#xyPowerupSelect');
      this.powerupDesc = this.mount.querySelector('#xyPowerupDesc');
      this.buyPowerupBtn = this.mount.querySelector('#xyBuyPowerupBtn');
      this.tokenCountEl = this.mount.querySelector('#xyTokenCount');

      this.modSelect.innerHTML = Object.keys(MODIFIERS)
        .map(name => `<option value="${name}">${name}</option>`)
        .join('');
      this.powerupSelect.innerHTML = Object.keys(POWERUPS)
        .map(name => `<option value="${name}">${name}</option>`)
        .join('');

      this.modSelect.addEventListener('change', () => {
        this.data.selectedModifier = this.modSelect.value;
        this.updateModifierUi();
        this.saveData();
      });

      this.buyBtn.addEventListener('click', () => this.buySelectedModifier());
      this.powerupSelect.addEventListener('change', () => {
        this.data.selectedPowerup = this.powerupSelect.value;
        this.updatePowerupUi();
        this.saveData();
      });
      this.buyPowerupBtn.addEventListener('click', () => this.buySelectedPowerup());
      this.mount.querySelectorAll('[data-token-pack]').forEach(button => {
        button.addEventListener('click', () => {
          const amount = Number(button.getAttribute('data-token-pack'));
          const cost = Number(button.getAttribute('data-token-cost'));
          this.buyTokenPack(amount, cost);
        });
      });
      this.pauseBtn.addEventListener('click', () => this.togglePause());
      this.restartBtn.addEventListener('click', () => this.restart());

      this.handleKeyDown = e => {
        const k = e.key.toLowerCase();
        const targetTag = (e.target?.tagName || '').toLowerCase();
        const isTextField = ['input', 'textarea'].includes(targetTag) || e.target?.isContentEditable;
        const isFormField = ['input', 'textarea', 'select', 'button'].includes(targetTag);
        const shouldCaptureMoveKey = k === 'arrowleft' || k === 'arrowright' || k === 'a' || k === 'd';

        if (shouldCaptureMoveKey && e.repeat) return;

        if (shouldCaptureMoveKey && !isFormField) {
          e.preventDefault();
          if (k === 'arrowleft' || k === 'a') this.keys.left = true;
          if (k === 'arrowright' || k === 'd') this.keys.right = true;
        }

        if ((k === 'p' || k === 'r') && !isTextField) {
          e.preventDefault();
          if (k === 'p') this.togglePause();
          if (k === 'r') this.restart();
        }
      };
      this.handleKeyUp = e => {
        const k = e.key.toLowerCase();
        if (k === 'arrowleft' || k === 'a') this.keys.left = false;
        if (k === 'arrowright' || k === 'd') this.keys.right = false;
      };

      this.applyResponsiveCanvas = () => {
        const wrap = this.canvas.parentElement;
        const gameMain = this.mount.querySelector('.xy-game-main');
        const sidePanel = this.mount.querySelector('.xy-sidepanel');

        const availableWidth = Math.max(280, wrap.clientWidth);
        const reservedPanelHeight = gameMain && sidePanel && getComputedStyle(gameMain).gridTemplateColumns.split(' ').length === 1
          ? sidePanel.offsetHeight + 8
          : 0;
        const availableHeight = Math.max(220, wrap.clientHeight - reservedPanelHeight);

        this.canvas.style.width = `${Math.round(availableWidth)}px`;
        this.canvas.style.height = `${Math.round(availableHeight)}px`;
      };

      this.syncUi();
      this.updateModifierUi();
      this.updatePowerupUi();
      this.updateTokenShopUi();
      this.applyResponsiveCanvas();
      window.addEventListener('resize', this.applyResponsiveCanvas);
    }

    syncUi() {
      this.bestEl.textContent = `Best: ${this.data.bestScore}`;
      this.bankEl.textContent = `Coins: ${this.data.coins}`;
      this.runScoreEl.textContent = `Score: ${this.score}`;
      this.runCoinsEl.textContent = `Coins: ${this.runCoins}`;
    }

    updateModifierUi() {
      const selected = this.data.selectedModifier;
      const mod = MODIFIERS[selected] ?? MODIFIERS.Balanced;
      const owned = this.data.ownedModifiers.includes(selected);
      this.modSelect.value = selected;
      this.modDesc.innerHTML = `${mod.desc}<br>Coin multiplier: x${mod.coinBonus.toFixed(2)}<br>Speed multiplier: x${mod.playerSpeed.toFixed(2)}<br>Pressure multiplier: x${mod.pressure.toFixed(2)}`;
      this.buyBtn.disabled = owned;
      this.buyBtn.textContent = owned ? 'Owned' : `Buy (${mod.price} coins)`;
    }

    updatePowerupUi() {
      const selected = this.data.selectedPowerup && POWERUPS[this.data.selectedPowerup] ? this.data.selectedPowerup : 'None';
      const powerup = POWERUPS[selected];
      const owned = selected === 'None' || this.data.ownedPowerups.includes(selected);
      this.data.selectedPowerup = selected;
      this.powerupSelect.value = selected;
      this.powerupDesc.textContent = powerup?.desc || '';
      if (selected === 'None') {
        this.buyPowerupBtn.disabled = true;
        this.buyPowerupBtn.textContent = 'Equipped';
      } else {
        this.buyPowerupBtn.disabled = owned;
        this.buyPowerupBtn.textContent = owned ? 'Owned' : `Buy (${powerup.price} coins)`;
      }
    }

    updateTokenShopUi() {
      this.ensureTokenState();
      const freeRemaining = Math.max(0, FREE_DAILY_AI_TOKENS - this.data.aiTokensUsedToday);
      const purchased = Math.max(0, this.data.aiPurchasedTokens);
      this.tokenCountEl.textContent = `Available AI tokens: ${this.availableAiTokens()} (Daily: ${freeRemaining}, Purchased: ${purchased})`;
    }

    buySelectedModifier() {
      const name = this.modSelect.value;
      const mod = MODIFIERS[name];
      if (!mod || this.data.ownedModifiers.includes(name)) return;
      if (this.data.coins < mod.price) {
        this.flashStatus('Not enough coins.', 'warning');
        return;
      }
      this.data.coins -= mod.price;
      this.data.ownedModifiers.push(name);
      this.data.selectedModifier = name;
      this.saveData();
      this.updateModifierUi();
      this.syncUi();
      this.flashStatus(`${name} unlocked.`, 'running');
    }

    buySelectedPowerup() {
      const name = this.powerupSelect.value;
      const powerup = POWERUPS[name];
      if (name === 'None') return;
      if (!powerup || this.data.ownedPowerups.includes(name)) return;
      if (this.data.coins < powerup.price) {
        this.flashStatus('Not enough coins.', 'warning');
        return;
      }
      this.data.coins -= powerup.price;
      this.data.ownedPowerups.push(name);
      this.data.selectedPowerup = name;
      this.saveData();
      this.updatePowerupUi();
      this.syncUi();
      this.flashStatus(`${name} unlocked.`, 'running');
    }

    buyTokenPack(amount, cost) {
      if (!Number.isFinite(amount) || !Number.isFinite(cost) || amount <= 0 || cost <= 0) return;
      if (!window.confirm(`Buy ${amount} AI token${amount > 1 ? 's' : ''} for ${cost} coins?`)) return;
      if (this.data.coins < cost) {
        window.alert('You do not have enough coins for that token pack.');
        this.flashStatus('Not enough coins.', 'warning');
        return;
      }
      this.data.coins -= cost;
      this.data.aiPurchasedTokens += amount;
      this.saveData();
      this.syncUi();
      this.updateTokenShopUi();
      this.flashStatus(`Purchased ${amount} AI token${amount > 1 ? 's' : ''}.`, 'running');
    }

    flashStatus(text, type) {
      this.statusEl.textContent = text;
      this.statusEl.className = `xy-status ${type}`;
      clearTimeout(this.statusTimeout);
      this.statusTimeout = setTimeout(() => {
        if (this.gameOver) {
          this.statusEl.textContent = 'Game over';
          this.statusEl.className = 'xy-status danger';
        } else if (this.paused) {
          this.statusEl.textContent = 'Paused';
          this.statusEl.className = 'xy-status warning';
        } else {
          this.statusEl.textContent = 'Running';
          this.statusEl.className = 'xy-status running';
        }
      }, 1200);
    }

    start() {
      if (this.running) return;
      this.running = true;
      this.resetState();
      document.addEventListener('keydown', this.handleKeyDown, { capture: true });
      document.addEventListener('keyup', this.handleKeyUp);
      this.lastTs = performance.now();
      this.canvas.focus({ preventScroll: true });
      requestAnimationFrame(() => this.applyResponsiveCanvas());
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
      window.removeEventListener('resize', this.applyResponsiveCanvas);
      this.mount.innerHTML = '';
    }

    resetState() {
      this.mod = MODIFIERS[this.data.selectedModifier] ?? MODIFIERS.Balanced;
      const selectedPowerup = this.data.selectedPowerup && POWERUPS[this.data.selectedPowerup] ? this.data.selectedPowerup : 'None';
      this.data.selectedPowerup = selectedPowerup;
      this.powerups = selectedPowerup === 'None' ? new Set() : new Set(this.data.ownedPowerups.includes(selectedPowerup) ? [selectedPowerup] : []);
      this.lives = this.powerups.has('Shield Matrix') ? 2 : 1;
      this.paused = false;
      this.gameOver = false;
      this.pauseBtn.textContent = 'Pause';
      this.overlay.hidden = true;
      this.overlay.style.display = 'none';
      this.overlay.innerHTML = '';
      this.score = 0;
      this.runCoins = 0;
      this.level = 1;
      this.spawnTimer = 0;
      this.startTs = performance.now();
      this.player = {
        lane: 3,
        targetLane: 3,
        x: 3 * (960 / 6) + (960 / 6) / 2,
        y: 565,
        w: 84,
        h: 32,
      };
      this.blocks = [];
      this.particles = [];
      this.statusEl.textContent = 'Running';
      this.statusEl.className = 'xy-status running';
      this.updateModifierUi();
      this.updatePowerupUi();
      this.updateTokenShopUi();
      this.syncUi();
    }

    restart() {
      this.resetState();
    }

    togglePause() {
      if (!this.running || this.gameOver) return;
      this.paused = !this.paused;
      this.pauseBtn.textContent = this.paused ? 'Resume' : 'Pause';
      this.statusEl.textContent = this.paused ? 'Paused' : 'Running';
      this.statusEl.className = `xy-status ${this.paused ? 'warning' : 'running'}`;
    }

    currentSpeed(elapsed) {
      const rampFactor = this.powerups.has('Block Slowdown') ? 0.5 : 1;
      const base = 3 + elapsed * 0.06 * rampFactor + this.score * 0.012 * rampFactor;
      return clamp(base * this.mod.pressure, 0, 9);
    }

    currentSpawnInterval(elapsed) {
      const rampFactor = this.powerups.has('Block Slowdown') ? 0.5 : 1;
      const interval = (1.05 - elapsed * 0.0026 * rampFactor - this.score * 0.0009 * rampFactor) / this.mod.pressure;
      return clamp(interval, 0.42, 1.8);
    }

    lanePressure() {
      const pressures = Array(6).fill(0);
      const futureY = this.player.y - 180;
      for (const b of this.blocks) {
        const dist = Math.max(1, futureY - b.y);
        if (b.y < futureY) {
          pressures[b.lane] += Math.max(0.25, 170 / dist);
        } else {
          pressures[b.lane] += 3.6;
        }
      }
      return pressures;
    }

    safeLanes() {
      const blocked = new Set();
      const top = this.player.y - 120;
      const bottom = this.player.y + 18;
      for (const b of this.blocks) {
        if (top <= b.y + 34 && b.y <= bottom) blocked.add(b.lane);
      }
      return [...Array(6).keys()].filter(i => !blocked.has(i));
    }

    patternCandidates() {
      return [[0],[1],[2],[3],[4],[5],[1,2],[2,3],[3,4],[0,2],[1,3],[2,4],[3,5],[0,1],[4,5],[1,3,5],[0,2,4]];
    }

    scorePattern(pattern) {
      const pressures = this.lanePressure();
      const safe = this.safeLanes();
      const p = this.player.targetLane;
      const futureOpen = [...Array(6).keys()].filter(lane => !pattern.includes(lane));
      if (!futureOpen.length) return -99999;
      if (safe.length && safe.every(lane => pattern.includes(lane))) return -3000;

      let score = 0;
      for (const lane of pattern) {
        const d = Math.abs(lane - p);
        score += d === 0 ? 5 : d === 1 ? 4 : d === 2 ? 2.2 : 0.8;
        score += Math.max(0, 4.2 - pressures[lane] * 1.2);
      }
      const nearestEscape = Math.min(...futureOpen.map(lane => Math.abs(lane - p)));
      score += nearestEscape === 0 ? 3.5 : nearestEscape === 1 ? 2.0 : nearestEscape >= 3 ? -1.6 : 0;
      score += pattern.length * (0.6 + Math.min(this.level, 8) * 0.1);
      score += Math.random() * 0.8 - 0.4;
      return score;
    }

    spawnWave(elapsed) {
      this.level = 1 + Math.floor(this.score / 20);
      let candidates = this.patternCandidates();
      if (this.level <= 2) candidates = candidates.filter(p => p.length <= 2);
      else if (this.level <= 4) candidates = candidates.filter(p => p.length <= 3);

      const best = candidates.reduce((a, b) => (this.scorePattern(a) > this.scorePattern(b) ? a : b));
      const speed = this.currentSpeed(elapsed);
      const laneW = 960 / 6;
      const color = this.level % 2 ? THEME.danger : THEME.accent2;

      for (const lane of best) {
        this.blocks.push({ lane, x: lane * laneW + 10, y: -50, w: laneW - 20, h: 34, speed, color });
      }
    }

    updatePlayer() {
      if (this.keys.left) this.player.targetLane = Math.max(0, this.player.targetLane - 1);
      if (this.keys.right) this.player.targetLane = Math.min(5, this.player.targetLane + 1);
      this.keys.left = false;
      this.keys.right = false;
      const laneW = 960 / 6;
      const targetX = this.player.targetLane * laneW + laneW / 2;
      if (this.powerups.has('Quickstep')) {
        this.player.x = targetX;
      } else {
        this.player.x += (targetX - this.player.x) * (0.16 * this.mod.playerSpeed);
      }
    }

    hitBlock(b) {
      const px1 = this.player.x - this.player.w / 2;
      const px2 = this.player.x + this.player.w / 2;
      const py1 = this.player.y - this.player.h / 2;
      const py2 = this.player.y + this.player.h / 2;
      const bx1 = b.x;
      const bx2 = b.x + b.w;
      const by1 = b.y;
      const by2 = b.y + b.h;
      return !(px2 < bx1 || px1 > bx2 || py2 < by1 || py1 > by2);
    }

    endRun() {
      if (this.gameOver) return;
      if (this.lives > 1) {
        this.lives -= 1;
        this.blocks = this.blocks.filter(b => b.y < this.player.y - 60 || b.y > this.player.y + 60);
        this.flashStatus('Shield consumed. One life remaining.', 'warning');
        return;
      }
      this.gameOver = true;
      this.data.coins += this.runCoins;
      this.data.bestScore = Math.max(this.data.bestScore, this.score);
      this.saveData();
      this.syncUi();
      this.statusEl.textContent = 'Game over';
      this.statusEl.className = 'xy-status danger';
      this.overlay.hidden = false;
      this.overlay.style.display = 'flex';
      this.overlay.innerHTML = `<div class="xy-overlay-card"><h3>Game Over</h3><p>Score: <strong>${this.score}</strong></p><p>Coins earned: <strong>${this.runCoins}</strong></p><p>Press R or click Restart.</p></div>`;
    }

    updateBlocks(dt) {
      const alive = [];
      const beforeCollisionBlocks = [...this.blocks];
      let collided = false;
      for (const b of this.blocks) {
        b.y += b.speed * (dt * 60);
        if (this.hitBlock(b)) {
          this.particles.push(...Array.from({ length: 18 }, () => ({
            x: this.player.x,
            y: this.player.y,
            vx: (Math.random() - 0.5) * 7,
            vy: (Math.random() - 0.5) * 7,
            life: 0.65,
            color: pick([THEME.danger, THEME.accent, THEME.accent2]),
          })));
          this.endRun();
          collided = true;
          break;
        }
        if (b.y > 620) {
          this.score += 1;
          const baseCoins = Math.max(1, Math.round(this.mod.coinBonus));
          const coinBoost = this.powerups.has('Lucky Drift') ? 1.2 : 1;
          this.runCoins += Math.max(1, Math.round(baseCoins * coinBoost));
        } else {
          alive.push(b);
        }
      }
      if (collided && this.gameOver) {
        this.blocks = beforeCollisionBlocks;
      } else if (!collided) {
        this.blocks = alive;
      }
    }

    updateParticles(dt) {
      this.particles = this.particles
        .map(p => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, vy: p.vy + 0.1, life: p.life - dt }))
        .filter(p => p.life > 0);
    }


    drawRoundedRect(ctx, x, y, w, h, r, fill, stroke = null, lineWidth = 0) {
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
      if (fill) {
        ctx.fillStyle = fill;
        ctx.fill();
      }
      if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = lineWidth || 1;
        ctx.stroke();
      }
    }

    draw() {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, 960, 620);
      const bgGradient = ctx.createLinearGradient(0, 0, 0, 620);
      bgGradient.addColorStop(0, '#081028');
      bgGradient.addColorStop(1, '#050915');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, 960, 620);

      for (let i = 0; i <= 6; i += 1) {
        const x = i * (960 / 6);
        ctx.strokeStyle = 'rgba(84, 122, 196, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 620);
        ctx.stroke();
      }
      for (let y = 40; y < 620; y += 80) {
        ctx.strokeStyle = 'rgba(62, 96, 160, 0.18)';
        ctx.setLineDash([4, 7]);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(960, y);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      for (const b of this.blocks) {
        const shadowColor = 'rgba(8, 12, 28, 0.55)';
        this.drawRoundedRect(ctx, b.x - 2, b.y - 2, b.w + 4, b.h + 4, 8, shadowColor);
        this.drawRoundedRect(ctx, b.x, b.y, b.w, b.h, 7, 'rgba(255, 112, 164, 0.9)', 'rgba(255, 214, 235, 0.85)', 1.6);
      }

      const p = this.player;
      const x1 = p.x - p.w / 2;
      const y1 = p.y - p.h / 2;
      this.drawRoundedRect(ctx, x1 - 2, y1 - 2, p.w + 4, p.h + 4, 8, 'rgba(10, 16, 36, 0.62)');
      this.drawRoundedRect(ctx, x1, y1, p.w, p.h, 7, 'rgba(102, 230, 255, 0.95)', 'rgba(215, 249, 255, 0.95)', 1.6);

      for (const particle of this.particles) {
        ctx.globalAlpha = particle.life;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    loop = (ts) => {
      if (!this.running) return;
      const dt = clamp((ts - this.lastTs) / 1000, 0, 0.04);
      this.lastTs = ts;

      if (!this.paused && !this.gameOver) {
        const elapsed = (ts - this.startTs) / 1000;
        this.spawnTimer += dt;
        if (this.spawnTimer >= this.currentSpawnInterval(elapsed)) {
          this.spawnTimer = 0;
          this.spawnWave(elapsed);
        }
        this.updatePlayer();
        this.updateBlocks(dt);
      }

      this.updateParticles(dt);
      this.draw();
      this.syncUi();
      this.updateTokenShopUi();
      this.rafId = requestAnimationFrame(this.loop);
    };
  }

  let gameInstance = null;
  const ensureGame = () => {
    const mount = document.querySelector('#xyrexDodgeMount');
    if (!mount) return null;
    if (!gameInstance) gameInstance = new XyrexDodgeGame(mount);
    return gameInstance;
  };

  window.XyrexDodge = {
    start() {
      const game = ensureGame();
      if (!game) return;
      game.start();
    },
    stop() {
      gameInstance?.stop();
    },
    destroy() {
      gameInstance?.destroy();
      gameInstance = null;
    },
  };
})();
