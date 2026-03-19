#!/usr/bin/env python3
"""Discord Enhancer Control Center.

This desktop application stores enhancer settings in JSON, provides a
Voidware-inspired control panel, supports a Right Shift visibility keybind,
and exports a companion Discord userscript that can be installed in a browser
manager such as Tampermonkey.

A pure Python desktop application cannot run directly inside discord.com on its
own, so the practical integration path is to manage settings here and export
an installable userscript that applies them in the browser.
"""

from __future__ import annotations

import argparse
import json
import os
import platform
import subprocess
import sys
import threading
import time
import tkinter as tk
from pathlib import Path
from tkinter import messagebox
from typing import Any

APP_TITLE = "Discord Enhancer Control Center"
APP_VERSION = "3.0.0"
RIGHT_SHIFT_POLL_SECONDS = 0.06
BASE_DIR = Path(__file__).resolve().parent
SETTINGS_PATH = BASE_DIR / "discord_enhancer_settings.json"
OUTPUT_PATH = BASE_DIR / "discord_enhancer.user.js"
WINDOW_WIDTH = 1180
WINDOW_HEIGHT = 760
RIGHT_SHIFT_VK = 0xA1

VOIDWARE_COLORS = {
    "bg": "#090b12",
    "panel": "#101521",
    "panel_alt": "#0d1220",
    "card": "#111827",
    "card_alt": "#0f1724",
    "line": "#253047",
    "text": "#f5f7ff",
    "muted": "#91a0c0",
    "accent": "#7c5cff",
    "accent_2": "#38bdf8",
    "success": "#22c55e",
    "danger": "#fb7185",
    "warning": "#f59e0b",
}

FEATURE_SECTIONS = [
    {
        "title": "Layout",
        "items": [
            ("enabled", "Master enable", "Turns the enhancer CSS on or off instantly."),
            ("widen_chat", "Widen chat", "Expands the main message column for a roomier layout."),
            ("compact_mode", "Compact mode", "Tightens message spacing for denser reading."),
            ("focus_mode", "Focus mode", "Softens peripheral controls to keep chat central."),
            ("hide_member_list", "Hide member list", "Collapses the right member sidebar."),
            ("hide_active_now", "Hide Active Now", "Hides the activity column on the friends page."),
            ("darken_theme", "Darker surfaces", "Applies deeper panels for a cleaner theme."),
            ("input_gradient", "Polished input bar", "Adds stronger styling to the chat input area."),
        ],
    },
    {
        "title": "Buttons and distractions",
        "items": [
            ("hide_typing_indicator", "Hide typing indicator", "Removes the typing status line."),
            ("hide_nitro_upsells", "Hide Nitro prompts", "Suppresses upgrade and Nitro upsell surfaces."),
            ("hide_gift_button", "Hide gift button", "Removes the gift action from the composer."),
            ("hide_stickers_button", "Hide sticker button", "Removes the sticker picker shortcut."),
            ("hide_emoji_button", "Hide emoji button", "Removes the emoji picker shortcut."),
            ("hide_apps_button", "Hide Apps button", "Removes the Apps launcher from the composer."),
            ("hide_profile_effects", "Hide profile effects", "Suppresses decorative profile effect layers."),
            ("hide_avatar_decorations", "Hide avatar decorations", "Removes avatar decoration overlays."),
        ],
    },
    {
        "title": "Media and polish",
        "items": [
            ("blur_spoiler_media", "Blur spoiler media", "Keeps spoiler-style media blurred until hover."),
            ("rounded_media", "Round media corners", "Rounds image and video corners."),
            ("timestamp_glow", "Timestamp highlight", "Adds a subtle timestamp highlight on hover."),
            ("hide_help_button", "Hide help button", "Removes the top-bar help shortcut."),
        ],
    },
]

DEFAULT_SETTINGS: dict[str, Any] = {
    "enabled": True,
    "widen_chat": False,
    "compact_mode": False,
    "focus_mode": False,
    "hide_member_list": False,
    "hide_active_now": False,
    "darken_theme": False,
    "input_gradient": True,
    "hide_typing_indicator": False,
    "hide_nitro_upsells": False,
    "hide_gift_button": False,
    "hide_stickers_button": False,
    "hide_emoji_button": False,
    "hide_apps_button": False,
    "hide_profile_effects": False,
    "hide_avatar_decorations": False,
    "blur_spoiler_media": False,
    "rounded_media": True,
    "timestamp_glow": False,
    "hide_help_button": False,
    "media_radius": 18,
    "panel_scale": 100,
    "panel_x": 24,
    "panel_y": 92,
    "panel_collapsed": False,
    "panel_visible": True,
}


def clamp(value: Any, minimum: int, maximum: int, fallback: int) -> int:
    try:
        numeric_value = int(value)
    except (TypeError, ValueError):
        return fallback
    return max(minimum, min(maximum, numeric_value))


