// ==UserScript==
// @name         Discord Web Enhancer Panel
// @namespace    https://discord.com/
// @version      2.0.0
// @description  Adds a polished control panel with persistent Discord web quality-of-life enhancements.
// @author       You
// @match        https://discord.com/channels/*
// @match        https://discord.com/app
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(() => {
  "use strict";

  const STORAGE_KEY = "__discord_enhancer_settings_v2__";
  const PANEL_ID = "discord-enhancer-panel";
  const STYLE_ID = "discord-enhancer-style";
  const REOPEN_ID = "de-reopen-bubble";
  const MODAL_ID = "de-modal-overlay";
  const TOAST_ID = "de-toast";

  const defaults = {
    enabled: true,
    hideTypingIndicator: false,
    hideNitroUpsells: false,
    hideGiftButton: false,
    hideStickersButton: false,
    hideEmojiButton: false,
    hideAppsButton: false,
    widenChat: false,
    compactMode: false,
    blurSpoilerMedia: false,
    roundedMedia: true,
    focusMode: false,
    hideActiveNow: false,
    hideMemberList: false,
    hideProfileEffects: false,
    hideAvatarDecorations: false,
    darkenTheme: false,
    inputGradient: true,
    timestampOnHoverGlow: false,
    mediaRadius: 16,
    uiScale: 100,
    panelCollapsed: false,
    panelVisible: true,
    panelX: 20,
    panelY: 90
  };

  const featureSections = [
    {
      title: "Layout",
      items: [
        ["enabled", "Master enable", "Turns all enhancer tweaks on or off instantly."],
        ["widenChat", "Widen chat", "Expands the message area for a roomier layout."],
        ["compactMode", "Compact mode", "Tightens message spacing for denser reading."],
        ["focusMode", "Focus mode", "Removes visual clutter around the main chat column."],
        ["hideMemberList", "Hide member list", "Collapses the right sidebar member list."],
        ["hideActiveNow", "Hide Active Now", "Hides the friends page activity sidebar."],
        ["darkenTheme", "Darker surfaces", "Makes backgrounds cleaner and more consistent."],
        ["inputGradient", "Polished input bar", "Adds a subtle gradient and stronger input framing."]
      ]
    },
    {
      title: "Buttons and distractions",
      items: [
        ["hideTypingIndicator", "Hide typing indicator", "Removes the typing status line."],
        ["hideNitroUpsells", "Hide Nitro prompts", "Suppresses Nitro, upgrade, and upsell UI."],
        ["hideGiftButton", "Hide gift button", "Removes the gift action from the composer."],
        ["hideStickersButton", "Hide sticker button", "Removes the sticker picker shortcut."],
        ["hideEmojiButton", "Hide emoji button", "Removes the emoji picker shortcut."],
        ["hideAppsButton", "Hide Apps button", "Removes the Apps launcher from chat."],
        ["hideProfileEffects", "Hide profile effects", "Suppresses decorative profile effect layers."],
        ["hideAvatarDecorations", "Hide avatar decorations", "Hides avatar frames and decorations."]
      ]
    },
    {
      title: "Media and polish",
      items: [
        ["blurSpoilerMedia", "Blur spoiler media", "Keeps spoiler-style media blurred until hovered."],
        ["roundedMedia", "Round media corners", "Applies rounded corners to images and videos."],
        ["timestampOnHoverGlow", "Timestamp highlight", "Adds a subtle hover highlight to timestamps."]
      ]
    }
  ];

  let settings = loadSettings();
  let styleEl = null;
  let panelEl = null;
  let mutationObserver = null;
  let bodyObserver = null;
  let rafHandle = 0;
  let isDragging = false;
  let dragOffsetX = 0;
  let dragOffsetY = 0;
  let currentToastTimer = 0;

  function clamp(value, min, max, fallback) {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) return fallback;
    return Math.min(max, Math.max(min, numericValue));
  }

  function loadSettings() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...defaults };
      const parsed = JSON.parse(raw);
      return sanitizeSettings({ ...defaults, ...parsed });
    } catch {
      return { ...defaults };
    }
  }

  function sanitizeSettings(candidate) {
    const sanitized = { ...defaults, ...candidate };
    Object.keys(defaults).forEach((key) => {
      if (typeof defaults[key] === "boolean") {
        sanitized[key] = Boolean(sanitized[key]);
      }
    });

    sanitized.mediaRadius = clamp(sanitized.mediaRadius, 0, 40, defaults.mediaRadius);
    sanitized.uiScale = clamp(sanitized.uiScale, 80, 125, defaults.uiScale);
    sanitized.panelX = clamp(sanitized.panelX, 0, window.innerWidth || 1920, defaults.panelX);
    sanitized.panelY = clamp(sanitized.panelY, 0, window.innerHeight || 1080, defaults.panelY);
    return sanitized;
  }

  function saveSettings() {
    settings = sanitizeSettings(settings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }

  function qs(selector, root = document) {
    return root.querySelector(selector);
  }

  function qsa(selector, root = document) {
    return Array.from(root.querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function scheduleRefresh() {
    cancelAnimationFrame(rafHandle);
    rafHandle = requestAnimationFrame(() => {
      applyStyles();
      syncPanelVisibility();
      syncPanelInputs();
      enforcePanelBounds();
    });
  }

  function updateSetting(key, value, options = {}) {
    settings[key] = value;
    saveSettings();

    if (options.render !== false) {
      scheduleRefresh();
    }
  }

  function generateFeatureCss() {
    const featureCss = [];

    if (!settings.enabled) {
      return "";
    }

    if (settings.hideTypingIndicator) {
      featureCss.push(`
        [class*="typing"] {
          display: none !important;
        }
      `);
    }

    if (settings.hideNitroUpsells) {
      featureCss.push(`
        a[href*="discord.com/nitro"],
        a[href*="/store"],
        [class*="premium"],
        [class*="upsell"],
        [class*="nitro"],
        [aria-label*="Nitro" i] {
          display: none !important;
        }
      `);
    }

    if (settings.hideGiftButton) {
      featureCss.push(`
        button[aria-label*="Gift" i],
        button[aria-label*="Send a gift" i],
        [aria-label*="Gift" i][role="button"] {
          display: none !important;
        }
      `);
    }

    if (settings.hideStickersButton) {
      featureCss.push(`
        button[aria-label*="Sticker" i],
        [aria-label*="Open sticker picker" i],
        [aria-label*="sticker" i][role="button"] {
          display: none !important;
        }
      `);
    }

    if (settings.hideEmojiButton) {
      featureCss.push(`
        button[aria-label*="emoji" i],
        [aria-label*="Open emoji picker" i],
        [aria-label*="expression picker" i] {
          display: none !important;
        }
      `);
    }

    if (settings.hideAppsButton) {
      featureCss.push(`
        button[aria-label*="Apps" i],
        button[aria-label*="App Launcher" i],
        [aria-label*="Apps" i][role="button"] {
          display: none !important;
        }
      `);
    }

    if (settings.widenChat) {
      featureCss.push(`
        main[class*="chatContent"],
        [class*="chatContent"] {
          width: 100% !important;
          max-width: 100% !important;
          flex: 1 1 auto !important;
        }

        [class*="content"] > [class*="chat"] {
          width: 100% !important;
          flex: 1 1 auto !important;
        }
      `);
    }

    if (settings.compactMode) {
      featureCss.push(`
        [class*="messageListItem"] {
          margin-top: 0 !important;
        }

        [class*="message"] {
          padding-top: 0 !important;
          padding-bottom: 0 !important;
        }

        [class*="avatar"] {
          transform: scale(0.92);
          transform-origin: center top;
        }

        [class*="markup"] {
          line-height: 1.3 !important;
        }
      `);
    }

    if (settings.focusMode) {
      featureCss.push(`
        nav[aria-label="Servers sidebar"],
        [data-list-id="guildsnav"],
        [class*="toolbar"] [aria-label*="Inbox" i],
        [class*="toolbar"] [aria-label*="Help" i],
        [class*="toolbar"] [aria-label*="Notification" i] {
          opacity: 0.72;
          transition: opacity 0.18s ease;
        }

        nav[aria-label="Servers sidebar"]:hover,
        [data-list-id="guildsnav"]:hover,
        [class*="toolbar"] [aria-label*="Inbox" i]:hover,
        [class*="toolbar"] [aria-label*="Help" i]:hover,
        [class*="toolbar"] [aria-label*="Notification" i]:hover {
          opacity: 1;
        }
      `);
    }

    if (settings.hideActiveNow) {
      featureCss.push(`
        [class*="nowPlayingColumn"],
        [class*="activeNow"],
        aside[aria-label*="Active Now" i] {
          display: none !important;
        }
      `);
    }

    if (settings.hideMemberList) {
      featureCss.push(`
        [class*="membersWrap"],
        aside[aria-label*="Member List" i],
        [class*="peopleList"] + [class*="nowPlayingColumn"] {
          display: none !important;
        }
      `);
    }

    if (settings.hideProfileEffects) {
      featureCss.push(`
        [class*="profileEffects"],
        [class*="avatarDecorationHint"],
        [class*="profileEffect"] {
          display: none !important;
        }
      `);
    }

    if (settings.hideAvatarDecorations) {
      featureCss.push(`
        [class*="avatarDecoration"],
        [class*="avatarStack"] svg,
        [mask*="avatar-decoration"] {
          display: none !important;
        }
      `);
    }

    if (settings.blurSpoilerMedia) {
      featureCss.push(`
        [class*="spoiler"] img,
        [class*="spoiler"] video,
        [class*="obscured"] img,
        [class*="obscured"] video {
          filter: blur(14px) saturate(0.92) !important;
          transition: filter 0.18s ease;
        }

        [class*="spoiler"]:hover img,
        [class*="spoiler"]:hover video,
        [class*="obscured"]:hover img,
        [class*="obscured"]:hover video {
          filter: blur(0) saturate(1) !important;
        }
      `);
    }

    if (settings.roundedMedia) {
      featureCss.push(`
        img,
        video,
        [class*="imageWrapper"] {
          border-radius: var(--de-media-radius) !important;
        }
      `);
    }

    if (settings.darkenTheme) {
      featureCss.push(`
        :root {
          --background-primary: #0f1117 !important;
          --background-secondary: #141824 !important;
          --background-secondary-alt: #10131d !important;
          --background-tertiary: #0c0f17 !important;
          --channeltextarea-background: #121725 !important;
        }
      `);
    }

    if (settings.inputGradient) {
      featureCss.push(`
        form [class*="channelTextArea"],
        form [class*="textArea"],
        [class*="channelTextArea"] {
          background: linear-gradient(180deg, rgba(88, 101, 242, 0.12), rgba(88, 101, 242, 0.04)) !important;
          border: 1px solid rgba(120, 132, 255, 0.18) !important;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03), 0 12px 30px rgba(0, 0, 0, 0.16) !important;
          border-radius: 18px !important;
        }
      `);
    }

    if (settings.timestampOnHoverGlow) {
      featureCss.push(`
        time {
          transition: color 0.18s ease, text-shadow 0.18s ease;
        }

        li:hover time,
        [class*="message"]:hover time {
          color: #dfe4ff !important;
          text-shadow: 0 0 12px rgba(88, 101, 242, 0.45);
        }
      `);
    }

    return featureCss.join("\n");
  }

  function applyStyles() {
    const uiScale = clamp(settings.uiScale, 80, 125, defaults.uiScale);
    const mediaRadius = clamp(settings.mediaRadius, 0, 40, defaults.mediaRadius);

    if (!styleEl || !document.contains(styleEl)) {
      styleEl = document.createElement("style");
      styleEl.id = STYLE_ID;
      document.documentElement.appendChild(styleEl);
    }

    styleEl.textContent = `
      :root {
        --de-ui-scale: ${uiScale / 100};
        --de-media-radius: ${mediaRadius}px;
        --de-panel-bg: rgba(15, 18, 27, 0.94);
        --de-panel-border: rgba(255, 255, 255, 0.1);
        --de-panel-text: #f6f8ff;
        --de-panel-muted: rgba(230, 235, 255, 0.68);
        --de-panel-accent: #7c8cff;
        --de-panel-accent-2: #8b5cf6;
        --de-panel-success: #22c55e;
        --de-panel-danger: #f43f5e;
      }

      #${PANEL_ID} {
        position: fixed;
        left: ${settings.panelX}px;
        top: ${settings.panelY}px;
        width: 360px;
        max-width: calc(100vw - 24px);
        max-height: calc(100vh - 24px);
        overflow: hidden;
        z-index: 2147483644;
        display: flex;
        flex-direction: column;
        background: radial-gradient(circle at top, rgba(124, 140, 255, 0.2), transparent 35%), var(--de-panel-bg);
        color: var(--de-panel-text);
        border: 1px solid var(--de-panel-border);
        border-radius: 20px;
        box-shadow: 0 24px 80px rgba(0, 0, 0, 0.42);
        font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        backdrop-filter: blur(18px);
        user-select: none;
        transform: scale(var(--de-ui-scale));
        transform-origin: top left;
      }

      #${PANEL_ID}[hidden] {
        display: none !important;
      }

      #${PANEL_ID},
      #${PANEL_ID} * {
        box-sizing: border-box;
      }

      #${PANEL_ID} button,
      #${PANEL_ID} input,
      #${PANEL_ID} textarea {
        font: inherit;
      }

      .de-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 14px 16px;
        cursor: move;
        background: linear-gradient(135deg, rgba(88, 101, 242, 0.92), rgba(139, 92, 246, 0.92));
      }

      .de-header-main {
        min-width: 0;
      }

      .de-title {
        margin: 0;
        font-size: 16px;
        font-weight: 800;
        letter-spacing: 0.01em;
      }

      .de-subtitle {
        margin: 2px 0 0;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.82);
      }

      .de-header-actions {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .de-icon-btn,
      .de-action-btn,
      .de-pill-btn {
        border: 0;
        color: var(--de-panel-text);
        cursor: pointer;
        transition: transform 0.16s ease, background 0.16s ease, opacity 0.16s ease;
      }

      .de-icon-btn:hover,
      .de-action-btn:hover,
      .de-pill-btn:hover {
        transform: translateY(-1px);
      }

      .de-icon-btn {
        width: 34px;
        height: 34px;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.14);
        font-size: 16px;
        font-weight: 800;
      }

      .de-body {
        display: ${settings.panelCollapsed ? "none" : "flex"};
        flex-direction: column;
        gap: 14px;
        padding: 14px;
        overflow: auto;
      }

      .de-status-card,
      .de-section,
      .de-tool-card {
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 16px;
        background: rgba(255, 255, 255, 0.035);
      }

      .de-status-card {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 12px;
        padding: 12px 14px;
        align-items: center;
      }

      .de-status-title {
        margin: 0;
        font-size: 14px;
        font-weight: 700;
      }

      .de-status-text {
        margin: 3px 0 0;
        font-size: 12px;
        color: var(--de-panel-muted);
      }

      .de-master-chip {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        border-radius: 999px;
        padding: 8px 12px;
        font-size: 12px;
        font-weight: 800;
        background: rgba(34, 197, 94, 0.14);
        color: #bcffd0;
      }

      .de-master-chip[data-disabled="true"] {
        background: rgba(244, 63, 94, 0.14);
        color: #ffc2d0;
      }

      .de-section {
        padding: 12px;
      }

      .de-section-title {
        margin: 0 0 10px;
        font-size: 13px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: rgba(230, 235, 255, 0.78);
      }

      .de-feature-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .de-feature-row {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 12px;
        align-items: center;
      }

      .de-feature-label {
        display: flex;
        flex-direction: column;
        gap: 3px;
      }

      .de-feature-title {
        font-size: 14px;
        font-weight: 700;
      }

      .de-feature-desc {
        font-size: 12px;
        color: var(--de-panel-muted);
        line-height: 1.35;
      }

      .de-toggle {
        position: relative;
        width: 46px;
        height: 26px;
        appearance: none;
        border: 0;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.16);
        cursor: pointer;
        transition: background 0.16s ease;
        flex: 0 0 auto;
      }

      .de-toggle::after {
        content: "";
        position: absolute;
        top: 3px;
        left: 3px;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #ffffff;
        box-shadow: 0 6px 18px rgba(0, 0, 0, 0.2);
        transition: transform 0.16s ease;
      }

      .de-toggle:checked {
        background: linear-gradient(135deg, var(--de-panel-success), #16a34a);
      }

      .de-toggle:checked::after {
        transform: translateX(20px);
      }

      .de-slider-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
      }

      .de-slider-card {
        padding: 12px;
        border-radius: 16px;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.06);
      }

      .de-slider-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        margin-bottom: 8px;
      }

      .de-slider-title {
        font-size: 13px;
        font-weight: 700;
      }

      .de-slider-value {
        font-size: 12px;
        color: var(--de-panel-muted);
      }

      .de-slider {
        width: 100%;
        accent-color: var(--de-panel-accent);
        cursor: pointer;
      }

      .de-tool-grid,
      .de-footer-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
      }

      .de-action-btn,
      .de-pill-btn {
        border-radius: 14px;
        padding: 11px 12px;
        background: rgba(255, 255, 255, 0.08);
        font-weight: 800;
      }

      .de-action-btn:hover,
      .de-pill-btn:hover {
        background: rgba(255, 255, 255, 0.14);
      }

      .de-pill-btn.primary {
        background: linear-gradient(135deg, var(--de-panel-accent), var(--de-panel-accent-2));
      }

      .de-note {
        font-size: 12px;
        line-height: 1.45;
        color: var(--de-panel-muted);
        padding: 0 2px;
      }

      #${REOPEN_ID} {
        position: fixed;
        right: 18px;
        bottom: 18px;
        z-index: 2147483643;
        display: inline-flex;
        align-items: center;
        gap: 10px;
        border: 0;
        border-radius: 999px;
        padding: 12px 16px;
        background: linear-gradient(135deg, rgba(88, 101, 242, 0.96), rgba(139, 92, 246, 0.96));
        color: #ffffff;
        font: 700 13px/1 Inter, system-ui, sans-serif;
        box-shadow: 0 18px 40px rgba(0, 0, 0, 0.38);
        cursor: pointer;
      }

      #${TOAST_ID} {
        position: fixed;
        left: 50%;
        bottom: 24px;
        transform: translateX(-50%);
        z-index: 2147483645;
        min-width: 220px;
        max-width: min(92vw, 420px);
        padding: 12px 16px;
        border-radius: 14px;
        background: rgba(17, 20, 31, 0.94);
        border: 1px solid rgba(255, 255, 255, 0.08);
        color: #f6f8ff;
        font: 700 13px/1.4 Inter, system-ui, sans-serif;
        box-shadow: 0 18px 48px rgba(0, 0, 0, 0.35);
      }

      #${MODAL_ID} {
        position: fixed;
        inset: 0;
        z-index: 2147483646;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        background: rgba(5, 7, 12, 0.75);
        backdrop-filter: blur(10px);
      }

      .de-modal {
        width: min(920px, 96vw);
        max-height: 88vh;
        overflow: auto;
        border-radius: 20px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        background: rgba(18, 21, 33, 0.98);
        color: #f6f8ff;
        box-shadow: 0 24px 80px rgba(0, 0, 0, 0.48);
        padding: 18px;
        font-family: Inter, system-ui, sans-serif;
      }

      .de-modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        margin-bottom: 10px;
      }

      .de-modal-title {
        margin: 0;
        font-size: 20px;
      }

      .de-modal-subtitle {
        margin: 0 0 14px;
        font-size: 13px;
        color: var(--de-panel-muted);
      }

      .de-chunk-card {
        padding: 12px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 16px;
        background: rgba(255, 255, 255, 0.03);
      }

      .de-chunk-card + .de-chunk-card {
        margin-top: 12px;
      }

      .de-chunk-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        margin-bottom: 8px;
      }

      .de-chunk-meta {
        font-size: 12px;
        color: var(--de-panel-muted);
      }

      .de-chunk-textarea {
        width: 100%;
        min-height: 140px;
        resize: vertical;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 14px;
        background: rgba(10, 12, 20, 0.94);
        color: #f6f8ff;
        padding: 12px;
      }

      ${generateFeatureCss()}
    `;
  }

  function createPanel() {
    if (panelEl && document.contains(panelEl)) {
      panelEl.remove();
    }

    const panel = document.createElement("section");
    panel.id = PANEL_ID;
    panel.innerHTML = `
      <div class="de-header" id="de-drag-handle">
        <div class="de-header-main">
          <h2 class="de-title">Discord Enhancer</h2>
          <p class="de-subtitle">Persistent live tweaks with zero reload required.</p>
        </div>
        <div class="de-header-actions">
          <button class="de-icon-btn" id="de-collapse-btn" type="button" aria-label="${settings.panelCollapsed ? "Expand panel" : "Collapse panel"}">${settings.panelCollapsed ? "+" : "−"}</button>
          <button class="de-icon-btn" id="de-hide-btn" type="button" aria-label="Hide panel">✕</button>
        </div>
      </div>
      <div class="de-body" id="de-panel-body">
        <div class="de-status-card">
          <div>
            <p class="de-status-title">Live enhancer state</p>
            <p class="de-status-text">Every toggle saves instantly and reapplies automatically after reload.</p>
          </div>
          <div class="de-master-chip" id="de-master-chip" data-disabled="${settings.enabled ? "false" : "true"}">
            ${settings.enabled ? "Enabled" : "Disabled"}
          </div>
        </div>
        ${featureSections.map(renderSection).join("")}
        <div class="de-section">
          <h3 class="de-section-title">Fine tuning</h3>
          <div class="de-slider-grid">
            ${renderSliderCard("mediaRadius", "Media roundness", `${settings.mediaRadius}px`, 0, 40, 1)}
            ${renderSliderCard("uiScale", "Panel scale", `${settings.uiScale}%`, 80, 125, 1)}
          </div>
        </div>
        <div class="de-tool-card de-section">
          <h3 class="de-section-title">Draft tools</h3>
          <div class="de-tool-grid">
            <button class="de-action-btn" id="de-split-btn" type="button">Split draft</button>
            <button class="de-action-btn" id="de-download-btn" type="button">Download TXT</button>
          </div>
        </div>
        <div class="de-section">
          <h3 class="de-section-title">Panel</h3>
          <div class="de-footer-grid">
            <button class="de-pill-btn" id="de-reset-btn" type="button">Reset settings</button>
            <button class="de-pill-btn primary" id="de-restore-btn" type="button">Center panel</button>
          </div>
        </div>
        <div class="de-note">
          The panel is draggable, fully persistent, and designed to avoid expensive DOM loops. Use the hide button to minimize it to a floating reopen chip.
        </div>
      </div>
    `;

    document.body.appendChild(panel);
    panelEl = panel;
    bindPanelEvents();
    syncPanelVisibility();
    enforcePanelBounds();
  }

  function renderSection(section) {
    return `
      <div class="de-section">
        <h3 class="de-section-title">${escapeHtml(section.title)}</h3>
        <div class="de-feature-list">
          ${section.items.map(([key, title, description]) => `
            <div class="de-feature-row">
              <label class="de-feature-label" for="de-toggle-${escapeHtml(key)}">
                <span class="de-feature-title">${escapeHtml(title)}</span>
                <span class="de-feature-desc">${escapeHtml(description)}</span>
              </label>
              <input class="de-toggle" id="de-toggle-${escapeHtml(key)}" data-key="${escapeHtml(key)}" type="checkbox" ${settings[key] ? "checked" : ""}>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  function renderSliderCard(key, title, valueText, min, max, step) {
    return `
      <div class="de-slider-card">
        <div class="de-slider-head">
          <span class="de-slider-title">${escapeHtml(title)}</span>
          <span class="de-slider-value" id="de-${escapeHtml(key)}-value">${escapeHtml(valueText)}</span>
        </div>
        <input class="de-slider" data-slider="${escapeHtml(key)}" type="range" min="${min}" max="${max}" step="${step}" value="${settings[key]}">
      </div>
    `;
  }

  function bindPanelEvents() {
    if (!panelEl) return;

    qsa("input[data-key]", panelEl).forEach((input) => {
      input.addEventListener("change", () => {
        updateSetting(input.dataset.key, input.checked);
      });
    });

    qsa("input[data-slider]", panelEl).forEach((slider) => {
      slider.addEventListener("input", () => {
        const key = slider.dataset.slider;
        updateSetting(key, Number(slider.value));
      });
    });

    qs("#de-collapse-btn", panelEl)?.addEventListener("click", () => {
      updateSetting("panelCollapsed", !settings.panelCollapsed);
    });

    qs("#de-hide-btn", panelEl)?.addEventListener("click", () => {
      updateSetting("panelVisible", false);
      showToast("Enhancer hidden. Use the floating button to reopen it.");
    });

    qs("#de-reset-btn", panelEl)?.addEventListener("click", () => {
      settings = { ...defaults, panelX: settings.panelX, panelY: settings.panelY, panelVisible: true };
      saveSettings();
      scheduleRefresh();
      showToast("Enhancer settings reset.");
    });

    qs("#de-restore-btn", panelEl)?.addEventListener("click", () => {
      settings.panelX = Math.max(12, Math.round((window.innerWidth - 360) / 2));
      settings.panelY = 36;
      settings.panelVisible = true;
      saveSettings();
      scheduleRefresh();
      showToast("Panel position reset.");
    });

    qs("#de-split-btn", panelEl)?.addEventListener("click", openSplitDraftModal);
    qs("#de-download-btn", panelEl)?.addEventListener("click", downloadDraftAsTxt);

    const dragHandle = qs("#de-drag-handle", panelEl);
    dragHandle?.addEventListener("mousedown", (event) => {
      if (event.button !== 0) return;
      if (event.target instanceof HTMLElement && event.target.closest("button")) return;
      isDragging = true;
      const rect = panelEl.getBoundingClientRect();
      dragOffsetX = event.clientX - rect.left;
      dragOffsetY = event.clientY - rect.top;
      event.preventDefault();
    });
  }

  function syncPanelInputs() {
    if (!panelEl || !document.contains(panelEl)) return;

    qsa("input[data-key]", panelEl).forEach((input) => {
      const key = input.dataset.key;
      const nextValue = Boolean(settings[key]);
      if (input.checked !== nextValue) {
        input.checked = nextValue;
      }
    });

    qsa("input[data-slider]", panelEl).forEach((slider) => {
      const key = slider.dataset.slider;
      const nextValue = String(settings[key]);
      if (slider.value !== nextValue) {
        slider.value = nextValue;
      }

      const label = qs(`#de-${key}-value`, panelEl);
      if (label) {
        label.textContent = key === "uiScale" ? `${settings[key]}%` : `${settings[key]}px`;
      }
    });

    const collapseButton = qs("#de-collapse-btn", panelEl);
    if (collapseButton) {
      collapseButton.textContent = settings.panelCollapsed ? "+" : "−";
      collapseButton.setAttribute("aria-label", settings.panelCollapsed ? "Expand panel" : "Collapse panel");
    }

    const body = qs("#de-panel-body", panelEl);
    if (body) {
      body.style.display = settings.panelCollapsed ? "none" : "flex";
    }

    const chip = qs("#de-master-chip", panelEl);
    if (chip) {
      chip.textContent = settings.enabled ? "Enabled" : "Disabled";
      chip.dataset.disabled = settings.enabled ? "false" : "true";
    }
  }

  function syncPanelVisibility() {
    if (!panelEl || !document.contains(panelEl)) return;
    panelEl.hidden = !settings.panelVisible;
    toggleReopenBubble(!settings.panelVisible);
  }

  function toggleReopenBubble(shouldShow) {
    let reopenBubble = qs(`#${REOPEN_ID}`);

    if (shouldShow) {
      if (!reopenBubble) {
        reopenBubble = document.createElement("button");
        reopenBubble.id = REOPEN_ID;
        reopenBubble.type = "button";
        reopenBubble.innerHTML = "<span>✨</span><span>Open Enhancer</span>";
        reopenBubble.addEventListener("click", () => {
          updateSetting("panelVisible", true);
          showToast("Enhancer reopened.");
        });
        document.body.appendChild(reopenBubble);
      }
      return;
    }

    reopenBubble?.remove();
  }

  function enforcePanelBounds() {
    if (!panelEl || !document.contains(panelEl)) return;

    const scale = clamp(settings.uiScale, 80, 125, defaults.uiScale) / 100;
    const width = (panelEl.offsetWidth || 360) * scale;
    const height = (panelEl.offsetHeight || 560) * scale;
    const maxX = Math.max(0, window.innerWidth - width - 8);
    const maxY = Math.max(0, window.innerHeight - height - 8);

    settings.panelX = clamp(settings.panelX, 0, maxX, defaults.panelX);
    settings.panelY = clamp(settings.panelY, 0, maxY, defaults.panelY);

    panelEl.style.left = `${settings.panelX}px`;
    panelEl.style.top = `${settings.panelY}px`;
  }

  function onPointerMove(event) {
    if (!isDragging || !panelEl) return;

    const scale = clamp(settings.uiScale, 80, 125, defaults.uiScale) / 100;
    const nextX = event.clientX - dragOffsetX * scale;
    const nextY = event.clientY - dragOffsetY * scale;

    settings.panelX = Math.round(nextX);
    settings.panelY = Math.round(nextY);
    enforcePanelBounds();
  }

  function onPointerUp() {
    if (!isDragging) return;
    isDragging = false;
    saveSettings();
  }

  function showToast(message) {
    let toast = qs(`#${TOAST_ID}`);
    if (!toast) {
      toast = document.createElement("div");
      toast.id = TOAST_ID;
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    clearTimeout(currentToastTimer);
    currentToastTimer = window.setTimeout(() => {
      toast?.remove();
    }, 2200);
  }

  function isVisible(element) {
    if (!(element instanceof HTMLElement)) return false;
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none";
  }

  function getDraftEditor() {
    const selectors = [
      '[role="textbox"][contenteditable="true"]',
      '[data-slate-editor="true"]',
      'div[contenteditable="true"][aria-label*="message" i]',
      'div[contenteditable="true"]'
    ];

    for (const selector of selectors) {
      const candidates = qsa(selector);
      const match = candidates.find((node) => isVisible(node) && !node.closest(`#${PANEL_ID}`));
      if (match) {
        return match;
      }
    }

    return null;
  }

  function getDraftText() {
    const editor = getDraftEditor();
    if (!editor) return "";
    return (editor.innerText || editor.textContent || "").replace(/\u00a0/g, " ");
  }

  function splitIntoChunks(text, maxLength = 2000) {
    const normalizedText = text.replace(/\r/g, "").trim();
    if (!normalizedText) return [];

    const chunks = [];
    let remaining = normalizedText;

    while (remaining.length > maxLength) {
      const preview = remaining.slice(0, maxLength);
      let splitIndex = Math.max(
        preview.lastIndexOf("\n\n"),
        preview.lastIndexOf("\n"),
        preview.lastIndexOf(". "),
        preview.lastIndexOf("! "),
        preview.lastIndexOf("? "),
        preview.lastIndexOf(", "),
        preview.lastIndexOf(" ")
      );

      if (splitIndex < Math.floor(maxLength * 0.55)) {
        splitIndex = maxLength;
      }

      const chunk = remaining.slice(0, splitIndex).trim();
      if (chunk) {
        chunks.push(chunk);
      }
      remaining = remaining.slice(splitIndex).trimStart();
    }

    if (remaining) {
      chunks.push(remaining);
    }

    return chunks;
  }

  function closeModal() {
    qs(`#${MODAL_ID}`)?.remove();
  }

  function openSplitDraftModal() {
    const draft = getDraftText();
    if (!draft.trim()) {
      showToast("No draft text found in the current message box.");
      return;
    }

    closeModal();
    const chunks = splitIntoChunks(draft, 2000);

    const overlay = document.createElement("div");
    overlay.id = MODAL_ID;
    overlay.innerHTML = `
      <div class="de-modal" role="dialog" aria-modal="true" aria-label="Split draft dialog">
        <div class="de-modal-header">
          <div>
            <h2 class="de-modal-title">Split draft</h2>
            <p class="de-modal-subtitle">${chunks.length} chunk${chunks.length === 1 ? "" : "s"} ready to copy in order.</p>
          </div>
          <button class="de-pill-btn primary" id="de-modal-close" type="button">Close</button>
        </div>
        <div id="de-chunks-wrap"></div>
      </div>
    `;

    const chunkWrap = qs("#de-chunks-wrap", overlay);
    chunks.forEach((chunk, index) => {
      const card = document.createElement("section");
      card.className = "de-chunk-card";
      card.innerHTML = `
        <div class="de-chunk-header">
          <div>
            <strong>Part ${index + 1}</strong>
            <div class="de-chunk-meta">${chunk.length} characters</div>
          </div>
          <button class="de-pill-btn" type="button" data-copy-index="${index}">Copy</button>
        </div>
        <textarea class="de-chunk-textarea" readonly>${escapeHtml(chunk)}</textarea>
      `;
      chunkWrap.appendChild(card);
    });

    document.body.appendChild(overlay);

    qs("#de-modal-close", overlay)?.addEventListener("click", closeModal);
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) closeModal();
    });

    qsa("button[data-copy-index]", overlay).forEach((button) => {
      button.addEventListener("click", async () => {
        const index = Number(button.getAttribute("data-copy-index"));
        const originalLabel = button.textContent;
        try {
          await navigator.clipboard.writeText(chunks[index]);
          button.textContent = "Copied";
          showToast(`Copied part ${index + 1}.`);
          window.setTimeout(() => {
            button.textContent = originalLabel;
          }, 1000);
        } catch {
          showToast("Clipboard copy failed.");
        }
      });
    });
  }

  function downloadDraftAsTxt() {
    const draft = getDraftText();
    if (!draft.trim()) {
      showToast("No draft text found in the current message box.");
      return;
    }

    const blob = new Blob([draft], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "discord-draft.txt";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    showToast("Draft downloaded as TXT.");
  }

  function observePage() {
    mutationObserver?.disconnect();
    mutationObserver = new MutationObserver(() => {
      if (!document.body) return;

      if (!qs(`#${PANEL_ID}`) && settings.panelVisible) {
        createPanel();
      }

      if (!qs(`#${STYLE_ID}`)) {
        applyStyles();
      }

      if (settings.panelVisible && !qs(`#${PANEL_ID}`)) {
        createPanel();
      }

      if (!settings.panelVisible) {
        toggleReopenBubble(true);
      }
    });

    mutationObserver.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  function ensureMounted() {
    if (!document.body) {
      requestAnimationFrame(ensureMounted);
      return;
    }

    if (!styleEl || !document.contains(styleEl)) {
      applyStyles();
    }

    if (!panelEl || !document.contains(panelEl)) {
      createPanel();
    }

    scheduleRefresh();
    observePage();
  }

  function registerGlobalEvents() {
    window.addEventListener("mousemove", onPointerMove, { passive: true });
    window.addEventListener("mouseup", onPointerUp, { passive: true });
    window.addEventListener("resize", () => {
      enforcePanelBounds();
      saveSettings();
    });
    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeModal();
      }
    });

    window.addEventListener("storage", (event) => {
      if (event.key === STORAGE_KEY) {
        settings = loadSettings();
        scheduleRefresh();
      }
    });

    bodyObserver?.disconnect();
    bodyObserver = new MutationObserver(() => {
      if (!qs(`#${PANEL_ID}`) && document.body) {
        createPanel();
      }
    });

    bodyObserver.observe(document.documentElement, { childList: true, subtree: false });
  }

  registerGlobalEvents();
  ensureMounted();
})();
