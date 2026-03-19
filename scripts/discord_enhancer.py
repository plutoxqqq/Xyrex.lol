#!/usr/bin/env python3
"""Discord Enhancer Studio.

This is a single-file Python control center for Discord visual tweaks.
It stores settings locally, provides a polished Voidware-inspired GUI,
supports a Right Shift window keybind, and can export two practical payloads:

1. A browser userscript for Discord Web.
2. Desktop-compatible CSS for client mod frameworks such as Vencord or
   BetterDiscord QuickCSS.

Important limitation:
Python cannot safely and directly inject code into the official Discord desktop
client by itself. A client mod layer such as Vencord or BetterDiscord is still
required for the desktop CSS export to take effect inside the Discord app.
"""

from __future__ import annotations

import argparse
import base64
import hashlib
import json
import os
import platform
import socket
import subprocess
import sys
import threading
import time
import tkinter as tk
from pathlib import Path
from tkinter import filedialog, messagebox
from typing import Any
from urllib.parse import urlparse
from urllib.request import urlopen

APP_TITLE = "Discord Enhancer Studio"
APP_VERSION = "4.0.0"
RIGHT_SHIFT_VK = 0xA1
RIGHT_SHIFT_POLL_SECONDS = 0.06
WINDOW_SIZE = "1280x820"
BASE_DIR = Path(__file__).resolve().parent
SETTINGS_PATH = BASE_DIR / "discord_enhancer_settings.json"

COLORS = {
    "bg": "#070a12",
    "panel": "#0d1220",
    "panel_alt": "#11192b",
    "card": "#101827",
    "card_alt": "#0c1422",
    "line": "#25324c",
    "text": "#f6f8ff",
    "muted": "#92a1c4",
    "accent": "#8b5cf6",
    "accent_2": "#38bdf8",
    "success": "#22c55e",
    "warning": "#f59e0b",
    "danger": "#fb7185",
}