def sanitize_settings(candidate: dict[str, Any]) -> dict[str, Any]:
    settings = {**DEFAULT_SETTINGS, **candidate}
    for key, default_value in DEFAULT_SETTINGS.items():
        if isinstance(default_value, bool):
            settings[key] = bool(settings[key])
    settings["media_radius"] = clamp(settings.get("media_radius"), 0, 40, DEFAULT_SETTINGS["media_radius"])
    settings["panel_scale"] = clamp(settings.get("panel_scale"), 80, 125, DEFAULT_SETTINGS["panel_scale"])
    settings["panel_x"] = clamp(settings.get("panel_x"), 0, 3000, DEFAULT_SETTINGS["panel_x"])
    settings["panel_y"] = clamp(settings.get("panel_y"), 0, 3000, DEFAULT_SETTINGS["panel_y"])
    return settings


def load_settings(path: Path = SETTINGS_PATH) -> dict[str, Any]:
    if not path.exists():
        return sanitize_settings(DEFAULT_SETTINGS)
    try:
        return sanitize_settings(json.loads(path.read_text(encoding="utf-8")))
    except (json.JSONDecodeError, OSError):
        return sanitize_settings(DEFAULT_SETTINGS)


def save_settings(settings: dict[str, Any], path: Path = SETTINGS_PATH) -> None:
    path.write_text(json.dumps(sanitize_settings(settings), indent=2), encoding="utf-8")


def build_feature_css(settings: dict[str, Any]) -> str:
    if not settings["enabled"]:
        return ""

    rules: list[str] = []

    def add(rule: str, enabled: bool) -> None:
        if enabled:
            rules.append(rule.strip())

    add(
        """
        [class*="typing"] {
          display: none !important;
        }
        """,
        settings["hide_typing_indicator"],
    )
    add(
        """
        a[href*="discord.com/nitro"],
        a[href*="/store"],
        [class*="premium"],
        [class*="upsell"],
        [class*="nitro"],
        [aria-label*="Nitro" i] {
          display: none !important;
        }
        """,
        settings["hide_nitro_upsells"],
    )
    add(
        """
        button[aria-label*="Gift" i],
        button[aria-label*="Send a gift" i],
        [aria-label*="Gift" i][role="button"] {
          display: none !important;
        }
        """,
        settings["hide_gift_button"],
    )
    add(
        """
        button[aria-label*="Sticker" i],
        [aria-label*="sticker" i][role="button"] {
          display: none !important;
        }
        """,
        settings["hide_stickers_button"],
    )
    add(
        """
        button[aria-label*="emoji" i],
        [aria-label*="Open emoji picker" i],
        [aria-label*="expression picker" i] {
          display: none !important;
        }
        """,
        settings["hide_emoji_button"],
    )
    add(
        """
        button[aria-label*="Apps" i],
        button[aria-label*="App Launcher" i],
        [aria-label*="Apps" i][role="button"] {
          display: none !important;
        }
        """,
        settings["hide_apps_button"],
    )
    add(
        """
        [class*="toolbar"] [aria-label*="Help" i] {
          display: none !important;
        }
        """,
        settings["hide_help_button"],
    )
    add(
        """
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
        """,
        settings["widen_chat"],
    )
    add(
        """
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
        """,
        settings["compact_mode"],
    )
    add(
        """
        nav[aria-label="Servers sidebar"],
        [data-list-id="guildsnav"],
        [class*="toolbar"] [aria-label*="Inbox" i],
        [class*="toolbar"] [aria-label*="Notification" i] {
          opacity: 0.72;
          transition: opacity 0.18s ease;
        }

        nav[aria-label="Servers sidebar"]:hover,
        [data-list-id="guildsnav"]:hover,
        [class*="toolbar"] [aria-label*="Inbox" i]:hover,
        [class*="toolbar"] [aria-label*="Notification" i]:hover {
          opacity: 1;
        }
        """,
        settings["focus_mode"],
    )
    add(
        """
        [class*="membersWrap"],
        aside[aria-label*="Member List" i] {
          display: none !important;
        }
        """,
        settings["hide_member_list"],
    )
    add(
        """
        [class*="nowPlayingColumn"],
        [class*="activeNow"],
        aside[aria-label*="Active Now" i] {
          display: none !important;
        }
        """,
        settings["hide_active_now"],
    )
    add(
        """
        [class*="profileEffects"],
        [class*="profileEffect"],
        [class*="avatarDecorationHint"] {
          display: none !important;
        }
        """,
        settings["hide_profile_effects"],
    )
    add(
        """
        [class*="avatarDecoration"],
        [mask*="avatar-decoration"] {
          display: none !important;
        }
        """,
        settings["hide_avatar_decorations"],
    )
    add(
        """
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
          filter: blur(0) !important;
        }
        """,
        settings["blur_spoiler_media"],
    )
    add(
        f"""
        img,
        video,
        [class*="imageWrapper"] {{
          border-radius: {settings['media_radius']}px !important;
        }}
        """,
        settings["rounded_media"],
    )
    add(
        """
        :root {
          --background-primary: #0f1117 !important;
          --background-secondary: #141824 !important;
          --background-secondary-alt: #10131d !important;
          --background-tertiary: #0c0f17 !important;
          --channeltextarea-background: #121725 !important;
        }
        """,
        settings["darken_theme"],
    )
    add(
        """
        form [class*="channelTextArea"],
        form [class*="textArea"],
        [class*="channelTextArea"] {
          background: linear-gradient(180deg, rgba(88, 101, 242, 0.12), rgba(88, 101, 242, 0.04)) !important;
          border: 1px solid rgba(120, 132, 255, 0.18) !important;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03), 0 12px 30px rgba(0, 0, 0, 0.16) !important;
          border-radius: 18px !important;
        }
        """,
        settings["input_gradient"],
    )
    add(
        """
        time {
          transition: color 0.18s ease, text-shadow 0.18s ease;
        }

        li:hover time,
        [class*="message"]:hover time {
          color: #dfe4ff !important;
          text-shadow: 0 0 12px rgba(88, 101, 242, 0.45);
        }
        """,
        settings["timestamp_glow"],
    )

    return "\n\n".join(rules)


