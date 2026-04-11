import sys
import os
import time
import json
import ctypes
import random
import string
import threading
import subprocess
import traceback
import socket
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse
from datetime import datetime
import tkinter as tk
from tkinter import messagebox, ttk

try:
    import psutil
except ImportError:
    root = tk.Tk()
    root.withdraw()
    messagebox.showerror("Missing package", "This script needs psutil.\n\nInstall it with:\npip install psutil")
    root.destroy()
    raise SystemExit


REDIRECT_IP = "127.0.0.1"
START_MARKER = "# === FOCUS_BLOCK_START ==="
END_MARKER = "# === FOCUS_BLOCK_END ==="
HOSTS_PATH = r"C:\Windows\System32\drivers\etc\hosts"
STATE_FILE = "studystar_state_v2.json"
LOG_FILE = "studystar_log.txt"
BLOCK_PAGE_PORT = 8765
APP_TITLE = "StudyStar V2"

DEFAULT_ALLOWED_SITES = [
    "school.example.com",
    "chatgpt.com",
    "education.vic.gov.au"
]

DEFAULT_BLOCKED_SITES = [
    "facebook.com",
    "instagram.com",
    "tiktok.com",
    "x.com",
    "reddit.com",
    "youtube.com",
    "netflix.com",
    "twitch.tv"
]

DEFAULT_BLOCKED_APPS = [
    "Discord.exe",
    "Telegram.exe",
    "WhatsApp.exe",
    "Steam.exe"
]

DEFAULT_HARD_BLOCKED_SITES = [
    "chatgpt.com/codex"
]

DEFAULT_HARD_BLOCKED_APPS = [
    "Discord.exe"
]

DEFAULT_BROWSER_APPS = [
    "chrome.exe",
    "msedge.exe",
    "firefox.exe",
    "opera.exe",
    "brave.exe"
]

BROWSER_PROCESSES = {
    "chrome.exe",
    "firefox.exe",
    "opera.exe",
    "brave.exe",
    "msedge.exe",
    "iexplore.exe"
}


class BlockPageHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        html = """<!doctype html>
<html>
<head>
<meta charset='utf-8'>
<title>SITE BLOCKED</title>
<style>
    html, body {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(180deg, #05070d 0%, #0a0d18 100%);
        color: #eef1ff;
        font-family: Segoe UI, Arial, sans-serif;
    }
    .wrap {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        padding: 24px;
        box-sizing: border-box;
    }
    .card {
        width: min(720px, 100%);
        background: rgba(17, 20, 38, 0.96);
        border: 1px solid #28324e;
        border-radius: 22px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.35);
        padding: 36px;
    }
    .badge {
        display: inline-block;
        padding: 8px 14px;
        border-radius: 999px;
        background: #1a2340;
        color: #b7c0ff;
        font-weight: 700;
        letter-spacing: 0.06em;
        font-size: 12px;
        margin-bottom: 18px;
    }
    h1 {
        margin: 0 0 12px;
        font-size: 40px;
        line-height: 1.05;
    }
    p {
        margin: 0 0 14px;
        color: #aeb5d6;
        font-size: 17px;
        line-height: 1.6;
    }
    .box {
        margin-top: 18px;
        padding: 16px 18px;
        border-radius: 14px;
        background: #0b1020;
        border: 1px solid #202c45;
        color: #dbe0ff;
        font-family: Consolas, monospace;
        word-break: break-word;
    }
</style>
</head>
<body>
<div class='wrap'>
    <div class='card'>
        <div class='badge'>SITE BLOCKED</div>
        <h1>Stay on task.</h1>
        <p>This site is blocked for the current focus session.</p>
        <p>Go back to one of your allowed study pages or wait until the timer ends.</p>
        <div class='box'>This browser request was redirected to the local block page by StudyStar V2.</div>
    </div>
</div>
</body>
</html>"""
        data = html.encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def log_message(self, format, *args):
        return


def show_fatal_error(title, text):
    try:
        root = tk.Tk()
        root.withdraw()
        messagebox.showerror(title, text)
        root.destroy()
    except Exception:
        print(f"{title}: {text}")


def is_admin():
    try:
        return bool(ctypes.windll.shell32.IsUserAnAdmin())
    except Exception:
        return False


def relaunch_as_admin():
    try:
        params = " ".join(f'"{arg}"' for arg in sys.argv)
        return ctypes.windll.shell32.ShellExecuteW(None, "runas", sys.executable, params, None, 1)
    except Exception:
        return 0


def normalize_lines(raw_text, lower=False):
    items = []
    seen = set()
    for line in raw_text.replace(",", "\n").splitlines():
        item = line.strip()
        if not item:
            continue
        if lower:
            key = item.lower()
            final = key
        else:
            key = item.lower()
            final = item
        if key not in seen:
            seen.add(key)
            items.append(final)
    return items


