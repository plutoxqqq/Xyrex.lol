// ==UserScript==
// @name         Discord Web Enhancer Panel
// @namespace    https://discord.com/
// @version      1.0.0
// @description  Adds a customizable GUI with Discord web quality-of-life tweaks.
// @author       You
// @match        https://discord.com/channels/*
// @match        https://discord.com/app
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(() => {
  "use strict";

  const STORAGE_KEY = "__discord_enhancer_settings_v1__";

  const defaults = {
    enabled: true,
    hideTyping: false,
    hideNitro: false,
    hideGiftButton: false,
    widenChat: false,
    compactMode: false,
    blurNsfwMedia: false,
    mediaRadius: 16,
    uiScale: 100,
    panelCollapsed: false,
    panelX: 20,
    panelY: 90
  };

  let settings = loadSettings();
  let styleEl = null;
  let panelEl = null;
  let isDragging = false;
  let dragOffsetX = 0;
  let dragOffsetY = 0;

  function loadSettings() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...defaults };
      return { ...defaults, ...JSON.parse(raw) };
    } catch {
      return { ...defaults };
    }
  }

  function saveSettings() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }

  function qs(sel, root = document) {
    return root.querySelector(sel);
  }

  function qsa(sel, root = document) {
    return [...root.querySelectorAll(sel)];
  }

  function cssEscape(str) {
    return String(str).replace(/[<>&]/g, "");
  }

  function injectStyles() {
    if (styleEl) styleEl.remove();
    styleEl = document.createElement("style");
    styleEl.id = "discord-enhancer-style";

    const uiScale = Math.max(75, Math.min(125, Number(settings.uiScale) || 100));
    const mediaRadius = Math.max(0, Math.min(40, Number(settings.mediaRadius) || 16));

    styleEl.textContent = `
      :root {
        --de-ui-scale: ${uiScale / 100};
        --de-media-radius: ${mediaRadius}px;
      }

      #discord-enhancer-panel {
        position: fixed;
        left: ${settings.panelX}px;
        top: ${settings.panelY}px;
        width: 320px;
        z-index: 999999;
        background: rgba(20, 22, 26, 0.96);
        color: #fff;
        border: 1px solid rgba(255,255,255,0.10);
        border-radius: 16px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.35);
        font-family: Inter, system-ui, sans-serif;
        backdrop-filter: blur(14px);
        overflow: hidden;
        user-select: none;
        transform: scale(var(--de-ui-scale));
        transform-origin: top left;
      }

      #discord-enhancer-panel * {
        box-sizing: border-box;
      }

      #discord-enhancer-header {
        padding: 12px 14px;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: space-between;
        cursor: move;
        background: linear-gradient(135deg, #5865f2, #8b5cf6);
      }

      #discord-enhancer-header button {
        border: 0;
        background: rgba(255,255,255,0.16);
        color: white;
        border-radius: 10px;
        padding: 6px 10px;
        cursor: pointer;
        font-weight: 700;
      }

      #discord-enhancer-body {
        display: ${settings.panelCollapsed ? "none" : "block"};
        padding: 12px;
      }

      .de-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 10px;
      }

      .de-row label {
        font-size: 14px;
        line-height: 1.2;
        color: rgba(255,255,255,0.95);
      }

      .de-toggle {
        appearance: none;
        width: 42px;
        height: 24px;
        border-radius: 999px;
        background: #555;
        position: relative;
        cursor: pointer;
        transition: 0.2s ease;
        flex: 0 0 auto;
      }

      .de-toggle::after {
        content: "";
        position: absolute;
        left: 3px;
        top: 3px;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: white;
        transition: 0.2s ease;
      }

      .de-toggle:checked {
        background: #22c55e;
      }

      .de-toggle:checked::after {
        left: 21px;
      }

      .de-slider-wrap {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-bottom: 12px;
      }

      .de-slider-wrap label {
        font-size: 13px;
        color: rgba(255,255,255,0.92);
      }

      .de-slider-wrap input[type="range"] {
        width: 100%;
      }

      .de-actions {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        margin-top: 10px;
      }

      .de-actions button,
      .de-footer button {
        border: 0;
        border-radius: 12px;
        padding: 10px 12px;
        cursor: pointer;
        font-weight: 700;
      }

      .de-actions button {
        background: #2b2d31;
        color: white;
      }

      .de-actions button:hover {
        background: #3a3d44;
      }

      .de-footer {
        display: flex;
        gap: 8px;
        margin-top: 12px;
      }

      .de-footer button {
        flex: 1;
        background: #5865f2;
        color: white;
      }

      .de-footer button.secondary {
        background: #3a3d44;
      }

      .de-note {
        margin-top: 8px;
        font-size: 12px;
        color: rgba(255,255,255,0.65);
        line-height: 1.35;
      }

      /* Functional CSS tweaks */

      ${settings.enabled && settings.hideTyping ? `
      [class*="typing"] {
        display: none !important;
      }` : ""}

      ${settings.enabled && settings.hideNitro ? `
      a[href*="discord.com/nitro"],
      [class*="premium"],
      [class*="upsell"],
      [class*="nitro"] {
        display: none !important;
      }` : ""}

      ${settings.enabled && settings.hideGiftButton ? `
      button[aria-label*="Gift" i],
      button[aria-label*="Send a gift" i] {
        display: none !important;
      }` : ""}

      ${settings.enabled && settings.widenChat ? `
      [class*="chatContent"] {
        max-width: 100% !important;
        width: 100% !important;
      }
      [class*="container"] [class*="chat"] {
        width: 100% !important;
      }` : ""}

      ${settings.enabled && settings.compactMode ? `
      [class*="messageListItem"] {
        margin-top: 0 !important;
        padding-top: 1px !important;
        padding-bottom: 1px !important;
      }
      [class*="avatar"] {
        transform: scale(0.9);
      }
      [class*="messageContent"] {
        line-height: 1.25 !important;
      }` : ""}

      ${settings.enabled && settings.blurNsfwMedia ? `
      img,
      video {
        border-radius: var(--de-media-radius) !important;
      }
      [class*="spoiler"] img,
      [class*="spoiler"] video,
      [class*="obscured"] img,
      [class*="obscured"] video {
        filter: blur(14px) !important;
        transition: filter 0.2s ease;
      }
      [class*="spoiler"]:hover img,
      [class*="spoiler"]:hover video,
      [class*="obscured"]:hover img,
      [class*="obscured"]:hover video {
        filter: blur(0px) !important;
      }` : `
      img,
      video {
        border-radius: var(--de-media-radius) !important;
      }`}
    `;

    document.documentElement.appendChild(styleEl);
  }

  function createPanel() {
    if (panelEl) panelEl.remove();

    panelEl = document.createElement("div");
    panelEl.id = "discord-enhancer-panel";
    panelEl.innerHTML = `
      <div id="discord-enhancer-header">
        <span>Discord Enhancer</span>
        <button id="de-collapse-btn">${settings.panelCollapsed ? "Open" : "Hide"}</button>
      </div>
      <div id="discord-enhancer-body">
        <div class="de-row">
          <label>Master enable</label>
          <input class="de-toggle" type="checkbox" data-key="enabled" ${settings.enabled ? "checked" : ""}>
        </div>

        <div class="de-row">
          <label>Hide typing indicator</label>
          <input class="de-toggle" type="checkbox" data-key="hideTyping" ${settings.hideTyping ? "checked" : ""}>
        </div>

        <div class="de-row">
          <label>Hide Nitro/upgrade nags</label>
          <input class="de-toggle" type="checkbox" data-key="hideNitro" ${settings.hideNitro ? "checked" : ""}>
        </div>

        <div class="de-row">
          <label>Hide gift button</label>
          <input class="de-toggle" type="checkbox" data-key="hideGiftButton" ${settings.hideGiftButton ? "checked" : ""}>
        </div>

        <div class="de-row">
          <label>Widen chat</label>
          <input class="de-toggle" type="checkbox" data-key="widenChat" ${settings.widenChat ? "checked" : ""}>
        </div>

        <div class="de-row">
          <label>Compact mode</label>
          <input class="de-toggle" type="checkbox" data-key="compactMode" ${settings.compactMode ? "checked" : ""}>
        </div>

        <div class="de-row">
          <label>Blur spoiler/NSFW media</label>
          <input class="de-toggle" type="checkbox" data-key="blurNsfwMedia" ${settings.blurNsfwMedia ? "checked" : ""}>
        </div>

        <div class="de-slider-wrap">
          <label>Media corner roundness: <span id="de-mediaRadius-value">${settings.mediaRadius}px</span></label>
          <input type="range" min="0" max="40" step="1" value="${settings.mediaRadius}" data-slider="mediaRadius">
        </div>

        <div class="de-slider-wrap">
          <label>UI scale: <span id="de-uiScale-value">${settings.uiScale}%</span></label>
          <input type="range" min="75" max="125" step="1" value="${settings.uiScale}" data-slider="uiScale">
        </div>

        <div class="de-actions">
          <button id="de-split-btn">Split Draft</button>
          <button id="de-download-btn">Draft → TXT</button>
        </div>

        <div class="de-footer">
          <button id="de-reset-btn" class="secondary">Reset</button>
          <button id="de-close-btn">Close Panel</button>
        </div>

        <div class="de-note">
          Split Draft opens a popup with 2000-char chunks you can copy.
          It does not auto-send messages.
        </div>
      </div>
    `;

    document.body.appendChild(panelEl);
    bindPanelEvents();
  }

  function bindPanelEvents() {
    const header = qs("#discord-enhancer-header", panelEl);
    const collapseBtn = qs("#de-collapse-btn", panelEl);
    const closeBtn = qs("#de-close-btn", panelEl);
    const resetBtn = qs("#de-reset-btn", panelEl);
    const splitBtn = qs("#de-split-btn", panelEl);
    const downloadBtn = qs("#de-download-btn", panelEl);

    qsa('input[data-key]', panelEl).forEach(input => {
      input.addEventListener("change", () => {
        const key = input.dataset.key;
        settings[key] = input.checked;
        saveSettings();
        rerender();
      });
    });

    qsa('input[data-slider]', panelEl).forEach(slider => {
      slider.addEventListener("input", () => {
        const key = slider.dataset.slider;
        settings[key] = Number(slider.value);
        const valueEl = qs(`#de-${key}-value`, panelEl);
        if (valueEl) {
          valueEl.textContent = key === "uiScale" ? `${settings[key]}%` : `${settings[key]}px`;
        }
        saveSettings();
        injectStyles();
      });
    });

    collapseBtn.addEventListener("click", () => {
      settings.panelCollapsed = !settings.panelCollapsed;
      saveSettings();
      rerender();
    });

    closeBtn.addEventListener("click", () => {
      panelEl.style.display = "none";
      addReopenBubble();
    });

    resetBtn.addEventListener("click", () => {
      settings = { ...defaults };
      saveSettings();
      rerender();
    });

    splitBtn.addEventListener("click", openSplitDraftModal);
    downloadBtn.addEventListener("click", downloadDraftAsTxt);

    header.addEventListener("mousedown", (e) => {
      if (e.target.tagName === "BUTTON") return;
      isDragging = true;
      const rect = panelEl.getBoundingClientRect();
      dragOffsetX = e.clientX - rect.left;
      dragOffsetY = e.clientY - rect.top;
      e.preventDefault();
    });

    document.addEventListener("mousemove", onDragMove);
    document.addEventListener("mouseup", onDragEnd);
  }

  function onDragMove(e) {
    if (!isDragging || !panelEl) return;
    settings.panelX = Math.max(0, Math.round(e.clientX - dragOffsetX));
    settings.panelY = Math.max(0, Math.round(e.clientY - dragOffsetY));
    panelEl.style.left = settings.panelX + "px";
    panelEl.style.top = settings.panelY + "px";
  }

  function onDragEnd() {
    if (!isDragging) return;
    isDragging = false;
    saveSettings();
  }

  function addReopenBubble() {
    if (qs("#de-reopen-bubble")) return;
    const bubble = document.createElement("button");
    bubble.id = "de-reopen-bubble";
    bubble.textContent = "Open Enhancer";
    Object.assign(bubble.style, {
      position: "fixed",
      right: "20px",
      bottom: "20px",
      zIndex: "999999",
      border: "0",
      borderRadius: "999px",
      padding: "12px 16px",
      fontWeight: "700",
      cursor: "pointer",
      color: "white",
      background: "#5865f2",
      boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
    });
    bubble.addEventListener("click", () => {
      bubble.remove();
      if (panelEl) panelEl.style.display = "";
    });
    document.body.appendChild(bubble);
  }

  function getDraftEditor() {
    const selectors = [
      '[role="textbox"][contenteditable="true"]',
      '[data-slate-editor="true"]',
      'div[contenteditable="true"]'
    ];

    for (const sel of selectors) {
      const el = qs(sel);
      if (el && isVisible(el)) return el;
    }
    return null;
  }

  function isVisible(el) {
    const r = el.getBoundingClientRect();
    return !!(r.width || r.height);
  }

  function getDraftText() {
    const editor = getDraftEditor();
    if (!editor) return "";
    return editor.innerText || editor.textContent || "";
  }

  function splitIntoChunks(text, max = 2000) {
    const cleaned = text.replace(/\r/g, "");
    const chunks = [];
    let remaining = cleaned;

    while (remaining.length > max) {
      let slice = remaining.slice(0, max);
      let breakAt = Math.max(
        slice.lastIndexOf("\n"),
        slice.lastIndexOf(". "),
        slice.lastIndexOf("! "),
        slice.lastIndexOf("? "),
        slice.lastIndexOf(" ")
      );

      if (breakAt < max * 0.6) breakAt = max;
      chunks.push(remaining.slice(0, breakAt).trim());
      remaining = remaining.slice(breakAt).trimStart();
    }

    if (remaining.trim()) chunks.push(remaining.trim());
    return chunks;
  }

  function openSplitDraftModal() {
    const draft = getDraftText();
    if (!draft.trim()) {
      alert("No draft text found in the current message box.");
      return;
    }

    const chunks = splitIntoChunks(draft, 2000);

    const overlay = document.createElement("div");
    overlay.id = "de-modal-overlay";
    Object.assign(overlay.style, {
      position: "fixed",
      inset: "0",
      background: "rgba(0,0,0,0.65)",
      zIndex: "1000000",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px"
    });

    const modal = document.createElement("div");
    Object.assign(modal.style, {
      width: "min(920px, 96vw)",
      maxHeight: "85vh",
      overflow: "auto",
      background: "#1e1f22",
      color: "white",
      borderRadius: "16px",
      padding: "16px",
      fontFamily: "Inter, system-ui, sans-serif",
      boxShadow: "0 20px 60px rgba(0,0,0,0.4)"
    });

    modal.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <h2 style="margin:0;font-size:20px;">Split Draft (${chunks.length} parts)</h2>
        <button id="de-modal-close" style="border:0;border-radius:10px;padding:8px 12px;background:#5865f2;color:white;cursor:pointer;">Close</button>
      </div>
      <div style="font-size:13px;color:rgba(255,255,255,0.7);margin-bottom:14px;">
        Copy each chunk manually and send it in order.
      </div>
      <div id="de-chunks-wrap"></div>
    `;

    const wrap = modal.querySelector("#de-chunks-wrap");

    chunks.forEach((chunk, i) => {
      const section = document.createElement("div");
      section.style.marginBottom = "14px";
      section.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
          <strong>Part ${i + 1}</strong>
          <button data-copy="${i}" style="border:0;border-radius:10px;padding:8px 12px;background:#2b2d31;color:white;cursor:pointer;">Copy</button>
        </div>
        <textarea readonly style="width:100%;min-height:140px;resize:vertical;border-radius:12px;border:1px solid rgba(255,255,255,0.08);background:#111214;color:white;padding:12px;">${cssEscape(chunk)}</textarea>
      `;
      wrap.appendChild(section);
    });

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    modal.querySelector("#de-modal-close").addEventListener("click", () => overlay.remove());
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.remove();
    });

    modal.querySelectorAll("button[data-copy]").forEach(btn => {
      btn.addEventListener("click", async () => {
        const idx = Number(btn.dataset.copy);
        try {
          await navigator.clipboard.writeText(chunks[idx]);
          const old = btn.textContent;
          btn.textContent = "Copied";
          setTimeout(() => (btn.textContent = old), 1000);
        } catch {
          alert("Clipboard copy failed.");
        }
      });
    });
  }

  function downloadDraftAsTxt() {
    const draft = getDraftText();
    if (!draft.trim()) {
      alert("No draft text found in the current message box.");
      return;
    }

    const blob = new Blob([draft], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "discord-draft.txt";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function rerender() {
    injectStyles();
    createPanel();
  }

  function ensureMounted() {
    if (!document.body) {
      requestAnimationFrame(ensureMounted);
      return;
    }
    rerender();
  }

  ensureMounted();
})();