def build_userscript(settings: dict[str, Any]) -> str:
    sanitized = sanitize_settings(settings)
    embedded_settings = json.dumps(sanitized, indent=2)
    feature_css = build_feature_css(sanitized)
    scale_value = sanitized["panel_scale"] / 100

    return f'''// ==UserScript==
// @name         Discord Enhancer Exported Panel
// @namespace    https://discord.com/
// @version      {APP_VERSION}
// @description  Exported from the Python Discord Enhancer Control Center.
// @author       OpenAI Codex
// @match        https://discord.com/channels/*
// @match        https://discord.com/app
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(() => {{
  "use strict";

  const SETTINGS = {embedded_settings};
  const PANEL_ID = "discord-enhancer-python-panel";
  const STYLE_ID = "discord-enhancer-python-style";
  const BUBBLE_ID = "discord-enhancer-python-bubble";
  const STORAGE_KEY = "__discord_enhancer_python_export__";

  function saveState(nextState) {{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  }}

  function loadState() {{
    try {{
      return {{ ...SETTINGS, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{{}}") }};
    }} catch {{
      return {{ ...SETTINGS }};
    }}
  }}

  let state = loadState();

  function ensureStyle() {{
    let style = document.getElementById(STYLE_ID);
    if (!style) {{
      style = document.createElement("style");
      style.id = STYLE_ID;
      document.documentElement.appendChild(style);
    }}

    style.textContent = `
      :root {{
        --de-export-scale: {scale_value};
      }}

      #${{PANEL_ID}} {{
        position: fixed;
        left: ${{state.panel_x}}px;
        top: ${{state.panel_y}}px;
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
      }}

      #${{PANEL_ID}}[hidden] {{
        display: none !important;
      }}

      #${{PANEL_ID}} * {{
        box-sizing: border-box;
      }}

      .de-export-head {{
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 14px 16px;
        background: linear-gradient(135deg, #7c5cff, #38bdf8);
      }}

      .de-export-title {{
        margin: 0;
        font-size: 15px;
        font-weight: 800;
      }}

      .de-export-note {{
        margin: 2px 0 0;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.84);
      }}

      .de-export-head button,
      .de-export-body button {{
        border: 0;
        border-radius: 12px;
        padding: 8px 11px;
        color: #f6f8ff;
        background: rgba(255, 255, 255, 0.14);
        cursor: pointer;
        font-weight: 700;
      }}

      .de-export-body {{
        display: ${{state.panel_collapsed ? "none" : "block"}};
        padding: 14px;
      }}

      .de-export-section + .de-export-section {{
        margin-top: 14px;
      }}

      .de-export-section h3 {{
        margin: 0 0 8px;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: rgba(255, 255, 255, 0.68);
      }}

      .de-export-row {{
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        padding: 8px 0;
      }}

      .de-export-row strong {{
        display: block;
        font-size: 13px;
      }}

      .de-export-row span {{
        display: block;
        margin-top: 2px;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.68);
      }}

      .de-export-toggle {{
        position: relative;
        width: 44px;
        height: 24px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.16);
      }}

      .de-export-toggle::after {{
        content: "";
        position: absolute;
        top: 3px;
        left: 3px;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: #fff;
      }}

      .de-export-toggle[data-on="true"] {{
        background: #22c55e;
      }}

      .de-export-toggle[data-on="true"]::after {{
        left: 23px;
      }}

      #${{BUBBLE_ID}} {{
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
      }}

      {feature_css}
    `;
  }}

  function renderPanel() {{
    let panel = document.getElementById(PANEL_ID);
    if (panel) {{
      panel.remove();
    }}

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
          <button id="de-export-collapse" type="button">${{state.panel_collapsed ? "+" : "−"}}</button>
          <button id="de-export-hide" type="button">✕</button>
        </div>
      </div>
      <div class="de-export-body" id="de-export-body">
        ${{renderRows()}}
      </div>
    `;
    document.body.appendChild(panel);

    panel.querySelector("#de-export-collapse")?.addEventListener("click", () => {{
      state.panel_collapsed = !state.panel_collapsed;
      saveState(state);
      ensureStyle();
      renderPanel();
    }});
    panel.querySelector("#de-export-hide")?.addEventListener("click", () => {{
      state.panel_visible = false;
      saveState(state);
      syncVisibility();
    }});

    panel.querySelectorAll("[data-setting-key]").forEach((node) => {{
      node.addEventListener("click", () => {{
        const key = node.getAttribute("data-setting-key");
        if (!key) return;
        state[key] = !state[key];
        saveState(state);
        ensureStyle();
        renderPanel();
        syncVisibility();
      }});
    }});
  }}

  function renderRows() {{
    const sections = [
      {{
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
      }}
    ];

    return sections.map((section) => `
      <div class="de-export-section">
        <h3>${{section.title}}</h3>
        ${{section.items.map(([key, title, description]) => `
          <div class="de-export-row">
            <div>
              <strong>${{title}}</strong>
              <span>${{description}}</span>
            </div>
            <div class="de-export-toggle" data-setting-key="${{key}}" data-on="${{state[key] ? "true" : "false"}}"></div>
          </div>
        `).join("")}}
      </div>
    `).join("");
  }}

  function syncVisibility() {{
    const panel = document.getElementById(PANEL_ID);
    let bubble = document.getElementById(BUBBLE_ID);

    if (panel) {{
      panel.hidden = !state.panel_visible;
    }}

    if (!state.panel_visible) {{
      if (!bubble) {{
        bubble = document.createElement("button");
        bubble.id = BUBBLE_ID;
        bubble.textContent = "Open Enhancer";
        bubble.addEventListener("click", () => {{
          state.panel_visible = true;
          saveState(state);
          syncVisibility();
        }});
        document.body.appendChild(bubble);
      }}
      return;
    }}

    bubble?.remove();
  }}

  function togglePanelFromKey(event) {{
    if (event.code !== "ShiftRight") return;
    state.panel_visible = !state.panel_visible;
    saveState(state);
    syncVisibility();
  }}

  function boot() {{
    if (!document.body) {{
      requestAnimationFrame(boot);
      return;
    }}

    ensureStyle();
    renderPanel();
    syncVisibility();
    window.addEventListener("keydown", togglePanelFromKey, {{ passive: true }});
  }}

  boot();
}})();
'''