def normalize_domains(raw_text):
    items = []
    seen = set()
    for line in raw_text.replace(",", "\n").splitlines():
        item = line.strip().lower()
        if not item:
            continue
        item = item.replace("https://", "").replace("http://", "")
        item = item.strip().rstrip("/")
        if "/" in item:
            item = item.split("/", 1)[0]
        if item and item not in seen:
            seen.add(item)
            items.append(item)
    return items


def normalize_apps(raw_text):
    items = []
    seen = set()
    for line in raw_text.replace(",", "\n").splitlines():
        item = line.strip()
        if not item:
            continue
        key = item.lower()
        if key not in seen:
            seen.add(key)
            items.append(item)
    return items


def remove_existing_block(content):
    start = content.find(START_MARKER)
    end = content.find(END_MARKER)
    if start != -1 and end != -1:
        end += len(END_MARKER)
        before = content[:start].rstrip()
        after = content[end:].lstrip()
        if before and after:
            return before + "\n\n" + after
        return before + after
    return content


def build_hosts_block_section(domains):
    lines = [START_MARKER]
    for domain in domains:
        lines.append(f"{REDIRECT_IP} {domain}")
        lines.append(f"{REDIRECT_IP} www.{domain}" if not domain.startswith("www.") else f"{REDIRECT_IP} {domain[4:]}")
    lines.append(END_MARKER)
    deduped = []
    seen = set()
    for line in lines:
        if line not in seen:
            seen.add(line)
            deduped.append(line)
    return "\n".join(deduped) + "\n"


def flush_dns():
    try:
        subprocess.run(["ipconfig", "/flushdns"], capture_output=True, text=True, shell=True)
    except Exception:
        pass


def apply_hosts_redirect(domains):
    with open(HOSTS_PATH, "r", encoding="utf-8") as f:
        content = f.read()
    content = remove_existing_block(content).rstrip() + "\n\n"
    content += build_hosts_block_section(domains)
    with open(HOSTS_PATH, "w", encoding="utf-8") as f:
        f.write(content)
    flush_dns()


def clear_hosts_redirect():
    with open(HOSTS_PATH, "r", encoding="utf-8") as f:
        content = f.read()
    cleaned = remove_existing_block(content).rstrip() + "\n"
    with open(HOSTS_PATH, "w", encoding="utf-8") as f:
        f.write(cleaned)
    flush_dns()


def save_state(data):
    with open(STATE_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)


