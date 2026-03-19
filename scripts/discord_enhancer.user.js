// ==UserScript==
// @name         Discord Enhancer Exported Panel
// @namespace    https://discord.com/
// @version      3.0.0
// @description  Exported from the Python Discord Enhancer Control Center.
// @author       OpenAI Codex
// @match        https://discord.com/channels/*
// @match        https://discord.com/app
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(() => {
  "use strict";

  const SETTINGS = {
  "enabled": true,
  "widen_chat": false,
  "compact_mode": false,
  "focus_mode": false,
  "hide_member_list": false,
  "hide_active_now": false,
  "darken_theme": false,
  "input_gradient": true,
  "hide_typing_indicator": false,
  "hide_nitro_upsells": false,
  "hide_gift_button": false,
  "hide_stickers_button": false,
  "hide_emoji_button": false,
  "hide_apps_button": false,
  "hide_profile_effects": false,
  "hide_avatar_decorations": false,
  "blur_spoiler_media": false,
  "rounded_media": true,
  "timestamp_glow": false,
  "hide_help_button": false,
  "media_radius": 18,
  "panel_scale": 100,
  "panel_x": 24,
  "panel_y": 92,
  "panel_collapsed": false,
  "panel_visible": true
};
  const PANEL_ID = "discord-enhancer-python-panel";
  const STYLE_ID = "discord-enhancer-python-style";
  const BUBBLE_ID = "discord-enhancer-python-bubble";
  const STORAGE_KEY = "__discord_enhancer_python_export__";

  function saveState(nextState) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  }

  function loadState() {
    try {
      return { ...SETTINGS, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") };
    } catch {
      return { ...SETTINGS };
    }
  }

  let state = loadState();

  function ensureStyle() {
    let style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement("style");
      style.id = STYLE_ID;
      document.documentElement.appendChild(style);
    }

    style.textContent = `
      :root {
        --de-export-scale: 1.0;
      }

      #${PANEL_ID} {
        position: fixed;
        left: ${state.panel_x}px;
        top: ${state.panel_y}px;
        width: 330px;
        z-index: 2147483644;
        background: rgba(11, 14, 24, 0.95);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 18px;
        overflow: hidden;
        color: #f6f8ff;
        box-shadow: 0 24px 80px rgba(0, 0, 0, 0.42);
        backdrop-filter: blur(16px);
        transform: scale(var(--de-export-scale));
        transform-origin: top left;
        font-family: Inter, system-ui, sans-serif;
      }

      #${PANEL_ID}[hidden] {
        display: none !important;
      }

      #${PANEL_ID} * {
        box-sizing: border-box;
      }

      .de-export-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 14px 16px;
        background: linear-gradient(135deg, #7c5cff, #38bdf8);
      }

      .de-export-title {
        margin: 0;
        font-size: 15px;
        font-weight: 800;
      }

      .de-export-note {
        margin: 2px 0 0;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.84);
      }

      .de-export-head button,
      .de-export-body button {
        border: 0;
        border-radius: 12px;
        padding: 8px 11px;
        color: #f6f8ff;
        background: rgba(255, 255, 255, 0.14);
        cursor: pointer;
        font-weight: 700;
      }

      .de-export-body {
        display: ${state.panel_collapsed ? "none" : "block"};
        padding: 14px;
      }

      .de-export-section + .de-export-section {
        margin-top: 14px;
      }

      .de-export-section h3 {
        margin: 0 0 8px;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: rgba(255, 255, 255, 0.68);
      }

      .de-export-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        padding: 8px 0;
      }

      .de-export-row strong {
        display: block;
        font-size: 13px;
      }

      .de-export-row span {
        display: block;
        margin-top: 2px;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.68);
      }

      .de-export-toggle {
        position: relative;
        width: 44px;
        height: 24px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.16);
      }

      .de-export-toggle::after {
        content: "";
        position: absolute;
        top: 3px;
        left: 3px;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: #fff;
      }

      .de-export-toggle[data-on="true"] {
        background: #22c55e;
      }

      .de-export-toggle[data-on="true"]::after {
        left: 23px;
      }

      #${BUBBLE_ID} {
        position: fixed;
        right: 18px;
        bottom: 18px;
        z-index: 2147483643;
        border: 0;
        border-radius: 999px;
        padding: 12px 16px;
        background: linear-gradient(135deg, #7c5cff, #38bdf8);
        color: #fff;
        font: 700 13px/1 Inter, system-ui, sans-serif;
        box-shadow: 0 18px 40px rgba(0, 0, 0, 0.38);
        cursor: pointer;
      }

      img,
        video,
        [class*="imageWrapper"] {
          border-radius: 18px !important;
        }

form [class*="channelTextArea"],
        form [class*="textArea"],
        [class*="channelTextArea"] {
          background: linear-gradient(180deg, rgba(88, 101, 242, 0.12), rgba(88, 101, 242, 0.04)) !important;
          border: 1px solid rgba(120, 132, 255, 0.18) !important;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03), 0 12px 30px rgba(0, 0, 0, 0.16) !important;
          border-radius: 18px !important;
        }
    `;
  }

  function renderPanel() {
    let panel = document.getElementById(PANEL_ID);
    if (panel) {
      panel.remove();
    }

    panel = document.createElement("section");
    panel.id = PANEL_ID;
    panel.hidden = !state.panel_visible;
    panel.innerHTML = `
      <div class="de-export-head">
        <div>
          <h2 class="de-export-title">Discord Enhancer</h2>
          <p class="de-export-note">Managed by the Python control center. Press Right Shift to toggle this panel.</p>
        </div>
        <div style="display:flex;gap:8px;">
          <button id="de-export-collapse" type="button">${state.panel_collapsed ? "+" : "−"}</button>
          <button id="de-export-hide" type="button">✕</button>
        </div>
      </div>
      <div class="de-export-body" id="de-export-body">
        ${renderRows()}
      </div>
    `;
    document.body.appendChild(panel);

    panel.querySelector("#de-export-collapse")?.addEventListener("click", () => {
      state.panel_collapsed = !state.panel_collapsed;
      saveState(state);
      ensureStyle();
      renderPanel();
    });
    panel.querySelector("#de-export-hide")?.addEventListener("click", () => {
      state.panel_visible = false;
      saveState(state);
      syncVisibility();
    });

    panel.querySelectorAll("[data-setting-key]").forEach((node) => {
      node.addEventListener("click", () => {
        const key = node.getAttribute("data-setting-key");
        if (!key) return;
        state[key] = !state[key];
        saveState(state);
        ensureStyle();
        renderPanel();
        syncVisibility();
      });
    });
  }

  function renderRows() {
    const sections = [
      {
        title: "Core",
        items: [
          ["enabled", "Master enable", "Switch the exported enhancer on or off."],
          ["widen_chat", "Widen chat", "Expands the main chat column."],
          ["compact_mode", "Compact mode", "Tightens message spacing."],
          ["hide_member_list", "Hide member list", "Collapses the member sidebar."],
          ["hide_active_now", "Hide Active Now", "Hides the activity sidebar."],
          ["hide_gift_button", "Hide gift button", "Removes the gift action."],
          ["hide_stickers_button", "Hide sticker button", "Removes sticker access."],
          ["hide_emoji_button", "Hide emoji button", "Removes emoji access."],
        ]
      }
    ];

    return sections.map((section) => `
      <div class="de-export-section">
        <h3>${section.title}</h3>
        ${section.items.map(([key, title, description]) => `
          <div class="de-export-row">
            <div>
              <strong>${title}</strong>
              <span>${description}</span>
            </div>
            <div class="de-export-toggle" data-setting-key="${key}" data-on="${state[key] ? "true" : "false"}"></div>
          </div>
        `).join("")}
      </div>
    `).join("");
  }

  function syncVisibility() {
    const panel = document.getElementById(PANEL_ID);
    let bubble = document.getElementById(BUBBLE_ID);

    if (panel) {
      panel.hidden = !state.panel_visible;
    }

    if (!state.panel_visible) {
      if (!bubble) {
        bubble = document.createElement("button");
        bubble.id = BUBBLE_ID;
        bubble.textContent = "Open Enhancer";
        bubble.addEventListener("click", () => {
          state.panel_visible = true;
          saveState(state);
          syncVisibility();
        });
        document.body.appendChild(bubble);
      }
      return;
    }

    bubble?.remove();
  }

  function togglePanelFromKey(event) {
    if (event.code !== "ShiftRight") return;
    state.panel_visible = !state.panel_visible;
    saveState(state);
    syncVisibility();
  }

  function boot() {
    if (!document.body) {
      requestAnimationFrame(boot);
      return;
    }

    ensureStyle();
    renderPanel();
    syncVisibility();
    window.addEventListener("keydown", togglePanelFromKey, { passive: true });
  }

  boot();
})();