def export_userscript(settings: dict[str, Any], destination: Path = OUTPUT_PATH) -> Path:
    destination.write_text(build_userscript(settings), encoding="utf-8")
    return destination


class RightShiftWatcher:
    def __init__(self, callback) -> None:
        self.callback = callback
        self.running = False
        self.thread: threading.Thread | None = None
        self._pressed = False

    def start(self) -> None:
        if platform.system() != "Windows":
            return
        if self.running:
            return
        self.running = True
        self.thread = threading.Thread(target=self._run, daemon=True)
        self.thread.start()

    def stop(self) -> None:
        self.running = False

    def _run(self) -> None:
        import ctypes

        user32 = ctypes.windll.user32
        while self.running:
            is_pressed = bool(user32.GetAsyncKeyState(RIGHT_SHIFT_VK) & 0x8000)
            if is_pressed and not self._pressed:
                self.callback()
            self._pressed = is_pressed
            time.sleep(RIGHT_SHIFT_POLL_SECONDS)


class VoidwareSwitch(tk.Canvas):
    def __init__(self, master: tk.Misc, variable: tk.BooleanVar, command, **kwargs: Any) -> None:
        super().__init__(master, width=56, height=28, highlightthickness=0, bd=0, **kwargs)
        self.variable = variable
        self.command = command
        self.configure(bg=VOIDWARE_COLORS["card"])
        self.bind("<Button-1>", self._toggle)
        self.variable.trace_add("write", lambda *_: self.redraw())
        self.redraw()

    def _toggle(self, _event=None) -> None:
        self.variable.set(not self.variable.get())
        self.command()

    def redraw(self) -> None:
        self.delete("all")
        is_on = self.variable.get()
        track = VOIDWARE_COLORS["success"] if is_on else "#2f3b52"
        knob_x = 30 if is_on else 2
        self.create_rounded_rect(2, 4, 54, 24, 12, fill=track, outline=track)
        self.create_oval(knob_x, 4, knob_x + 22, 26, fill="#ffffff", outline="#ffffff")

    def create_rounded_rect(self, x1, y1, x2, y2, radius, **kwargs: Any):
        points = [
            x1 + radius,
            y1,
            x2 - radius,
            y1,
            x2,
            y1,
            x2,
            y1 + radius,
            x2,
            y2 - radius,
            x2,
            y2,
            x2 - radius,
            y2,
            x1 + radius,
            y2,
            x1,
            y2,
            x1,
            y2 - radius,
            x1,
            y1 + radius,
            x1,
            y1,
        ]
        return self.create_polygon(points, smooth=True, **kwargs)