def load_state():
    if not os.path.exists(STATE_FILE):
        return None
    try:
        with open(STATE_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return None


def clear_state():
    try:
        if os.path.exists(STATE_FILE):
            os.remove(STATE_FILE)
    except Exception:
        pass


def generate_unlock_code(length=8):
    chars = string.ascii_uppercase + string.digits
    return "".join(random.choice(chars) for _ in range(length))


def log_event(text):
    stamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    try:
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write(f"[{stamp}] {text}\n")
    except Exception:
        pass


def can_bind_local_port(port):
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        s.bind(("127.0.0.1", port))
        return True
    except OSError:
        return False
    finally:
        s.close()


class FocusBlockerApp:
    BG = "#f3f6ff"
    BG_2 = "#e9eefc"
    PANEL = "#ffffff"
    PANEL_2 = "#ffffff"
    CARD = "#f7f9ff"
    CARD_ALT = "#f9fbff"
    TEXT = "#192033"
    MUTED = "#5f6c8f"
    PERI = "#506cff"
    PERI_2 = "#2f4de0"
    SUCCESS = "#1f8f61"
    WARNING = "#a77207"
    INPUT_BG = "#eef3ff"
    TRACK = "#d8e1f9"
    DANGER = "#c13131"

    def __init__(self, root):
        self.root = root
        self.root.title(APP_TITLE)
        self.root.geometry("1340x860")
        self.root.minsize(1220, 760)
        self.root.configure(bg=self.BG)

        self.active = False
        self.session_end_ts = 0
        self.timer_job = None
        self.monitor_thread = None
        self.stop_monitor_flag = False
        self.block_server = None
        self.block_server_thread = None

        self.unlock_code = ""
        self.allowed_sites = []
        self.blocked_sites = []
        self.blocked_apps = []
        self.hard_blocked_sites = []
        self.hard_blocked_apps = []
        self.last_popup_times = {}
        self.session_started_at = None

        self._configure_ttk()
        self.build_ui()
        self.restore_previous_session()

    def _configure_ttk(self):
        self.style = ttk.Style()
        try:
            self.style.theme_use("clam")
        except Exception:
            pass
        self.style.configure(
            "Xy.Vertical.TScrollbar",
            background="#9bb1ff",
            troughcolor=self.TRACK,
            bordercolor=self.TRACK,
            darkcolor="#7f99ff",
            lightcolor="#b1c2ff",
            arrowcolor="#213169",
            relief="flat",
            width=12
        )

    def _make_text_panel(self, parent, title, subtitle, default_lines):
        wrap = tk.Frame(parent, bg=self.CARD_ALT, highlightthickness=1, highlightbackground="#cdd8f7")
        header = tk.Frame(wrap, bg=self.CARD_ALT)
        header.pack(fill="x", padx=14, pady=(14, 8))
        tk.Label(header, text=title, font=("Segoe UI Semibold", 12), fg=self.TEXT, bg=self.CARD_ALT).pack(anchor="w")
        tk.Label(header, text=subtitle, font=("Segoe UI", 9), fg=self.MUTED, bg=self.CARD_ALT, wraplength=500, justify="left").pack(anchor="w", pady=(4, 0))

        text_wrap = tk.Frame(wrap, bg=self.CARD_ALT)
        text_wrap.pack(fill="both", expand=True, padx=(12, 10), pady=(0, 12))
        text = tk.Text(
            text_wrap,
            wrap="word",
            font=("Consolas", 10),
            bg=self.INPUT_BG,
            fg=self.TEXT,
            insertbackground=self.TEXT,
            relief="flat",
            borderwidth=0,
            highlightthickness=1,
            highlightbackground="#c8d3f2",
            highlightcolor=self.PERI_2,
            padx=12,
            pady=12,
            selectbackground="#dce5ff",
            selectforeground=self.TEXT
        )
        text.pack(side="left", fill="both", expand=True)
        scrollbar = ttk.Scrollbar(text_wrap, orient="vertical", command=text.yview, style="Xy.Vertical.TScrollbar")
        scrollbar.pack(side="right", fill="y", padx=(8, 0))
        text.configure(yscrollcommand=scrollbar.set)
        text.insert("1.0", "\n".join(default_lines))
        return wrap, text

    def _make_stat_card(self, parent, title, value, value_fg=None):
        card = tk.Frame(parent, bg=self.CARD_ALT, highlightthickness=1, highlightbackground="#d3dcf6")
        card.pack(fill="x", pady=(0, 10))
        tk.Label(card, text=title, font=("Segoe UI", 10), fg=self.MUTED, bg=self.CARD_ALT).pack(anchor="w", padx=14, pady=(12, 4))
        lbl = tk.Label(card, text=value, font=("Consolas", 15, "bold"), fg=value_fg or self.TEXT, bg=self.CARD_ALT)
        lbl.pack(anchor="w", padx=14, pady=(0, 12))
        return lbl

    def build_ui(self):
        self.bg_canvas = tk.Canvas(self.root, bg=self.BG, highlightthickness=0, bd=0)
        self.bg_canvas.place(relx=0, rely=0, relwidth=1, relheight=1)
        self.bg_canvas.bind("<Configure>", self._draw_background)

        self.app_shell = tk.Frame(self.root, bg=self.BG)
        self.app_shell.place(relx=0, rely=0, relwidth=1, relheight=1)

        self.topnav = tk.Frame(self.app_shell, bg=self.PANEL, height=88, highlightthickness=1, highlightbackground="#cdd8f7")
        self.topnav.pack(fill="x", padx=18, pady=(16, 10))
        self.topnav.pack_propagate(False)

        nav_inner = tk.Frame(self.topnav, bg=self.PANEL)
        nav_inner.pack(fill="both", expand=True, padx=18, pady=10)

        brand_col = tk.Frame(nav_inner, bg=self.PANEL)
        brand_col.pack(side="left", fill="y")
        tk.Label(brand_col, text=APP_TITLE, font=("Segoe UI", 22, "bold"), fg=self.PERI_2, bg=self.PANEL).pack(anchor="w")
        tk.Label(brand_col, text="Safe local focus blocker", font=("Segoe UI", 10), fg=self.MUTED, bg=self.PANEL).pack(anchor="w", pady=(2, 0))

        nav_right = tk.Frame(nav_inner, bg=self.PANEL)
        nav_right.pack(side="right", fill="y")
        self.status_pill = tk.Label(nav_right, text="IDLE", font=("Segoe UI", 10, "bold"), fg="#ffffff", bg="#2b9469", padx=14, pady=8)
        self.status_pill.pack(anchor="e", pady=(0, 6))
        self.countdown_pill = tk.Label(nav_right, text="--:--:--", font=("Consolas", 14, "bold"), fg=self.TEXT, bg="#eaf0ff", padx=14, pady=8)
        self.countdown_pill.pack(anchor="e")

        self.page_layout = tk.Frame(self.app_shell, bg=self.BG)
        self.page_layout.pack(fill="both", expand=True, padx=18, pady=(0, 18))
        self.page_layout.grid_columnconfigure(0, weight=0)
        self.page_layout.grid_columnconfigure(1, weight=1)
        self.page_layout.grid_rowconfigure(0, weight=1)

        self.sidebar = tk.Frame(self.page_layout, bg=self.PANEL, width=360, highlightthickness=1, highlightbackground="#cdd8f7")
        self.sidebar.grid(row=0, column=0, sticky="nsw", padx=(0, 14))
        self.sidebar.pack_propagate(False)

        self.main_content = tk.Frame(self.page_layout, bg=self.PANEL_2, highlightthickness=1, highlightbackground="#cdd8f7")
        self.main_content.grid(row=0, column=1, sticky="nsew")

        self._build_sidebar()
        self._build_main_content()

    def _build_sidebar(self):
        side_scroll_wrap = tk.Frame(self.sidebar, bg=self.PANEL)
        side_scroll_wrap.pack(fill="both", expand=True)
        side_canvas = tk.Canvas(side_scroll_wrap, bg=self.PANEL, highlightthickness=0, bd=0)
        side_scrollbar = ttk.Scrollbar(side_scroll_wrap, orient="vertical", command=side_canvas.yview, style="Xy.Vertical.TScrollbar")
        side_canvas.configure(yscrollcommand=side_scrollbar.set)
        side_canvas.pack(side="left", fill="both", expand=True)
        side_scrollbar.pack(side="right", fill="y")

        side_inner = tk.Frame(side_canvas, bg=self.PANEL)
        side_window = side_canvas.create_window((0, 0), window=side_inner, anchor="nw")

        def _sync_sidebar_canvas(_event=None):
            side_canvas.configure(scrollregion=side_canvas.bbox("all"))
            side_canvas.itemconfigure(side_window, width=side_canvas.winfo_width())

        side_inner.bind("<Configure>", _sync_sidebar_canvas)
        side_canvas.bind("<Configure>", _sync_sidebar_canvas)
        side_canvas.bind_all("<MouseWheel>", lambda event: side_canvas.yview_scroll(int(-1 * (event.delta / 120)), "units"))

        side_inner.pack_propagate(False)
        side_inner.configure(width=320)

        tk.Label(side_inner, text="Session Setup", font=("Segoe UI", 15, "bold"), fg=self.PERI_2, bg=self.PANEL).pack(anchor="w")
        tk.Label(side_inner, text="Timer keeps counting even if the window is closed.", font=("Segoe UI", 10), fg=self.MUTED, bg=self.PANEL).pack(anchor="w", pady=(4, 16))

        session_card = tk.Frame(side_inner, bg=self.CARD, highlightthickness=1, highlightbackground="#d3dcf6")
        session_card.pack(fill="x", pady=(0, 14))

        tk.Label(session_card, text="Minutes", font=("Segoe UI", 10, "bold"), fg=self.TEXT, bg=self.CARD).pack(anchor="w", padx=14, pady=(14, 6))
        self.duration_entry = tk.Entry(session_card, font=("Segoe UI", 16, "bold"), bg=self.INPUT_BG, fg=self.TEXT, insertbackground=self.TEXT, relief="flat", justify="center", highlightthickness=1, highlightbackground="#c8d3f2", highlightcolor=self.PERI_2)
        self.duration_entry.pack(fill="x", padx=14, pady=(0, 14), ipady=10)
        self.duration_entry.insert(0, "60")

        self.allow_mode_var = tk.BooleanVar(value=True)
        self.hard_site_var = tk.BooleanVar(value=True)
        self.hard_app_var = tk.BooleanVar(value=True)
        self.browser_popup_var = tk.BooleanVar(value=True)

        toggles = tk.Frame(side_inner, bg=self.PANEL)
        toggles.pack(fill="x", pady=(0, 12))
        self._check(toggles, "Allow-list mode for websites", self.allow_mode_var).pack(anchor="w", pady=3)
        self._check(toggles, "Exact hard-block sites enabled", self.hard_site_var).pack(anchor="w", pady=3)
        self._check(toggles, "Exact hard-block apps enabled", self.hard_app_var).pack(anchor="w", pady=3)
        self._check(toggles, "Show popup when app is blocked", self.browser_popup_var).pack(anchor="w", pady=3)

        self.status_label = self._make_stat_card(side_inner, "Status", "Idle", self.SUCCESS)
        self.countdown_label = self._make_stat_card(side_inner, "Time Left", "--:--:--", self.TEXT)
        self.code_label = self._make_stat_card(side_inner, "Session Code", "Not generated", self.WARNING)

        action_card = tk.Frame(side_inner, bg=self.PANEL)
        action_card.pack(fill="x", pady=(6, 0))

        self.start_button = tk.Button(action_card, text="START FOCUS SESSION", command=self.start_session, font=("Segoe UI", 12, "bold"), bg=self.PERI, fg="#ffffff", activebackground=self.PERI_2, activeforeground="#ffffff", relief="flat", bd=0, cursor="hand2", padx=12, pady=16)
        self.start_button.pack(fill="x", pady=(0, 10))

        self.generate_code_button = tk.Button(action_card, text="GENERATE / SHOW CODE", command=self.show_current_code, font=("Segoe UI", 10, "bold"), bg="#dde5ff", fg="#1d2d61", activebackground="#d0dcff", activeforeground="#1d2d61", relief="flat", bd=0, cursor="hand2", padx=12, pady=12)
        self.generate_code_button.pack(fill="x", pady=(0, 10))

        self.code_entry = tk.Entry(action_card, font=("Consolas", 12, "bold"), bg=self.INPUT_BG, fg=self.TEXT, insertbackground=self.TEXT, relief="flat", justify="center", highlightthickness=1, highlightbackground="#c8d3f2", highlightcolor=self.PERI_2)
        self.code_entry.pack(fill="x", pady=(0, 10), ipady=10)
        self.code_entry.bind("<Return>", lambda event: self.try_unlock_with_code())

        self.code_submit_button = tk.Button(action_card, text="ENTER CODE TO STOP", command=self.try_unlock_with_code, font=("Segoe UI", 10, "bold"), bg="#dde5ff", fg="#1d2d61", activebackground="#d0dcff", activeforeground="#1d2d61", relief="flat", bd=0, cursor="hand2", padx=12, pady=12)
        self.code_submit_button.pack(fill="x", pady=(0, 10))

        self.reset_button = tk.Button(action_card, text="Reset Defaults", command=self.reset_defaults, font=("Segoe UI", 10, "bold"), bg="#dde5ff", fg="#1d2d61", activebackground="#d0dcff", activeforeground="#1d2d61", relief="flat", bd=0, cursor="hand2", padx=12, pady=12)
        self.reset_button.pack(fill="x")

    def _check(self, parent, text, variable):
        return tk.Checkbutton(parent, text=text, variable=variable, onvalue=True, offvalue=False, bg=self.PANEL, fg=self.TEXT, selectcolor=self.INPUT_BG, activebackground=self.PANEL, activeforeground=self.TEXT, font=("Segoe UI", 10), highlightthickness=0, bd=0, wraplength=300, justify="left")

    def _build_main_content(self):
        main_inner = tk.Frame(self.main_content, bg=self.PANEL_2)
        main_inner.pack(fill="both", expand=True, padx=14, pady=14)

        header = tk.Frame(main_inner, bg=self.PANEL_2)
        header.pack(fill="x", pady=(0, 12))
        tk.Label(header, text="Rules", font=("Segoe UI", 16, "bold"), fg=self.TEXT, bg=self.PANEL_2).pack(anchor="w")
        tk.Label(header, text="Allowed sites are for matching sub-URLs. Exact hard-block items match exactly. Website enforcement is domain-level only.", font=("Segoe UI", 10), fg=self.MUTED, bg=self.PANEL_2, wraplength=850, justify="left").pack(anchor="w", pady=(4, 0))

        grid = tk.Frame(main_inner, bg=self.PANEL_2)
        grid.pack(fill="both", expand=True)
        grid.grid_columnconfigure(0, weight=1)
        grid.grid_columnconfigure(1, weight=1)
        grid.grid_rowconfigure(0, weight=1)
        grid.grid_rowconfigure(1, weight=1)

        p1, self.allowed_sites_box = self._make_text_panel(grid, "Allowed websites", "If chatgpt.com is listed, sub-URLs under it count as allowed", DEFAULT_ALLOWED_SITES)
        p1.grid(row=0, column=0, sticky="nsew", padx=(0, 8), pady=(0, 8))
        p2, self.blocked_sites_box = self._make_text_panel(grid, "Domain-blocked websites", "Redirects matching domains to the local SITE BLOCKED page", DEFAULT_BLOCKED_SITES)
        p2.grid(row=0, column=1, sticky="nsew", padx=(8, 0), pady=(0, 8))
        p3, self.hard_sites_box = self._make_text_panel(grid, "Exact hard-block site paths", "Examples: chatgpt.com/codex. Stored and shown in UI, but browser-wide exact path enforcement is not guaranteed from this script alone.", DEFAULT_HARD_BLOCKED_SITES)
        p3.grid(row=1, column=0, sticky="nsew", padx=(0, 8), pady=(8, 0))
        p4, self.blocked_apps_box = self._make_text_panel(grid, "Blocked applications", "One .exe per line", DEFAULT_BLOCKED_APPS)
        p4.grid(row=1, column=1, sticky="nsew", padx=(8, 0), pady=(8, 0))

        bottom = tk.Frame(main_inner, bg=self.PANEL_2)
        bottom.pack(fill="x", pady=(12, 0))
        extra, self.hard_apps_box = self._make_text_panel(bottom, "Exact hard-block apps", "Exact process-name match only", DEFAULT_HARD_BLOCKED_APPS)
        extra.pack(fill="both", expand=True)

    def _draw_background(self, event=None):
        self.bg_canvas.delete("all")
        w = self.bg_canvas.winfo_width()
        h = self.bg_canvas.winfo_height()
        if w <= 1 or h <= 1:
            return
        self.bg_canvas.create_rectangle(0, 0, w, h, fill=self.BG, outline="")
        steps = 24
        for i in range(steps):
            ratio = i / max(steps - 1, 1)
            color = self._blend(self.BG, self.BG_2, ratio)
            y1 = int((h / steps) * i)
            y2 = int((h / steps) * (i + 1))
            self.bg_canvas.create_rectangle(0, y1, w, y2, fill=color, outline="")

    def _blend(self, c1, c2, t):
        c1 = c1.lstrip("#")
        c2 = c2.lstrip("#")
        r1, g1, b1 = int(c1[0:2], 16), int(c1[2:4], 16), int(c1[4:6], 16)
        r2, g2, b2 = int(c2[0:2], 16), int(c2[2:4], 16), int(c2[4:6], 16)
        r = int(r1 + (r2 - r1) * t)
        g = int(g1 + (g2 - g1) * t)
        b = int(b1 + (b2 - b1) * t)
        return f"#{r:02x}{g:02x}{b:02x}"

    def reset_defaults(self):
        if self.active:
            messagebox.showwarning("Blocked", "You can't reset the lists while a session is active.")
            return
        self._replace_text(self.allowed_sites_box, DEFAULT_ALLOWED_SITES)
        self._replace_text(self.blocked_sites_box, DEFAULT_BLOCKED_SITES)
        self._replace_text(self.blocked_apps_box, DEFAULT_BLOCKED_APPS)
        self._replace_text(self.hard_sites_box, DEFAULT_HARD_BLOCKED_SITES)
        self._replace_text(self.hard_apps_box, DEFAULT_HARD_BLOCKED_APPS)
        self.allow_mode_var.set(True)
        self.hard_site_var.set(True)
        self.hard_app_var.set(True)
        self.browser_popup_var.set(True)

    def _replace_text(self, widget, lines):
        widget.delete("1.0", tk.END)
        widget.insert("1.0", "\n".join(lines))

    def format_time(self, seconds):
        seconds = max(0, int(seconds))
        hours = seconds // 3600
        minutes = (seconds % 3600) // 60
        secs = seconds % 60
        return f"{hours:02}:{minutes:02}:{secs:02}"

    def time_left(self):
        return max(0, int(self.session_end_ts - time.time())) if self.session_end_ts else 0

    def build_state_data(self):
        return {
            "active": self.active,
            "session_end_ts": self.session_end_ts,
            "unlock_code": self.unlock_code,
            "allowed_sites": self.allowed_sites,
            "blocked_sites": self.blocked_sites,
            "blocked_apps": self.blocked_apps,
            "hard_blocked_sites": self.hard_blocked_sites,
            "hard_blocked_apps": self.hard_blocked_apps,
            "allow_mode": self.allow_mode_var.get(),
            "hard_sites_enabled": self.hard_site_var.get(),
            "hard_apps_enabled": self.hard_app_var.get(),
            "popup_enabled": self.browser_popup_var.get(),
            "session_started_at": self.session_started_at
        }

    def save_current_state(self):
        try:
            save_state(self.build_state_data())
        except Exception:
            pass

    def show_current_code(self):
        if not self.active:
            messagebox.showinfo("No active session", "Start a focus session first.")
            return
        messagebox.showinfo("Session Code", f"Your current unlock code is:\n\n{self.unlock_code}\n\nSave it somewhere safe.")

    def try_unlock_with_code(self):
        if not self.active:
            messagebox.showinfo("Not active", "No focus session is running.")
            return
        entered = self.code_entry.get().strip().upper()
        if entered == self.unlock_code:
            log_event("Correct unlock code entered. Session ended.")
            self.cleanup_session(show_message=True, message="Correct code entered. Focus session ended.")
        else:
            log_event(f"Wrong unlock code attempt: {entered}")
            messagebox.showerror("Wrong code", "That code is incorrect.")
            self.code_entry.delete(0, tk.END)

    def should_show_popup(self, key, cooldown=5):
        now = time.time()
        last_time = self.last_popup_times.get(key, 0)
        if now - last_time >= cooldown:
            self.last_popup_times[key] = now
            return True
        return False

    def show_blocked_popup(self, title, text, cooldown_key):
        if not self.browser_popup_var.get():
            return
        if not self.should_show_popup(cooldown_key):
            return
        try:
            self.root.after(0, lambda: messagebox.showwarning(title, text))
        except Exception:
            pass

    def start_block_page_server(self):
        if self.block_server is not None:
            return
        if not can_bind_local_port(BLOCK_PAGE_PORT):
            raise RuntimeError(f"Port {BLOCK_PAGE_PORT} is already in use. Free it, then try again.")
        self.block_server = ThreadingHTTPServer(("127.0.0.1", BLOCK_PAGE_PORT), BlockPageHandler)
        self.block_server_thread = threading.Thread(target=self.block_server.serve_forever, daemon=True)
        self.block_server_thread.start()
        log_event(f"Local block page server started on http://127.0.0.1:{BLOCK_PAGE_PORT}")

    def stop_block_page_server(self):
        if self.block_server is None:
            return
        try:
            self.block_server.shutdown()
            self.block_server.server_close()
        except Exception:
            pass
        self.block_server = None
        self.block_server_thread = None

    def build_effective_domain_redirects(self):
        domains = set(self.blocked_sites)
        if self.allow_mode_var.get():
            # This script cannot discover every site on the internet. In allow-list mode,
            # only the listed blocked domains are enforced globally via hosts redirects.
            # Allowed sites are preserved in saved config and for exact matching helpers.
            pass
        return sorted(domains)

    def process_name_matches_exact(self, proc_name, exact_list):
        return proc_name.lower() in {item.lower() for item in exact_list}

    def process_name_matches_block(self, proc_name, block_list):
        return proc_name.lower() in {item.lower() for item in block_list}

    def monitor_apps_loop(self, blocked_apps, hard_apps, hard_enabled):
        while not self.stop_monitor_flag:
            try:
                for proc in psutil.process_iter(["pid", "name"]):
                    try:
                        name = proc.info.get("name")
                        if not name:
                            continue
                        kill_it = False
                        reason = None
                        if self.process_name_matches_block(name, blocked_apps):
                            kill_it = True
                            reason = "blocked application"
                        if hard_enabled and self.process_name_matches_exact(name, hard_apps):
                            kill_it = True
                            reason = "hard-blocked application"
                        if kill_it:
                            try:
                                proc.kill()
                            except Exception:
                                continue
                            log_event(f"Closed {name} ({reason})")
                            self.show_blocked_popup("Blocked Application", f"{name} was blocked and closed because it matches your session rules.", f"app:{name.lower()}")
                    except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
                        continue
                    except Exception:
                        continue
                time.sleep(1)
            except Exception:
                time.sleep(1)

    def sync_timer_labels(self):
        remaining = self.time_left()
        formatted = self.format_time(remaining)
        self.countdown_label.config(text=formatted)
        self.countdown_pill.config(text=formatted)
        self.save_current_state()
        if remaining <= 0:
            self.finish_session()
            return
        self.timer_job = self.root.after(1000, self.sync_timer_labels)

    def collect_rules(self):
        allowed_sites = normalize_domains(self.allowed_sites_box.get("1.0", tk.END))
        blocked_sites = normalize_domains(self.blocked_sites_box.get("1.0", tk.END))
        blocked_apps = normalize_apps(self.blocked_apps_box.get("1.0", tk.END))
        hard_blocked_sites = normalize_lines(self.hard_sites_box.get("1.0", tk.END), lower=True)
        hard_blocked_apps = normalize_apps(self.hard_apps_box.get("1.0", tk.END))
        return allowed_sites, blocked_sites, blocked_apps, hard_blocked_sites, hard_blocked_apps

    def start_session(self):
        if self.active:
            messagebox.showinfo("Already running", "A focus session is already active.")
            return

        raw_minutes = self.duration_entry.get().strip()
        if not raw_minutes.isdigit():
            messagebox.showerror("Invalid time", "Enter a valid number of minutes.")
            return
        minutes = int(raw_minutes)
        if minutes <= 0:
            messagebox.showerror("Invalid time", "Minutes must be greater than 0.")
            return

        allowed_sites, blocked_sites, blocked_apps, hard_blocked_sites, hard_blocked_apps = self.collect_rules()
        if not allowed_sites and not blocked_sites and not blocked_apps and not hard_blocked_apps:
            messagebox.showerror("Nothing to enforce", "Add at least one rule before starting.")
            return

        confirm = messagebox.askyesno(
            "Start focus session?",
            f"Run for {minutes} minute(s)?\n\n"
            f"Allowed sites: {len(allowed_sites)}\n"
            f"Blocked domains: {len(blocked_sites)}\n"
            f"Blocked apps: {len(blocked_apps)}\n"
            f"Hard-block site paths: {len(hard_blocked_sites)}\n"
            f"Hard-block apps: {len(hard_blocked_apps)}"
        )
        if not confirm:
            return

        try:
            self.start_block_page_server()
            redirects = self.build_effective_domain_redirects()
            if redirects:
                apply_hosts_redirect(redirects)
        except PermissionError:
            messagebox.showerror("Permission error", "Run this script as Administrator.")
            return
        except Exception as e:
            messagebox.showerror("Error", f"Couldn't start the website redirect layer.\n\n{e}")
            return

        self.active = True
        self.session_end_ts = time.time() + (minutes * 60)
        self.unlock_code = generate_unlock_code()
        self.allowed_sites = allowed_sites[:]
        self.blocked_sites = blocked_sites[:]
        self.blocked_apps = blocked_apps[:]
        self.hard_blocked_sites = hard_blocked_sites[:]
        self.hard_blocked_apps = hard_blocked_apps[:]
        self.session_started_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        self.status_label.config(text="Active", fg=self.WARNING)
        self.status_pill.config(text="ACTIVE", fg="#fff1d2", bg="#4f3815")
        self.code_label.config(text=self.unlock_code, fg=self.WARNING)

        self.stop_monitor_flag = False
        self.monitor_thread = threading.Thread(
            target=self.monitor_apps_loop,
            args=(self.blocked_apps, self.hard_blocked_apps, self.hard_app_var.get()),
            daemon=True
        )
        self.monitor_thread.start()

        self.save_current_state()
        log_event(f"Session started | minutes={minutes} | code={self.unlock_code}")
        messagebox.showinfo(
            "Session Started",
            f"Focus session is now active.\n\nUnlock code:\n{self.unlock_code}\n\n"
            f"Timer continues even if you close the window."
        )
        self.sync_timer_labels()

    def finish_session(self):
        self.cleanup_session(show_message=True, message="Time's up. Session finished.")

    def cleanup_session(self, show_message=False, message=""):
        self.stop_monitor_flag = True
        try:
            clear_hosts_redirect()
        except Exception as e:
            messagebox.showerror("Error", f"Couldn't clear website redirects cleanly.\n\n{e}")
        self.stop_block_page_server()

        self.active = False
        self.session_end_ts = 0
        if self.timer_job is not None:
            self.root.after_cancel(self.timer_job)
            self.timer_job = None

        self.status_label.config(text="Idle", fg=self.SUCCESS)
        self.countdown_label.config(text="--:--:--")
        self.status_pill.config(text="IDLE", fg="#dfffee", bg="#173224")
        self.countdown_pill.config(text="--:--:--")
        self.code_label.config(text="Not generated", fg=self.SUCCESS)

        self.unlock_code = ""
        self.allowed_sites = []
        self.blocked_sites = []
        self.blocked_apps = []
        self.hard_blocked_sites = []
        self.hard_blocked_apps = []
        self.last_popup_times = {}
        self.session_started_at = None

        self.code_entry.delete(0, tk.END)
        clear_state()
        if show_message:
            messagebox.showinfo(APP_TITLE, message)

    def restore_previous_session(self):
        data = load_state()
        if not data or not data.get("active"):
            return

        self.active = True
        self.session_end_ts = float(data.get("session_end_ts", 0))
        self.unlock_code = data.get("unlock_code", "")
        self.allowed_sites = data.get("allowed_sites", [])
        self.blocked_sites = data.get("blocked_sites", [])
        self.blocked_apps = data.get("blocked_apps", [])
        self.hard_blocked_sites = data.get("hard_blocked_sites", [])
        self.hard_blocked_apps = data.get("hard_blocked_apps", [])
        self.session_started_at = data.get("session_started_at")
        self.allow_mode_var.set(bool(data.get("allow_mode", True)))
        self.hard_site_var.set(bool(data.get("hard_sites_enabled", True)))
        self.hard_app_var.set(bool(data.get("hard_apps_enabled", True)))
        self.browser_popup_var.set(bool(data.get("popup_enabled", True)))

        self._replace_text(self.allowed_sites_box, self.allowed_sites)
        self._replace_text(self.blocked_sites_box, self.blocked_sites)
        self._replace_text(self.blocked_apps_box, self.blocked_apps)
        self._replace_text(self.hard_sites_box, self.hard_blocked_sites)
        self._replace_text(self.hard_apps_box, self.hard_blocked_apps)

        remaining = self.time_left()
        if remaining <= 0:
            clear_state()
            self.active = False
            return

        self.status_label.config(text="Active", fg=self.WARNING)
        self.status_pill.config(text="ACTIVE", fg="#fff1d2", bg="#4f3815")
        self.code_label.config(text=self.unlock_code or "Missing", fg=self.WARNING)

        try:
            self.start_block_page_server()
            redirects = self.build_effective_domain_redirects()
            if redirects:
                apply_hosts_redirect(redirects)
        except Exception:
            pass

        self.stop_monitor_flag = False
        self.monitor_thread = threading.Thread(
            target=self.monitor_apps_loop,
            args=(self.blocked_apps, self.hard_blocked_apps, self.hard_app_var.get()),
            daemon=True
        )
        self.monitor_thread.start()

        log_event("Previous active session restored on app launch.")
        messagebox.showinfo("Session Restored", "An active focus session was found and restored. The timer kept running while the window was closed.")
        self.sync_timer_labels()

    def on_close(self):
        if self.active:
            self.save_current_state()
            log_event("Window closed while session still active.")
        self.root.destroy()


def main():
    app_root = tk.Tk()
    app = FocusBlockerApp(app_root)
    app_root.protocol("WM_DELETE_WINDOW", app.on_close)
    app_root.mainloop()


if __name__ == "__main__":
    try:
        if not is_admin():
            result = relaunch_as_admin()
            if result <= 32:
                show_fatal_error(
                    "Admin launch failed",
                    "Windows did not relaunch the script as administrator.\n\nTry right-clicking the file and running it with Python, or run it from terminal with:\npy studystar_v2_safe.py"
                )
            raise SystemExit
        main()
    except Exception:
        error_text = traceback.format_exc()
        show_fatal_error(f"{APP_TITLE} crashed", error_text[-3500:])
        raise