FEATURE_SECTIONS = [
    {
        "title": "Layout",
        "description": "Broader structure and reading comfort.",
        "items": [
            ("enabled", "Master enable", "Turns all exported tweaks on or off instantly."),
            ("widen_chat", "Widen chat", "Expands the main message area."),
            ("compact_mode", "Compact mode", "Tightens message spacing."),
            ("focus_mode", "Focus mode", "Softens peripheral UI emphasis."),
            ("hide_member_list", "Hide member list", "Removes the member sidebar."),
            ("hide_active_now", "Hide Active Now", "Hides the activity column."),
            ("darken_theme", "Darker surfaces", "Uses deeper panel colors."),
            ("input_gradient", "Polished input bar", "Restyles the message composer."),
        ],
    },
    {
        "title": "Buttons and distractions",
        "description": "Composer cleanup and reduced upsells.",
        "items": [
            ("hide_typing_indicator", "Hide typing indicator", "Removes the typing status line."),
            ("hide_nitro_upsells", "Hide Nitro prompts", "Suppresses Nitro and upgrade surfaces."),
            ("hide_gift_button", "Hide gift button", "Removes the gift shortcut."),
            ("hide_stickers_button", "Hide sticker button", "Removes the sticker shortcut."),
            ("hide_emoji_button", "Hide emoji button", "Removes the emoji shortcut."),
            ("hide_apps_button", "Hide Apps button", "Removes the Apps shortcut."),
            ("hide_help_button", "Hide help button", "Removes the top-right help shortcut."),
            ("hide_shop_button", "Hide shop button", "Hides shop-related navigation where available."),
        ],
    },
    {
        "title": "Visual polish",
        "description": "Media, decorations, and hover details.",
        "items": [
            ("blur_spoiler_media", "Blur spoiler media", "Keeps spoiler media blurred until hover."),
            ("rounded_media", "Round media corners", "Applies rounded corners to media."),
            ("timestamp_glow", "Timestamp highlight", "Adds a subtle timestamp glow on hover."),
            ("hide_profile_effects", "Hide profile effects", "Suppresses decorative profile layers."),
            ("hide_avatar_decorations", "Hide avatar decorations", "Removes avatar decoration overlays."),
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
    "hide_help_button": False,
    "hide_shop_button": False,
    "hide_profile_effects": False,
    "hide_avatar_decorations": False,
    "blur_spoiler_media": False,
    "rounded_media": True,
    "timestamp_glow": False,
    "media_radius": 18,
    "desktop_opacity": 96,
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
            settings[key] = bool(settings.get(key))
    settings["media_radius"] = clamp(settings.get("media_radius"), 0, 40, DEFAULT_SETTINGS["media_radius"])
    settings["desktop_opacity"] = clamp(settings.get("desktop_opacity"), 85, 100, DEFAULT_SETTINGS["desktop_opacity"])
    settings["panel_scale"] = clamp(settings.get("panel_scale"), 80, 125, DEFAULT_SETTINGS["panel_scale"])
    settings["panel_x"] = clamp(settings.get("panel_x"), 0, 3000, DEFAULT_SETTINGS["panel_x"])
    settings["panel_y"] = clamp(settings.get("panel_y"), 0, 3000, DEFAULT_SETTINGS["panel_y"])
    return settings


def load_settings(path: Path = SETTINGS_PATH) -> dict[str, Any]:
    if not path.exists():
        return sanitize_settings(DEFAULT_SETTINGS)
    try:
        return sanitize_settings(json.loads(path.read_text(encoding="utf-8")))
    except (OSError, json.JSONDecodeError):
        return sanitize_settings(DEFAULT_SETTINGS)


def save_settings(settings: dict[str, Any], path: Path = SETTINGS_PATH) -> None:
    path.write_text(json.dumps(sanitize_settings(settings), indent=2), encoding="utf-8")


def active_rule(enabled: bool, css: str) -> str:
    return css.strip() if enabled else ""


def build_feature_css(settings: dict[str, Any]) -> str:
    if not settings["enabled"]:
        return ""

    rules = [
        active_rule(
            settings["hide_typing_indicator"],
            """
            [class*="typing"] {
              display: none !important;
            }
            """,
        ),
        active_rule(
            settings["hide_nitro_upsells"],
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
        ),
        active_rule(
            settings["hide_gift_button"],
            """
            button[aria-label*="Gift" i],
            button[aria-label*="Send a gift" i],
            [aria-label*="Gift" i][role="button"] {
              display: none !important;
            }
            """,
        ),
        active_rule(
            settings["hide_stickers_button"],
            """
            button[aria-label*="Sticker" i],
            [aria-label*="sticker" i][role="button"] {
              display: none !important;
            }
            """,
        ),
        active_rule(
            settings["hide_emoji_button"],
            """
            button[aria-label*="emoji" i],
            [aria-label*="Open emoji picker" i],
            [aria-label*="expression picker" i] {
              display: none !important;
            }
            """,
        ),
        active_rule(
            settings["hide_apps_button"],
            """
            button[aria-label*="Apps" i],
            button[aria-label*="App Launcher" i],
            [aria-label*="Apps" i][role="button"] {
              display: none !important;
            }
            """,
        ),
        active_rule(
            settings["hide_help_button"],
            """
            [class*="toolbar"] [aria-label*="Help" i] {
              display: none !important;
            }
            """,
        ),
        active_rule(
            settings["hide_shop_button"],
            """
            a[href*="shop" i],
            [aria-label*="Shop" i],
            [class*="shop"] {
              display: none !important;
            }
            """,
        ),
        active_rule(
            settings["widen_chat"],
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
        ),
        active_rule(
            settings["compact_mode"],
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
        ),
        active_rule(
            settings["focus_mode"],
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
        ),
        active_rule(
            settings["hide_member_list"],
            """
            [class*="membersWrap"],
            aside[aria-label*="Member List" i] {
              display: none !important;
            }
            """,
        ),
        active_rule(
            settings["hide_active_now"],
            """
            [class*="nowPlayingColumn"],
            [class*="activeNow"],
            aside[aria-label*="Active Now" i] {
              display: none !important;
            }
            """,
        ),
        active_rule(
            settings["hide_profile_effects"],
            """
            [class*="profileEffects"],
            [class*="profileEffect"],
            [class*="avatarDecorationHint"] {
              display: none !important;
            }
            """,
        ),
        active_rule(
            settings["hide_avatar_decorations"],
            """
            [class*="avatarDecoration"],
            [mask*="avatar-decoration"] {
              display: none !important;
            }
            """,
        ),
        active_rule(
            settings["blur_spoiler_media"],
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
        ),
        active_rule(
            settings["rounded_media"],
            f"""
            img,
            video,
            [class*="imageWrapper"] {{
              border-radius: {settings['media_radius']}px !important;
            }}
            """,
        ),
        active_rule(
            settings["darken_theme"],
            """
            :root {
              --background-primary: #0f1117 !important;
              --background-secondary: #141824 !important;
              --background-secondary-alt: #10131d !important;
              --background-tertiary: #0c0f17 !important;
              --channeltextarea-background: #121725 !important;
            }
            """,
        ),
        active_rule(
            settings["input_gradient"],
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
        ),
        active_rule(
            settings["timestamp_glow"],
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
        ),
    ]

    return "\n\n".join(rule for rule in rules if rule)


def build_desktop_css(settings: dict[str, Any]) -> str:
    settings = sanitize_settings(settings)
    opacity = settings["desktop_opacity"] / 100
    feature_css = build_feature_css(settings)
    return f"""/*
Discord Enhancer Studio desktop CSS export
Generated by {APP_TITLE} v{APP_VERSION}
Use this with Vencord QuickCSS or BetterDiscord Custom CSS.
Right Shift support is not available through CSS alone; the keybind only applies
inside the Python control center and the exported web userscript.
*/

:root {{
  --de-desktop-opacity: {opacity};
  --de-media-radius: {settings['media_radius']}px;
}}

html,
body,
#app-mount {{
  background: rgba(8, 11, 19, var(--de-desktop-opacity)) !important;
}}

[class*="base"],
[class*="content"],
[class*="container"],
[class*="chat"] {{
  backdrop-filter: blur(8px);
}}

{feature_css}
"""


def build_runtime_injection(settings: dict[str, Any]) -> str:
    settings = sanitize_settings(settings)
    feature_css = build_feature_css(settings)
    embedded = json.dumps(settings, indent=2)
    scale = settings["panel_scale"] / 100
    return f'''(() => {{
  "use strict";

  const DEFAULTS = {embedded};
  const STORAGE_KEY = "__discord_enhancer_studio_export__";
  const PANEL_ID = "discord-enhancer-studio-panel";
  const STYLE_ID = "discord-enhancer-studio-style";
  const BUBBLE_ID = "discord-enhancer-studio-bubble";

  function loadState() {{
    try {{
      return {{ ...DEFAULTS, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{{}}") }};
    }} catch {{
      return {{ ...DEFAULTS }};
    }}
  }}

  function saveState() {{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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
        --de-panel-scale: {scale};
      }}

      #${{PANEL_ID}} {{
        position: fixed;
        left: ${{state.panel_x}}px;
        top: ${{state.panel_y}}px;
        width: 340px;
        z-index: 2147483644;
        border-radius: 18px;
        overflow: hidden;
        background: rgba(10, 14, 24, 0.96);
        border: 1px solid rgba(255, 255, 255, 0.08);
        color: #f6f8ff;
        box-shadow: 0 24px 80px rgba(0, 0, 0, 0.42);
        backdrop-filter: blur(16px);
        transform: scale(var(--de-panel-scale));
        transform-origin: top left;
        font-family: Inter, system-ui, sans-serif;
      }}

      #${{PANEL_ID}}[hidden] {{
        display: none !important;
      }}

      #${{PANEL_ID}} * {{
        box-sizing: border-box;
      }}

      .de-head {{
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        padding: 14px 16px;
        background: linear-gradient(135deg, #8b5cf6, #38bdf8);
      }}

      .de-head h2 {{
        margin: 0;
        font-size: 15px;
      }}

      .de-head p {{
        margin: 2px 0 0;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.84);
      }}

      .de-head button,
      .de-row button {{
        border: 0;
        border-radius: 12px;
        padding: 8px 11px;
        color: #f6f8ff;
        background: rgba(255, 255, 255, 0.14);
        cursor: pointer;
        font-weight: 700;
      }}

      .de-body {{
        display: ${{state.panel_collapsed ? "none" : "block"}};
        padding: 14px;
      }}

      .de-section + .de-section {{
        margin-top: 14px;
      }}

      .de-section h3 {{
        margin: 0 0 8px;
        color: rgba(255, 255, 255, 0.68);
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }}

      .de-row {{
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
        padding: 8px 0;
      }}

      .de-row strong {{
        display: block;
        font-size: 13px;
      }}

      .de-row span {{
        display: block;
        margin-top: 2px;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.68);
      }}

      .de-toggle {{
        position: relative;
        width: 44px;
        height: 24px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.16);
      }}

      .de-toggle::after {{
        content: "";
        position: absolute;
        top: 3px;
        left: 3px;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: #ffffff;
      }}

      .de-toggle[data-on="true"] {{
        background: #22c55e;
      }}

      .de-toggle[data-on="true"]::after {{
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
        background: linear-gradient(135deg, #8b5cf6, #38bdf8);
        color: #ffffff;
        font: 700 13px/1 Inter, system-ui, sans-serif;
        box-shadow: 0 18px 40px rgba(0, 0, 0, 0.38);
        cursor: pointer;
      }}

      {feature_css}
    `;
  }}

  function renderRows() {{
    const sections = [
      {{
        title: "Core",
        items: [
          ["enabled", "Master enable", "Turns the enhancer on or off."],
          ["widen_chat", "Widen chat", "Expands the message area."],
          ["compact_mode", "Compact mode", "Tightens message spacing."],
          ["hide_member_list", "Hide member list", "Hides the member list."],
          ["hide_active_now", "Hide Active Now", "Hides the activity sidebar."],
          ["hide_gift_button", "Hide gift button", "Removes the gift shortcut."],
          ["hide_stickers_button", "Hide sticker button", "Removes the sticker shortcut."],
          ["hide_emoji_button", "Hide emoji button", "Removes the emoji shortcut."],
        ]
      }}
    ];

    return sections.map((section) => `
      <div class="de-section">
        <h3>${{section.title}}</h3>
        ${{section.items.map(([key, title, description]) => `
          <div class="de-row">
            <div>
              <strong>${{title}}</strong>
              <span>${{description}}</span>
            </div>
            <button type="button" data-setting-key="${{key}}">
              <div class="de-toggle" data-on="${{state[key] ? "true" : "false"}}"></div>
            </button>
          </div>
        `).join("")}}
      </div>
    `).join("");
  }}

  function renderPanel() {{
    document.getElementById(PANEL_ID)?.remove();
    const panel = document.createElement("section");
    panel.id = PANEL_ID;
    panel.hidden = !state.panel_visible;
    panel.innerHTML = `
      <div class="de-head">
        <div>
          <h2>Discord Enhancer Studio</h2>
          <p>Press Right Shift to show or hide this panel.</p>
        </div>
        <div style="display:flex;gap:8px;">
          <button id="de-collapse" type="button">${{state.panel_collapsed ? "+" : "−"}}</button>
          <button id="de-hide" type="button">✕</button>
        </div>
      </div>
      <div class="de-body">${{renderRows()}}</div>
    `;
    document.body.appendChild(panel);

    panel.querySelector("#de-collapse")?.addEventListener("click", () => {{
      state.panel_collapsed = !state.panel_collapsed;
      saveState();
      ensureStyle();
      renderPanel();
      syncBubble();
    }});

    panel.querySelector("#de-hide")?.addEventListener("click", () => {{
      state.panel_visible = false;
      saveState();
      syncBubble();
      renderPanel();
    }});

    panel.querySelectorAll("[data-setting-key]").forEach((button) => {{
      button.addEventListener("click", () => {{
        const key = button.getAttribute("data-setting-key");
        if (!key) return;
        state[key] = !state[key];
        saveState();
        ensureStyle();
        renderPanel();
        syncBubble();
      }});
    }});
  }}

  function syncBubble() {{
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
          saveState();
          renderPanel();
          syncBubble();
        }});
        document.body.appendChild(bubble);
      }}
      return;
    }}

    bubble?.remove();
  }}

  function onKey(event) {{
    if (event.code !== "ShiftRight") return;
    state.panel_visible = !state.panel_visible;
    saveState();
    renderPanel();
    syncBubble();
  }}

  function boot() {{
    if (!document.body) {{
      requestAnimationFrame(boot);
      return;
    }}
    ensureStyle();
    renderPanel();
    syncBubble();
    window.addEventListener("keydown", onKey, {{ passive: true }});
  }}

  boot();
}})();
'''


def build_web_userscript(settings: dict[str, Any]) -> str:
    return f'''// ==UserScript==
// @name         Discord Enhancer Studio Export
// @namespace    https://discord.com/
// @version      {APP_VERSION}
// @description  Exported from the single-file Python Discord Enhancer Studio.
// @author       OpenAI Codex
// @match        https://discord.com/channels/*
// @match        https://discord.com/app
// @grant        none
// @run-at       document-idle
// ==/UserScript==

{build_runtime_injection(settings)}
'''


def build_install_notes() -> str:
    return (
        "Desktop Discord support requires a client mod CSS layer.\n\n"
        "Recommended desktop workflow:\n"
        "1. Install a client CSS framework such as Vencord QuickCSS or BetterDiscord Custom CSS.\n"
        "2. In this studio, export the Desktop CSS payload.\n"
        "3. Paste the CSS into your QuickCSS or Custom CSS file and save it.\n\n"
        "Recommended web workflow:\n"
        "1. Export the Web Userscript payload.\n"
        "2. Install it in Tampermonkey or Violentmonkey.\n"
        "3. Open Discord Web and use Right Shift to toggle the exported panel.\n\n"
        "Pure Python cannot directly patch the official Discord desktop client without an external modding layer."
    )


def write_output(text: str, destination: Path) -> None:
    destination.write_text(text, encoding="utf-8")


class ChromeDevToolsClient:
    def __init__(self, host: str = "127.0.0.1", port: int = 9222) -> None:
        self.host = host.strip() or "127.0.0.1"
        self.port = port

    def list_tabs(self) -> list[dict[str, Any]]:
        with urlopen(f"http://{self.host}:{self.port}/json", timeout=3) as response:
            data = json.loads(response.read().decode("utf-8"))
        return [tab for tab in data if isinstance(tab, dict)]

    def discord_tabs(self) -> list[dict[str, Any]]:
        tabs = []
        for tab in self.list_tabs():
            url = str(tab.get("url", ""))
            if "discord.com" in url:
                tabs.append(tab)
        return tabs

    def inject_runtime(self, runtime_script: str, inject_all: bool = False) -> int:
        tabs = self.discord_tabs()
        if not tabs:
            raise RuntimeError(
                "No discord.com tabs were found. Open Chrome with --remote-debugging-port=9222, "
                "then navigate to Discord."
            )

        targets = tabs if inject_all else [tabs[0]]
        for tab in targets:
            ws_url = str(tab.get("webSocketDebuggerUrl", ""))
            if not ws_url:
                continue
            with DevToolsWebSocket(ws_url) as client:
                wrapped_script = f"window.__discordEnhancerStudioScript = {json.dumps(runtime_script)};"
                client.call("Page.enable")
                client.call(
                    "Page.addScriptToEvaluateOnNewDocument",
                    {"source": wrapped_script + "\\n;eval(window.__discordEnhancerStudioScript);"},
                )
                client.call("Runtime.evaluate", {"expression": runtime_script})
        return len(targets)


class DevToolsWebSocket:
    def __init__(self, ws_url: str) -> None:
        parsed = urlparse(ws_url)
        self.host = parsed.hostname or "127.0.0.1"
        self.port = parsed.port or (443 if parsed.scheme == "wss" else 80)
        self.path = parsed.path + (f"?{parsed.query}" if parsed.query else "")
        self.secure = parsed.scheme == "wss"
        self.socket: socket.socket | None = None
        self.next_id = 1

    def __enter__(self) -> "DevToolsWebSocket":
        self.connect()
        return self

    def __exit__(self, exc_type, exc, tb) -> None:
        self.close()

    def connect(self) -> None:
        raw_socket = socket.create_connection((self.host, self.port), timeout=5)
        if self.secure:
            import ssl

            context = ssl.create_default_context()
            raw_socket = context.wrap_socket(raw_socket, server_hostname=self.host)
        key = base64.b64encode(os.urandom(16)).decode("ascii")
        request = (
            f"GET {self.path} HTTP/1.1\r\n"
            f"Host: {self.host}:{self.port}\r\n"
            "Upgrade: websocket\r\n"
            "Connection: Upgrade\r\n"
            f"Sec-WebSocket-Key: {key}\r\n"
            "Sec-WebSocket-Version: 13\r\n\r\n"
        )
        raw_socket.sendall(request.encode("utf-8"))
        response = self._recv_http_response(raw_socket)
        if "101" not in response.splitlines()[0]:
            raise RuntimeError(f"WebSocket handshake failed: {response.splitlines()[0]}")
        expected_accept = base64.b64encode(
            hashlib.sha1((key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11").encode("utf-8")).digest()
        ).decode("ascii")
        if f"Sec-WebSocket-Accept: {expected_accept}" not in response:
            raise RuntimeError("WebSocket handshake validation failed.")
        self.socket = raw_socket

    def close(self) -> None:
        if self.socket is not None:
            try:
                self.socket.close()
            finally:
                self.socket = None

    def call(self, method: str, params: dict[str, Any] | None = None) -> Any:
        message_id = self.next_id
        self.next_id += 1
        self.send_json({"id": message_id, "method": method, "params": params or {}})
        while True:
            payload = self.recv_json()
            if payload.get("id") == message_id:
                if "error" in payload:
                    raise RuntimeError(str(payload["error"]))
                return payload.get("result")

    def send_json(self, payload: dict[str, Any]) -> None:
        if self.socket is None:
            raise RuntimeError("WebSocket is not connected.")
        self._send_frame(json.dumps(payload).encode("utf-8"))

    def recv_json(self) -> dict[str, Any]:
        if self.socket is None:
            raise RuntimeError("WebSocket is not connected.")
        while True:
            opcode, payload = self._recv_frame()
            if opcode == 0x1:
                return json.loads(payload.decode("utf-8"))
            if opcode == 0x8:
                raise RuntimeError("WebSocket connection closed by the browser.")

    def _recv_http_response(self, sock: socket.socket) -> str:
        data = b""
        while b"\r\n\r\n" not in data:
            chunk = sock.recv(4096)
            if not chunk:
                break
            data += chunk
        return data.decode("utf-8", errors="replace")

    def _send_frame(self, payload: bytes) -> None:
        if self.socket is None:
            raise RuntimeError("WebSocket is not connected.")
        mask = os.urandom(4)
        frame = bytearray([0x81])
        length = len(payload)
        if length < 126:
            frame.append(0x80 | length)
        elif length < 65536:
            frame.append(0x80 | 126)
            frame.extend(length.to_bytes(2, "big"))
        else:
            frame.append(0x80 | 127)
            frame.extend(length.to_bytes(8, "big"))
        frame.extend(mask)
        frame.extend(bytes(byte ^ mask[index % 4] for index, byte in enumerate(payload)))
        self.socket.sendall(frame)

    def _recv_exact(self, size: int) -> bytes:
        if self.socket is None:
            raise RuntimeError("WebSocket is not connected.")
        data = b""
        while len(data) < size:
            chunk = self.socket.recv(size - len(data))
            if not chunk:
                raise RuntimeError("Unexpected end of WebSocket stream.")
            data += chunk
        return data

    def _recv_frame(self) -> tuple[int, bytes]:
        header = self._recv_exact(2)
        opcode = header[0] & 0x0F
        masked = bool(header[1] & 0x80)
        length = header[1] & 0x7F
        if length == 126:
            length = int.from_bytes(self._recv_exact(2), "big")
        elif length == 127:
            length = int.from_bytes(self._recv_exact(8), "big")
        mask = self._recv_exact(4) if masked else b""
        payload = self._recv_exact(length)
        if masked:
            payload = bytes(byte ^ mask[index % 4] for index, byte in enumerate(payload))
        return opcode, payload


class RightShiftWatcher:
    def __init__(self, callback) -> None:
        self.callback = callback
        self.running = False
        self.thread: threading.Thread | None = None
        self.was_pressed = False

    def start(self) -> None:
        if platform.system() != "Windows" or self.running:
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
            pressed = bool(user32.GetAsyncKeyState(RIGHT_SHIFT_VK) & 0x8000)
            if pressed and not self.was_pressed:
                self.callback()
            self.was_pressed = pressed
            time.sleep(RIGHT_SHIFT_POLL_SECONDS)


class ToggleSwitch(tk.Canvas):
    def __init__(self, master: tk.Misc, variable: tk.BooleanVar, command, background: str) -> None:
        super().__init__(master, width=58, height=30, highlightthickness=0, bd=0, bg=background)
        self.variable = variable
        self.command = command
        self.variable.trace_add("write", lambda *_: self.redraw())
        self.bind("<Button-1>", self.on_click)
        self.redraw()

    def on_click(self, _event=None) -> None:
        self.variable.set(not self.variable.get())
        self.command()

    def rounded_rect(self, x1, y1, x2, y2, radius, **kwargs: Any):
        points = [
            x1 + radius, y1,
            x2 - radius, y1,
            x2, y1,
            x2, y1 + radius,
            x2, y2 - radius,
            x2, y2,
            x2 - radius, y2,
            x1 + radius, y2,
            x1, y2,
            x1, y2 - radius,
            x1, y1 + radius,
            x1, y1,
        ]
        return self.create_polygon(points, smooth=True, **kwargs)

    def redraw(self) -> None:
        self.delete("all")
        enabled = self.variable.get()
        fill = COLORS["success"] if enabled else "#2f3b52"
        knob_x = 30 if enabled else 4
        self.rounded_rect(4, 5, 54, 25, 12, fill=fill, outline=fill)
        self.create_oval(knob_x, 4, knob_x + 22, 26, fill="#ffffff", outline="#ffffff")


class DiscordEnhancerStudio:
    def __init__(self, root: tk.Tk) -> None:
        self.root = root
        self.root.title(f"{APP_TITLE} v{APP_VERSION}")
        self.root.geometry(WINDOW_SIZE)
        self.root.minsize(1180, 760)
        self.root.configure(bg=COLORS["bg"])
        self.root.protocol("WM_DELETE_WINDOW", self.on_close)

        self.settings = load_settings()
        self.status_var = tk.StringVar(value="Ready. Right Shift toggles the studio window.")
        self.hidden_by_hotkey = False
        self.bool_vars: dict[str, tk.BooleanVar] = {}
        self.int_vars: dict[str, tk.IntVar] = {}
        self.preview_mode = tk.StringVar(value="web")
        self.debug_host_var = tk.StringVar(value="127.0.0.1")
        self.debug_port_var = tk.StringVar(value="9222")
        self.preview_text: tk.Text | None = None
        self.right_shift_watcher = RightShiftWatcher(self.queue_hotkey_toggle)

        self.default_font = ("Segoe UI", 10)
        self.header_font = ("Segoe UI Semibold", 20)
        self.title_font = ("Segoe UI Semibold", 12)
        self.mono_font = ("Cascadia Code", 10)

        self._build_variables()
        self._build_layout()
        self.refresh_preview()
        self.root.bind("<KeyRelease-Shift_R>", lambda _event: self.toggle_visibility())
        self.right_shift_watcher.start()

    def _build_variables(self) -> None:
        for key, value in self.settings.items():
            if isinstance(value, bool):
                self.bool_vars[key] = tk.BooleanVar(value=value)
        for key in ("media_radius", "desktop_opacity", "panel_scale"):
            self.int_vars[key] = tk.IntVar(value=int(self.settings[key]))

    def _build_layout(self) -> None:
        shell = tk.Frame(self.root, bg=COLORS["bg"])
        shell.pack(fill="both", expand=True, padx=18, pady=18)

        sidebar = tk.Frame(shell, bg=COLORS["panel"], width=300, highlightbackground=COLORS["line"], highlightthickness=1)
        sidebar.pack(side="left", fill="y")
        sidebar.pack_propagate(False)

        main = tk.Frame(shell, bg=COLORS["bg"])
        main.pack(side="left", fill="both", expand=True, padx=(18, 0))

        self._build_sidebar(sidebar)
        self._build_main(main)

    def _build_sidebar(self, parent: tk.Frame) -> None:
        hero = tk.Frame(parent, bg=COLORS["panel"])
        hero.pack(fill="x", padx=18, pady=(18, 14))
        tk.Label(hero, text="VOIDWARE-STYLE STUDIO", bg=COLORS["panel"], fg=COLORS["accent_2"], font=("Segoe UI", 9, "bold")).pack(anchor="w")
        tk.Label(hero, text="Discord Enhancer", bg=COLORS["panel"], fg=COLORS["text"], font=("Segoe UI Semibold", 24)).pack(anchor="w", pady=(6, 2))
        tk.Label(hero, text="One polished Python file for settings, exports, and install guidance.", bg=COLORS["panel"], fg=COLORS["muted"], wraplength=250, justify="left", font=self.default_font).pack(anchor="w")

        stat_card = tk.Frame(parent, bg=COLORS["card"], highlightbackground=COLORS["line"], highlightthickness=1)
        stat_card.pack(fill="x", padx=18, pady=(0, 14))
        tk.Label(stat_card, text="Keybind", bg=COLORS["card"], fg=COLORS["muted"], font=("Segoe UI", 9, "bold")).pack(anchor="w", padx=14, pady=(12, 0))
        tk.Label(stat_card, text="Right Shift", bg=COLORS["card"], fg=COLORS["text"], font=("Segoe UI Semibold", 16)).pack(anchor="w", padx=14)
        tk.Label(stat_card, text="Toggles the studio window. The web userscript export also responds to Right Shift inside Discord Web.", bg=COLORS["card"], fg=COLORS["muted"], wraplength=250, justify="left", font=self.default_font).pack(anchor="w", padx=14, pady=(4, 14))

        export_card = tk.Frame(parent, bg=COLORS["card_alt"], highlightbackground=COLORS["line"], highlightthickness=1)
        export_card.pack(fill="x", padx=18, pady=(0, 14))
        tk.Label(export_card, text="Exports", bg=COLORS["card_alt"], fg=COLORS["text"], font=self.title_font).pack(anchor="w", padx=14, pady=(12, 8))
        self._sidebar_button(export_card, "Copy web userscript", lambda: self.copy_payload("web"), COLORS["accent"]).pack(fill="x", padx=14)
        self._sidebar_button(export_card, "Copy desktop CSS", lambda: self.copy_payload("desktop"), COLORS["accent_2"]).pack(fill="x", padx=14, pady=8)
        self._sidebar_button(export_card, "Save payload to file", self.save_current_payload, COLORS["panel_alt"]).pack(fill="x", padx=14, pady=(0, 14))

        inject_card = tk.Frame(parent, bg=COLORS["card_alt"], highlightbackground=COLORS["line"], highlightthickness=1)
        inject_card.pack(fill="x", padx=18, pady=(0, 14))
        tk.Label(inject_card, text="Live browser injection", bg=COLORS["card_alt"], fg=COLORS["text"], font=self.title_font).pack(anchor="w", padx=14, pady=(12, 8))
        tk.Label(inject_card, text="Connect to a Chrome-based browser launched with --remote-debugging-port=9222, then inject straight into discord.com.", bg=COLORS["card_alt"], fg=COLORS["muted"], wraplength=250, justify="left", font=self.default_font).pack(anchor="w", padx=14)

        endpoint_row = tk.Frame(inject_card, bg=COLORS["card_alt"])
        endpoint_row.pack(fill="x", padx=14, pady=(10, 8))
        tk.Entry(endpoint_row, textvariable=self.debug_host_var, relief="flat", bg="#0b1220", fg=COLORS["text"], insertbackground=COLORS["text"]).pack(side="left", fill="x", expand=True)
        tk.Entry(endpoint_row, textvariable=self.debug_port_var, width=8, relief="flat", bg="#0b1220", fg=COLORS["text"], insertbackground=COLORS["text"]).pack(side="left", padx=(8, 0))

        self._sidebar_button(inject_card, "Inject into first Discord tab", self.inject_first_discord_tab, COLORS["success"]).pack(fill="x", padx=14)
        self._sidebar_button(inject_card, "Inject into all Discord tabs", self.inject_all_discord_tabs, COLORS["accent"]).pack(fill="x", padx=14, pady=8)
        self._sidebar_button(inject_card, "List Discord tabs", self.inspect_discord_tabs, COLORS["panel_alt"]).pack(fill="x", padx=14, pady=(0, 14))

        tools_card = tk.Frame(parent, bg=COLORS["card_alt"], highlightbackground=COLORS["line"], highlightthickness=1)
        tools_card.pack(fill="x", padx=18)
        tk.Label(tools_card, text="Tools", bg=COLORS["card_alt"], fg=COLORS["text"], font=self.title_font).pack(anchor="w", padx=14, pady=(12, 8))
        self._sidebar_button(tools_card, "Open Discord Web", self.open_discord_web, COLORS["panel_alt"]).pack(fill="x", padx=14)
        self._sidebar_button(tools_card, "Show install notes", self.show_install_notes, COLORS["panel_alt"]).pack(fill="x", padx=14, pady=8)
        self._sidebar_button(tools_card, "Reset to defaults", self.reset_defaults, COLORS["warning"]).pack(fill="x", padx=14, pady=(0, 14))

        footer = tk.Frame(parent, bg=COLORS["panel"])
        footer.pack(side="bottom", fill="x", padx=18, pady=18)
        tk.Label(footer, text="Desktop app support", bg=COLORS["panel"], fg=COLORS["accent_2"], font=("Segoe UI", 9, "bold")).pack(anchor="w")
        tk.Label(footer, text="A fully direct Python-only desktop injection path is not safe or realistic. This studio therefore exports desktop CSS for client mod frameworks instead of pretending to patch the official app directly.", bg=COLORS["panel"], fg=COLORS["muted"], wraplength=250, justify="left", font=self.default_font).pack(anchor="w", pady=(4, 0))

    def _sidebar_button(self, parent: tk.Frame, text: str, command, bg: str) -> tk.Button:
        return tk.Button(
            parent,
            text=text,
            command=command,
            relief="flat",
            bd=0,
            bg=bg,
            fg=COLORS["text"],
            activebackground=COLORS["accent"] if bg != COLORS["warning"] else "#d97706",
            activeforeground=COLORS["text"],
            font=("Segoe UI Semibold", 10),
            pady=12,
            cursor="hand2",
        )

    def _build_main(self, parent: tk.Frame) -> None:
        header = tk.Frame(parent, bg=COLORS["panel"], highlightbackground=COLORS["line"], highlightthickness=1)
        header.pack(fill="x")
        tk.Label(header, text="Enhancer modules", bg=COLORS["panel"], fg=COLORS["text"], font=self.header_font).pack(anchor="w", padx=18, pady=(16, 4))
        tk.Label(header, text="Live settings save instantly. Preview and export are generated from this single Python file only.", bg=COLORS["panel"], fg=COLORS["muted"], font=self.default_font).pack(anchor="w", padx=18, pady=(0, 16))

        body = tk.Frame(parent, bg=COLORS["bg"])
        body.pack(fill="both", expand=True, pady=(18, 0))

        left = tk.Frame(body, bg=COLORS["bg"])
        left.pack(side="left", fill="both", expand=True)
        right = tk.Frame(body, bg=COLORS["bg"], width=430)
        right.pack(side="left", fill="both", padx=(18, 0))
        right.pack_propagate(False)

        self._build_scrolling_controls(left)
        self._build_preview_panel(right)

        status = tk.Frame(parent, bg=COLORS["panel_alt"], highlightbackground=COLORS["line"], highlightthickness=1)
        status.pack(fill="x", pady=(18, 0))
        tk.Label(status, textvariable=self.status_var, bg=COLORS["panel_alt"], fg=COLORS["muted"], anchor="w", padx=14, pady=10, font=self.default_font).pack(fill="x")

    def _build_scrolling_controls(self, parent: tk.Frame) -> None:
        canvas = tk.Canvas(parent, bg=COLORS["bg"], highlightthickness=0, bd=0)
        scrollbar = tk.Scrollbar(parent, orient="vertical", command=canvas.yview)
        inner = tk.Frame(canvas, bg=COLORS["bg"])
        inner.bind("<Configure>", lambda _event: canvas.configure(scrollregion=canvas.bbox("all")))
        canvas.create_window((0, 0), window=inner, anchor="nw")
        canvas.configure(yscrollcommand=scrollbar.set)
        canvas.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")

        for section in FEATURE_SECTIONS:
            card = tk.Frame(inner, bg=COLORS["card"], highlightbackground=COLORS["line"], highlightthickness=1)
            card.pack(fill="x", pady=(0, 16))
            tk.Label(card, text=section["title"], bg=COLORS["card"], fg=COLORS["text"], font=self.title_font).pack(anchor="w", padx=16, pady=(14, 4))
            tk.Label(card, text=section["description"], bg=COLORS["card"], fg=COLORS["muted"], font=self.default_font).pack(anchor="w", padx=16, pady=(0, 10))
            for key, title, description in section["items"]:
                self._toggle_row(card, key, title, description)

        tuning = tk.Frame(inner, bg=COLORS["card_alt"], highlightbackground=COLORS["line"], highlightthickness=1)
        tuning.pack(fill="x", pady=(0, 16))
        tk.Label(tuning, text="Fine tuning", bg=COLORS["card_alt"], fg=COLORS["text"], font=self.title_font).pack(anchor="w", padx=16, pady=(14, 12))
        self._slider_row(tuning, "media_radius", "Media radius", 0, 40, "px")
        self._slider_row(tuning, "desktop_opacity", "Desktop opacity", 85, 100, "%")
        self._slider_row(tuning, "panel_scale", "Panel scale", 80, 125, "%")

    def _toggle_row(self, parent: tk.Frame, key: str, title: str, description: str) -> None:
        row = tk.Frame(parent, bg=COLORS["card"])
        row.pack(fill="x", padx=16, pady=(0, 10))
        text = tk.Frame(row, bg=COLORS["card"])
        text.pack(side="left", fill="both", expand=True)
        tk.Label(text, text=title, bg=COLORS["card"], fg=COLORS["text"], font=("Segoe UI Semibold", 11)).pack(anchor="w")
        tk.Label(text, text=description, bg=COLORS["card"], fg=COLORS["muted"], wraplength=590, justify="left", font=self.default_font).pack(anchor="w", pady=(2, 0))
        ToggleSwitch(row, self.bool_vars[key], lambda item_key=key: self.on_toggle(item_key), COLORS["card"]).pack(side="right", padx=(12, 0))

    def _slider_row(self, parent: tk.Frame, key: str, title: str, minimum: int, maximum: int, suffix: str) -> None:
        row = tk.Frame(parent, bg=COLORS["card_alt"])
        row.pack(fill="x", padx=16, pady=(0, 14))
        header = tk.Frame(row, bg=COLORS["card_alt"])
        header.pack(fill="x")
        tk.Label(header, text=title, bg=COLORS["card_alt"], fg=COLORS["text"], font=("Segoe UI Semibold", 11)).pack(side="left")
        label = tk.Label(header, text=f"{self.int_vars[key].get()}{suffix}", bg=COLORS["card_alt"], fg=COLORS["accent_2"], font=("Segoe UI", 10, "bold"))
        label.pack(side="right")
        tk.Scale(
            row,
            from_=minimum,
            to=maximum,
            orient="horizontal",
            showvalue=False,
            variable=self.int_vars[key],
            resolution=1,
            command=lambda value, item_key=key, suffix_text=suffix, value_label=label: self.on_slider(item_key, value_label, suffix_text, value),
            bg=COLORS["card_alt"],
            fg=COLORS["text"],
            troughcolor="#1b2740",
            activebackground=COLORS["accent"],
            bd=0,
            highlightthickness=0,
        ).pack(fill="x", pady=(6, 0))

    def _build_preview_panel(self, parent: tk.Frame) -> None:
        preview = tk.Frame(parent, bg=COLORS["panel"], highlightbackground=COLORS["line"], highlightthickness=1)
        preview.pack(fill="both", expand=True)
        tk.Label(preview, text="Live export preview", bg=COLORS["panel"], fg=COLORS["text"], font=self.title_font).pack(anchor="w", padx=16, pady=(14, 4))
        tk.Label(preview, text="Switch between browser userscript and desktop CSS payloads before copying or saving.", bg=COLORS["panel"], fg=COLORS["muted"], wraplength=390, justify="left", font=self.default_font).pack(anchor="w", padx=16)

        tabs = tk.Frame(preview, bg=COLORS["panel"])
        tabs.pack(fill="x", padx=16, pady=(14, 10))
        self._tab_button(tabs, "Web userscript", "web").pack(side="left")
        self._tab_button(tabs, "Desktop CSS", "desktop").pack(side="left", padx=8)
        self._tab_button(tabs, "Install notes", "notes").pack(side="left")

        self.preview_text = tk.Text(preview, wrap="none", bg="#09111d", fg="#dce6ff", insertbackground="#dce6ff", relief="flat", bd=0, font=self.mono_font)
        self.preview_text.pack(fill="both", expand=True, padx=16, pady=(0, 16))

    def _tab_button(self, parent: tk.Frame, text: str, mode: str) -> tk.Button:
        return tk.Button(
            parent,
            text=text,
            command=lambda target=mode: self.set_preview_mode(target),
            relief="flat",
            bd=0,
            bg=COLORS["card"],
            fg=COLORS["text"],
            activebackground=COLORS["accent"],
            activeforeground=COLORS["text"],
            font=("Segoe UI Semibold", 10),
            padx=12,
            pady=10,
            cursor="hand2",
        )

    def set_preview_mode(self, mode: str) -> None:
        self.preview_mode.set(mode)
        self.refresh_preview()

    def current_payload(self) -> tuple[str, str]:
        mode = self.preview_mode.get()
        if mode == "desktop":
            return build_desktop_css(self.settings), "discord_enhancer_desktop.css"
        if mode == "notes":
            return build_install_notes(), "discord_enhancer_install_notes.txt"
        return build_web_userscript(self.settings), "discord_enhancer.user.js"

    def refresh_preview(self) -> None:
        payload, _filename = self.current_payload()
        if self.preview_text is not None:
            self.preview_text.delete("1.0", tk.END)
            self.preview_text.insert("1.0", payload)
        self.set_status("Preview refreshed from current settings.")

    def persist(self, message: str) -> None:
        save_settings(self.settings)
        self.refresh_preview()
        self.set_status(message)

    def on_toggle(self, key: str) -> None:
        self.settings[key] = self.bool_vars[key].get()
        self.persist(f"Updated {key.replace('_', ' ')}.")

    def on_slider(self, key: str, label: tk.Label, suffix: str, value: str) -> None:
        self.settings[key] = int(float(value))
        label.configure(text=f"{self.settings[key]}{suffix}")
        self.persist(f"Adjusted {key.replace('_', ' ')}.")

    def copy_payload(self, mode: str | None = None) -> None:
        original = self.preview_mode.get()
        if mode is not None:
            self.preview_mode.set(mode)
        payload, _filename = self.current_payload()
        self.root.clipboard_clear()
        self.root.clipboard_append(payload)
        self.refresh_preview()
        self.set_status(f"Copied {self.preview_mode.get()} payload to the clipboard.", tone="success")
        if mode is not None:
            self.preview_mode.set(original)
            self.refresh_preview()

    def save_current_payload(self) -> None:
        payload, filename = self.current_payload()
        extension = Path(filename).suffix or ".txt"
        selected = filedialog.asksaveasfilename(
            title="Save exported payload",
            initialfile=filename,
            defaultextension=extension,
            filetypes=[("All files", "*.*")],
        )
        if not selected:
            return
        write_output(payload, Path(selected))
        self.set_status(f"Saved payload to {selected}.", tone="success")

    def _devtools_client(self) -> ChromeDevToolsClient:
        try:
            port = int(self.debug_port_var.get().strip())
        except ValueError as exc:
            raise RuntimeError("The DevTools port must be a valid number.") from exc
        return ChromeDevToolsClient(self.debug_host_var.get(), port)

    def inspect_discord_tabs(self) -> None:
        try:
            tabs = self._devtools_client().discord_tabs()
        except Exception as exc:
            self.set_status(f"Tab discovery failed: {exc}", tone="danger")
            messagebox.showerror(APP_TITLE, f"Could not inspect Discord tabs.\n\n{exc}")
            return

        if not tabs:
            self.set_status("No discord.com tabs were found.", tone="warning")
            messagebox.showwarning(
                APP_TITLE,
                "No discord.com tabs were found.\n\n"
                "Launch Chrome or another Chromium-based browser with:\n"
                "--remote-debugging-port=9222\n\n"
                "Then open discord.com and try again.",
            )
            return

        lines = [f"{index + 1}. {tab.get('title', 'Untitled tab')} — {tab.get('url', '')}" for index, tab in enumerate(tabs)]
        self.set_status(f"Found {len(tabs)} Discord tab(s).", tone="success")
        messagebox.showinfo(APP_TITLE, "\n\n".join(lines))

    def inject_first_discord_tab(self) -> None:
        self.inject_discord_tabs(inject_all=False)

    def inject_all_discord_tabs(self) -> None:
        self.inject_discord_tabs(inject_all=True)

    def inject_discord_tabs(self, inject_all: bool) -> None:
        try:
            count = self._devtools_client().inject_runtime(build_runtime_injection(self.settings), inject_all=inject_all)
        except Exception as exc:
            self.set_status(f"Injection failed: {exc}", tone="danger")
            messagebox.showerror(
                APP_TITLE,
                "Live discord.com injection failed.\n\n"
                f"{exc}\n\n"
                "Make sure you are using a Chromium-based browser launched with a remote debugging port,\n"
                "for example:\nchrome.exe --remote-debugging-port=9222",
            )
            return

        target_text = "tabs" if inject_all else "tab"
        self.set_status(f"Injected into {count} Discord {target_text}.", tone="success")
        messagebox.showinfo(APP_TITLE, f"Successfully injected into {count} Discord {target_text}.")

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

    def show_install_notes(self) -> None:
        self.preview_mode.set("notes")
        self.refresh_preview()
        messagebox.showinfo(APP_TITLE, build_install_notes())

    def reset_defaults(self) -> None:
        self.settings = dict(DEFAULT_SETTINGS)
        save_settings(self.settings)
        for key, variable in self.bool_vars.items():
            variable.set(bool(self.settings[key]))
        for key, variable in self.int_vars.items():
            variable.set(int(self.settings[key]))
        self.refresh_preview()
        self.set_status("Reset settings to defaults.", tone="warning")

    def set_status(self, text: str, tone: str = "info") -> None:
        prefix = {
            "info": "INFO",
            "success": "OK",
            "warning": "WARN",
            "danger": "ERROR",
        }.get(tone, "INFO")
        self.status_var.set(f"[{prefix}] {text}")

    def queue_hotkey_toggle(self) -> None:
        self.root.after(0, self.toggle_visibility)

    def toggle_visibility(self) -> None:
        if self.hidden_by_hotkey:
            self.root.deiconify()
            self.root.lift()
            self.root.attributes("-topmost", True)
            self.root.after(250, lambda: self.root.attributes("-topmost", False))
            self.hidden_by_hotkey = False
            self.set_status("Studio restored with Right Shift.", tone="success")
            return
        self.root.withdraw()
        self.hidden_by_hotkey = True

    def on_close(self) -> None:
        save_settings(self.settings)
        self.right_shift_watcher.stop()
        self.root.destroy()


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=APP_TITLE)
    parser.add_argument("--stdout", choices=["web", "desktop", "notes"], help="Print a payload to stdout and exit.")
    parser.add_argument("--write-web", metavar="PATH", help="Write the web userscript export to a file.")
    parser.add_argument("--write-desktop-css", metavar="PATH", help="Write the desktop CSS export to a file.")
    parser.add_argument("--write-notes", metavar="PATH", help="Write install notes to a file.")
    parser.add_argument("--inject-discord", action="store_true", help="Inject the current runtime into the first discord.com tab via Chrome DevTools.")
    parser.add_argument("--inject-all-discord-tabs", action="store_true", help="Inject the current runtime into every discord.com tab via Chrome DevTools.")
    parser.add_argument("--debug-host", default="127.0.0.1", help="Chrome DevTools host.")
    parser.add_argument("--debug-port", type=int, default=9222, help="Chrome DevTools port.")
    parser.add_argument("--reset-settings", action="store_true", help="Reset stored settings before continuing.")
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv or sys.argv[1:])

    if args.reset_settings:
        save_settings(DEFAULT_SETTINGS)

    settings = load_settings()

    if args.stdout == "web":
        sys.stdout.write(build_web_userscript(settings))
        return 0
    if args.stdout == "desktop":
        sys.stdout.write(build_desktop_css(settings))
        return 0
    if args.stdout == "notes":
        sys.stdout.write(build_install_notes())
        return 0

    if args.write_web:
        write_output(build_web_userscript(settings), Path(args.write_web))
        print(args.write_web)
        return 0
    if args.write_desktop_css:
        write_output(build_desktop_css(settings), Path(args.write_desktop_css))
        print(args.write_desktop_css)
        return 0
    if args.write_notes:
        write_output(build_install_notes(), Path(args.write_notes))
        print(args.write_notes)
        return 0

    if args.inject_discord or args.inject_all_discord_tabs:
        client = ChromeDevToolsClient(args.debug_host, args.debug_port)
        count = client.inject_runtime(
            build_runtime_injection(settings),
            inject_all=args.inject_all_discord_tabs,
        )
        print(count)
        return 0

    root = tk.Tk()
    DiscordEnhancerStudio(root)
    root.mainloop()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