class DiscordEnhancerApp:
    def __init__(self, root: tk.Tk) -> None:
        self.root = root
        self.root.title(f"{APP_TITLE} v{APP_VERSION}")
        self.root.geometry(f"{WINDOW_WIDTH}x{WINDOW_HEIGHT}")
        self.root.minsize(1100, 700)
        self.root.configure(bg=VOIDWARE_COLORS["bg"])
        self.root.protocol("WM_DELETE_WINDOW", self.on_close)

        self.settings = load_settings()
        self.status_var = tk.StringVar(value="Ready. Right Shift toggles the control center window.")
        self.vars: dict[str, tk.BooleanVar] = {}
        self.slider_vars: dict[str, tk.IntVar] = {}
        self.hidden_by_hotkey = False
        self.right_shift_watcher = RightShiftWatcher(self.queue_hotkey_toggle)

        self._build_styles()
        self._populate_controls()
        self._build_layout()
        self.refresh_export_preview()
        self.root.bind("<KeyRelease-Shift_R>", lambda _event: self.toggle_visibility())
        self.right_shift_watcher.start()

    def _build_styles(self) -> None:
        self.default_font = ("Segoe UI", 10)
        self.title_font = ("Segoe UI Semibold", 12)
        self.header_font = ("Segoe UI Semibold", 18)
        self.mono_font = ("Cascadia Code", 10)

    def _build_layout(self) -> None:
        outer = tk.Frame(self.root, bg=VOIDWARE_COLORS["bg"])
        outer.pack(fill="both", expand=True, padx=18, pady=18)

        sidebar = tk.Frame(outer, bg=VOIDWARE_COLORS["panel"], width=250, highlightbackground=VOIDWARE_COLORS["line"], highlightthickness=1)
        sidebar.pack(side="left", fill="y")
        sidebar.pack_propagate(False)

        content = tk.Frame(outer, bg=VOIDWARE_COLORS["bg"])
        content.pack(side="left", fill="both", expand=True, padx=(18, 0))

        self._build_sidebar(sidebar)
        self._build_content(content)

    def _build_sidebar(self, parent: tk.Frame) -> None:
        hero = tk.Frame(parent, bg=VOIDWARE_COLORS["panel"])
        hero.pack(fill="x", padx=16, pady=(16, 10))

        badge = tk.Label(hero, text="VOIDWARE STYLE", bg=VOIDWARE_COLORS["panel"], fg=VOIDWARE_COLORS["accent_2"], font=("Segoe UI", 9, "bold"))
        badge.pack(anchor="w")

        title = tk.Label(hero, text="Discord Enhancer", bg=VOIDWARE_COLORS["panel"], fg=VOIDWARE_COLORS["text"], font=("Segoe UI Semibold", 21))
        title.pack(anchor="w", pady=(4, 4))

        subtitle = tk.Label(
            hero,
            text="Python control center for a Discord web userscript export.",
            bg=VOIDWARE_COLORS["panel"],
            fg=VOIDWARE_COLORS["muted"],
            justify="left",
            wraplength=210,
            font=self.default_font,
        )
        subtitle.pack(anchor="w")

        stats = tk.Frame(parent, bg=VOIDWARE_COLORS["card"], highlightbackground=VOIDWARE_COLORS["line"], highlightthickness=1)
        stats.pack(fill="x", padx=16, pady=(10, 12))

        tk.Label(stats, text="Keybind", bg=VOIDWARE_COLORS["card"], fg=VOIDWARE_COLORS["muted"], font=("Segoe UI", 9, "bold")).pack(anchor="w", padx=12, pady=(10, 0))
        tk.Label(stats, text="Right Shift", bg=VOIDWARE_COLORS["card"], fg=VOIDWARE_COLORS["text"], font=("Segoe UI Semibold", 14)).pack(anchor="w", padx=12)
        tk.Label(stats, text="Toggles the Python window. The exported userscript also listens for Right Shift inside Discord.", bg=VOIDWARE_COLORS["card"], fg=VOIDWARE_COLORS["muted"], wraplength=210, justify="left", font=self.default_font).pack(anchor="w", padx=12, pady=(2, 12))

        button_frame = tk.Frame(parent, bg=VOIDWARE_COLORS["panel"])
        button_frame.pack(fill="x", padx=16, pady=(4, 12))

        self._make_sidebar_button(button_frame, "Export userscript", self.export_userscript_file, primary=True).pack(fill="x")
        self._make_sidebar_button(button_frame, "Copy userscript", self.copy_userscript, primary=False).pack(fill="x", pady=8)
        self._make_sidebar_button(button_frame, "Open Discord Web", self.open_discord_web, primary=False).pack(fill="x")

        footer = tk.Frame(parent, bg=VOIDWARE_COLORS["panel"])
        footer.pack(side="bottom", fill="x", padx=16, pady=16)
        tk.Label(footer, text="Integration note", bg=VOIDWARE_COLORS["panel"], fg=VOIDWARE_COLORS["accent_2"], font=("Segoe UI", 9, "bold")).pack(anchor="w")
        tk.Label(
            footer,
            text="Python cannot patch discord.com by itself. This app manages settings and exports a browser userscript that does the actual in-page work.",
            bg=VOIDWARE_COLORS["panel"],
            fg=VOIDWARE_COLORS["muted"],
            wraplength=210,
            justify="left",
            font=self.default_font,
        ).pack(anchor="w", pady=(4, 0))

    def _make_sidebar_button(self, parent: tk.Frame, text: str, command, primary: bool) -> tk.Button:
        background = VOIDWARE_COLORS["accent"] if primary else VOIDWARE_COLORS["card"]
        button = tk.Button(
            parent,
            text=text,
            command=command,
            relief="flat",
            bd=0,
            bg=background,
            fg=VOIDWARE_COLORS["text"],
            activebackground=VOIDWARE_COLORS["accent_2"] if primary else "#182235",
            activeforeground=VOIDWARE_COLORS["text"],
            font=("Segoe UI Semibold", 10),
            padx=12,
            pady=12,
            cursor="hand2",
        )
        return button

    def _build_content(self, parent: tk.Frame) -> None:
        header_card = tk.Frame(parent, bg=VOIDWARE_COLORS["panel"], highlightbackground=VOIDWARE_COLORS["line"], highlightthickness=1)
        header_card.pack(fill="x")

        header_top = tk.Frame(header_card, bg=VOIDWARE_COLORS["panel"])
        header_top.pack(fill="x", padx=18, pady=(16, 8))
        tk.Label(header_top, text="Enhancer modules", bg=VOIDWARE_COLORS["panel"], fg=VOIDWARE_COLORS["text"], font=self.header_font).pack(anchor="w")
        tk.Label(header_top, text="Live settings are saved instantly to JSON, then exported as a stable userscript payload.", bg=VOIDWARE_COLORS["panel"], fg=VOIDWARE_COLORS["muted"], font=self.default_font).pack(anchor="w", pady=(4, 0))

        controls_wrap = tk.Frame(parent, bg=VOIDWARE_COLORS["bg"])
        controls_wrap.pack(fill="both", expand=True, pady=(18, 0))

        controls_column = tk.Frame(controls_wrap, bg=VOIDWARE_COLORS["bg"])
        controls_column.pack(side="left", fill="both", expand=True)

        preview_column = tk.Frame(controls_wrap, bg=VOIDWARE_COLORS["bg"], width=410)
        preview_column.pack(side="left", fill="both", padx=(18, 0))
        preview_column.pack_propagate(False)

        canvas = tk.Canvas(controls_column, bg=VOIDWARE_COLORS["bg"], highlightthickness=0, bd=0)
        scrollbar = tk.Scrollbar(controls_column, orient="vertical", command=canvas.yview)
        self.scroll_inner = tk.Frame(canvas, bg=VOIDWARE_COLORS["bg"])
        self.scroll_inner.bind("<Configure>", lambda _event: canvas.configure(scrollregion=canvas.bbox("all")))
        canvas.create_window((0, 0), window=self.scroll_inner, anchor="nw")
        canvas.configure(yscrollcommand=scrollbar.set)
        canvas.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")

        self._build_sections(self.scroll_inner)
        self._build_preview(preview_column)

        status_bar = tk.Frame(parent, bg=VOIDWARE_COLORS["panel_alt"], highlightbackground=VOIDWARE_COLORS["line"], highlightthickness=1)
        status_bar.pack(fill="x", pady=(18, 0))
        tk.Label(status_bar, textvariable=self.status_var, bg=VOIDWARE_COLORS["panel_alt"], fg=VOIDWARE_COLORS["muted"], font=self.default_font, anchor="w", padx=14, pady=10).pack(fill="x")

    def _build_sections(self, parent: tk.Frame) -> None:
        for section in FEATURE_SECTIONS:
            card = tk.Frame(parent, bg=VOIDWARE_COLORS["card"], highlightbackground=VOIDWARE_COLORS["line"], highlightthickness=1)
            card.pack(fill="x", pady=(0, 16))

            tk.Label(card, text=section["title"], bg=VOIDWARE_COLORS["card"], fg=VOIDWARE_COLORS["text"], font=self.title_font).pack(anchor="w", padx=16, pady=(14, 4))
            tk.Label(card, text="Tuned for Discord web with persistent export-ready settings.", bg=VOIDWARE_COLORS["card"], fg=VOIDWARE_COLORS["muted"], font=self.default_font).pack(anchor="w", padx=16, pady=(0, 10))

            for key, title, description in section["items"]:
                self._create_toggle_row(card, key, title, description)

        sliders = tk.Frame(parent, bg=VOIDWARE_COLORS["card_alt"], highlightbackground=VOIDWARE_COLORS["line"], highlightthickness=1)
        sliders.pack(fill="x", pady=(0, 16))
        tk.Label(sliders, text="Fine tuning", bg=VOIDWARE_COLORS["card_alt"], fg=VOIDWARE_COLORS["text"], font=self.title_font).pack(anchor="w", padx=16, pady=(14, 12))
        self._create_slider_row(sliders, "media_radius", "Media radius", 0, 40)
        self._create_slider_row(sliders, "panel_scale", "Panel scale", 80, 125)

        actions = tk.Frame(parent, bg=VOIDWARE_COLORS["card_alt"], highlightbackground=VOIDWARE_COLORS["line"], highlightthickness=1)
        actions.pack(fill="x")
        tk.Label(actions, text="Control actions", bg=VOIDWARE_COLORS["card_alt"], fg=VOIDWARE_COLORS["text"], font=self.title_font).pack(anchor="w", padx=16, pady=(14, 10))

        button_row = tk.Frame(actions, bg=VOIDWARE_COLORS["card_alt"])
        button_row.pack(fill="x", padx=16, pady=(0, 14))
        self._make_action_button(button_row, "Reset to defaults", self.reset_defaults, warning=True).pack(side="left")
        self._make_action_button(button_row, "Refresh preview", self.refresh_export_preview, warning=False).pack(side="left", padx=10)
        self._make_action_button(button_row, "Export now", self.export_userscript_file, warning=False).pack(side="left")

    def _make_action_button(self, parent: tk.Frame, text: str, command, warning: bool) -> tk.Button:
        bg = VOIDWARE_COLORS["warning"] if warning else VOIDWARE_COLORS["accent"]
        return tk.Button(
            parent,
            text=text,
            command=command,
            relief="flat",
            bd=0,
            bg=bg,
            fg=VOIDWARE_COLORS["text"],
            activebackground=VOIDWARE_COLORS["accent_2"],
            activeforeground=VOIDWARE_COLORS["text"],
            font=("Segoe UI Semibold", 10),
            padx=12,
            pady=10,
            cursor="hand2",
        )

    def _build_preview(self, parent: tk.Frame) -> None:
        preview_card = tk.Frame(parent, bg=VOIDWARE_COLORS["panel"], highlightbackground=VOIDWARE_COLORS["line"], highlightthickness=1)
        preview_card.pack(fill="both", expand=True)
        tk.Label(preview_card, text="Export preview", bg=VOIDWARE_COLORS["panel"], fg=VOIDWARE_COLORS["text"], font=self.title_font).pack(anchor="w", padx=16, pady=(14, 4))
        tk.Label(preview_card, text="This is the installable userscript that the Python control center generates.", bg=VOIDWARE_COLORS["panel"], fg=VOIDWARE_COLORS["muted"], wraplength=360, justify="left", font=self.default_font).pack(anchor="w", padx=16)

        self.preview = tk.Text(preview_card, wrap="none", bg="#0a0f1a", fg="#dce6ff", insertbackground="#dce6ff", relief="flat", bd=0, font=self.mono_font)
        self.preview.pack(fill="both", expand=True, padx=16, pady=(14, 16))

    def _populate_controls(self) -> None:
        for key, value in self.settings.items():
            if isinstance(value, bool) and key not in self.vars:
                self.vars[key] = tk.BooleanVar(value=value)
        self.slider_vars["media_radius"] = tk.IntVar(value=self.settings["media_radius"])
        self.slider_vars["panel_scale"] = tk.IntVar(value=self.settings["panel_scale"])

    def _create_toggle_row(self, parent: tk.Frame, key: str, title: str, description: str) -> None:
        row = tk.Frame(parent, bg=VOIDWARE_COLORS["card"])
        row.pack(fill="x", padx=16, pady=(0, 10))

        text_wrap = tk.Frame(row, bg=VOIDWARE_COLORS["card"])
        text_wrap.pack(side="left", fill="both", expand=True)
        tk.Label(text_wrap, text=title, bg=VOIDWARE_COLORS["card"], fg=VOIDWARE_COLORS["text"], font=("Segoe UI Semibold", 11)).pack(anchor="w")
        tk.Label(text_wrap, text=description, bg=VOIDWARE_COLORS["card"], fg=VOIDWARE_COLORS["muted"], wraplength=580, justify="left", font=self.default_font).pack(anchor="w", pady=(2, 0))

        switch = VoidwareSwitch(row, self.vars[key], lambda item_key=key: self.on_toggle(item_key), bg=VOIDWARE_COLORS["card"])
        switch.pack(side="right", padx=(12, 0))

    def _create_slider_row(self, parent: tk.Frame, key: str, title: str, minimum: int, maximum: int) -> None:
        row = tk.Frame(parent, bg=VOIDWARE_COLORS["card_alt"])
        row.pack(fill="x", padx=16, pady=(0, 14))

        header = tk.Frame(row, bg=VOIDWARE_COLORS["card_alt"])
        header.pack(fill="x")
        tk.Label(header, text=title, bg=VOIDWARE_COLORS["card_alt"], fg=VOIDWARE_COLORS["text"], font=("Segoe UI Semibold", 11)).pack(side="left")
        suffix = "%" if key == "panel_scale" else "px"
        value_label = tk.Label(header, text=f"{self.slider_vars[key].get()}{suffix}", bg=VOIDWARE_COLORS["card_alt"], fg=VOIDWARE_COLORS["accent_2"], font=("Segoe UI", 10, "bold"))
        value_label.pack(side="right")

        scale = tk.Scale(
            row,
            from_=minimum,
            to=maximum,
            orient="horizontal",
            showvalue=False,
            resolution=1,
            variable=self.slider_vars[key],
            command=lambda value, item_key=key, label=value_label: self.on_slider(item_key, label, value),
            bg=VOIDWARE_COLORS["card_alt"],
            fg=VOIDWARE_COLORS["text"],
            troughcolor="#1d2940",
            highlightthickness=0,
            bd=0,
            activebackground=VOIDWARE_COLORS["accent"],
        )
        scale.pack(fill="x", pady=(6, 0))

    def on_toggle(self, key: str) -> None:
        self.settings[key] = self.vars[key].get()
        self.persist_state(f"Updated {key.replace('_', ' ')}.")

    def on_slider(self, key: str, label: tk.Label, value: str) -> None:
        self.settings[key] = int(float(value))
        suffix = "%" if key == "panel_scale" else "px"
        label.configure(text=f"{self.settings[key]}{suffix}")
        self.persist_state(f"Adjusted {key.replace('_', ' ')}.")

    def persist_state(self, message: str, refresh_preview: bool = True) -> None:
        save_settings(self.settings)
        if refresh_preview:
            self.refresh_export_preview()
        self.set_status(message)

    def refresh_export_preview(self) -> None:
        userscript = build_userscript(self.settings)
        self.preview.delete("1.0", tk.END)
        self.preview.insert("1.0", userscript)
        self.set_status("Preview refreshed from current JSON-backed settings.")

    def export_userscript_file(self) -> None:
        destination = export_userscript(self.settings)
        self.refresh_export_preview()
        self.set_status(f"Exported userscript to {destination}.", tone="success")
        messagebox.showinfo(APP_TITLE, f"Userscript exported to:\n{destination}")

    def copy_userscript(self) -> None:
        userscript = build_userscript(self.settings)
        self.root.clipboard_clear()
        self.root.clipboard_append(userscript)
        self.set_status("Userscript copied to the clipboard.", tone="success")

    def open_discord_web(self) -> None:
        url = "https://discord.com/app"
        try:
            if platform.system() == "Windows":
                os.startfile(url)  # type: ignore[attr-defined]
            elif platform.system() == "Darwin":
                subprocess.Popen(["open", url])
            else:
                subprocess.Popen(["xdg-open", url])
            self.set_status("Opened Discord Web in your default browser.", tone="success")
        except OSError as exc:
            self.set_status(f"Failed to open Discord Web: {exc}", tone="danger")
            messagebox.showerror(APP_TITLE, f"Could not open Discord Web.\n\n{exc}")

    def reset_defaults(self) -> None:
        self.settings = dict(DEFAULT_SETTINGS)
        save_settings(self.settings)
        for key, variable in self.vars.items():
            variable.set(bool(self.settings[key]))
        for key, variable in self.slider_vars.items():
            variable.set(int(self.settings[key]))
        self.refresh_export_preview()
        self.set_status("Reset settings to defaults.", tone="warning")

    def set_status(self, text: str, tone: str = "info") -> None:
        prefix_map = {
            "info": "INFO",
            "success": "OK",
            "warning": "WARN",
            "danger": "ERROR",
        }
        self.status_var.set(f"[{prefix_map.get(tone, 'INFO')}] {text}")

    def queue_hotkey_toggle(self) -> None:
        self.root.after(0, self.toggle_visibility)

    def toggle_visibility(self) -> None:
        if self.hidden_by_hotkey:
            self.root.deiconify()
            self.root.lift()
            self.root.attributes("-topmost", True)
            self.root.after(250, lambda: self.root.attributes("-topmost", False))
            self.hidden_by_hotkey = False
            self.set_status("Control center restored with Right Shift.", tone="success")
            return

        self.root.withdraw()
        self.hidden_by_hotkey = True

    def on_close(self) -> None:
        save_settings(self.settings)
        self.right_shift_watcher.stop()
        self.root.destroy()


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Discord Enhancer Control Center")
    parser.add_argument("--export-only", action="store_true", help="Export the userscript and exit.")
    parser.add_argument("--stdout", action="store_true", help="Print the generated userscript to stdout and exit.")
    parser.add_argument("--reset-settings", action="store_true", help="Reset persisted settings before continuing.")
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv or sys.argv[1:])

    if args.reset_settings:
        save_settings(DEFAULT_SETTINGS)

    settings = load_settings()

    if args.stdout:
        sys.stdout.write(build_userscript(settings))
        return 0

    if args.export_only:
        destination = export_userscript(settings)
        print(destination)
        return 0

    root = tk.Tk()
    app = DiscordEnhancerApp(root)
    root.mainloop()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
