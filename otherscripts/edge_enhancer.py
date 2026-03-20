"""Compact Xyrex-themed Edge utility with a responsive customtkinter UI.

This rewrite replaces the previous oversized interface with a smaller, safer,
and more maintainable control panel. The application focuses on practical Edge
helpers such as process detection, quick links, profile persistence, and
copy-to-clipboard productivity actions.
"""

from __future__ import annotations

import json
import subprocess
import webbrowser
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Callable

import customtkinter as ctk
import psutil
import pyperclip
from tkinter import messagebox

ctk.set_appearance_mode("dark")
ctk.set_default_color_theme("blue")

THEME = {
    "bg": "#06070d",
    "bg_alt": "#0a0c14",
    "panel": "#111426",
    "panel_alt": "#12172b",
    "card": "#161b33",
    "border": "#2b3561",
    "text": "#eef1ff",
    "muted": "#aeb5d6",
    "accent": "#8f9cff",
    "accent_soft": "#b2bcff",
    "success": "#5dd39e",
    "warning": "#f0c36f",
}

APP_DIR = Path(__file__).resolve().parent
STATE_FILE = APP_DIR / "edge_enhancer_state.json"
LOG_LIMIT = 250


@dataclass(frozen=True)
class Module:
    """Single quick action shown in the interface."""

    key: str
    title: str
    category: str
    summary: str
    action_label: str
    action: Callable[[], None]


class EdgeEnhancer(ctk.CTk):
    def __init__(self) -> None:
        super().__init__()
        self.title("Xyrex Edge Enhancer")
        self.geometry("1120x720")
        self.minsize(980, 620)
        self.configure(fg_color=THEME["bg"])

        self.modules: list[Module] = []
        self.filtered_modules: list[Module] = []
        self.module_cards: list[ctk.CTkFrame] = []
        self.selected_module: Module | None = None
        self.log_entries: list[str] = []
        self.state = self.load_state()

        self.configure_grid()
        self.build_modules()
        self.build_layout()
        self.refresh_stats()
        self.apply_filters()
        self.log("Interface ready.")

    def configure_grid(self) -> None:
        self.grid_columnconfigure(0, weight=0)
        self.grid_columnconfigure(1, weight=1)
        self.grid_rowconfigure(1, weight=1)
        self.grid_rowconfigure(2, weight=0)

    def load_state(self) -> dict:
        if not STATE_FILE.exists():
            return {"last_category": "All", "search": ""}
        try:
            return json.loads(STATE_FILE.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            return {"last_category": "All", "search": ""}

    def save_state(self) -> None:
        payload = {
            "last_category": self.category_var.get(),
            "search": self.search_var.get().strip(),
            "saved_at": datetime.now().isoformat(timespec="seconds"),
        }
        STATE_FILE.write_text(json.dumps(payload, indent=2), encoding="utf-8")
        self.log("Preferences saved.")

    def build_modules(self) -> None:
        self.modules = [
            Module(
                key="launch",
                title="Launch Edge",
                category="Browser",
                summary="Start Microsoft Edge directly or fall back to the default browser if Edge is unavailable.",
                action_label="Launch",
                action=self.launch_edge,
            ),
            Module(
                key="detect",
                title="Detect Edge Processes",
                category="Browser",
                summary="Scan running processes and report how many Edge instances are active.",
                action_label="Scan",
                action=self.detect_edge_processes,
            ),
            Module(
                key="home",
                title="Open Xyrex",
                category="Quick Links",
                summary="Open the main Xyrex.lol site in a browser tab.",
                action_label="Open",
                action=lambda: self.open_url("https://xyrex.lol", "Opened Xyrex.lol."),
            ),
            Module(
                key="newui",
                title="Open Xyrex New UI",
                category="Quick Links",
                summary="Open the new Xyrex interface for visual parity and quick reference.",
                action_label="Open",
                action=lambda: self.open_url("https://xyrex.lol/newui/", "Opened the Xyrex New UI."),
            ),
            Module(
                key="extensions",
                title="Open Edge Extensions",
                category="Quick Links",
                summary="Jump straight to the Edge extensions manager page.",
                action_label="Open",
                action=lambda: self.open_url("edge://extensions", "Requested the Edge extensions page."),
            ),
            Module(
                key="settings",
                title="Open Edge Settings",
                category="Quick Links",
                summary="Open the main Edge settings page to adjust profiles, privacy, or startup behavior.",
                action_label="Open",
                action=lambda: self.open_url("edge://settings", "Requested the Edge settings page."),
            ),
            Module(
                key="privacy",
                title="Privacy Review Checklist",
                category="Productivity",
                summary="Copy a concise privacy hardening checklist for Edge into the clipboard.",
                action_label="Copy",
                action=lambda: self.copy_text(
                    "Privacy Review Checklist\n"
                    "1. Review tracking prevention settings.\n"
                    "2. Clear browsing data as needed.\n"
                    "3. Audit extensions and remove anything unused.\n"
                    "4. Check password monitor and security alerts.",
                    "Copied the privacy checklist.",
                ),
            ),
            Module(
                key="flags",
                title="Performance Flags Reference",
                category="Productivity",
                summary="Copy a short reference of commonly reviewed Edge flags and diagnostic pages.",
                action_label="Copy",
                action=lambda: self.copy_text(
                    "Edge Diagnostics Reference\n"
                    "edge://settings/system\n"
                    "edge://gpu\n"
                    "edge://discards\n"
                    "edge://version\n"
                    "Review each page before changing any setting.",
                    "Copied the Edge diagnostics reference.",
                ),
            ),
            Module(
                key="workspace",
                title="Open Work Tabs",
                category="Workspace",
                summary="Open a compact three-tab workspace: Xyrex, GitHub, and ChatGPT.",
                action_label="Open",
                action=self.open_workspace,
            ),
            Module(
                key="notes",
                title="Copy Session Notes Template",
                category="Workspace",
                summary="Copy a clean notes template for browser testing or debugging sessions.",
                action_label="Copy",
                action=lambda: self.copy_text(
                    "Session Notes\n"
                    "- Goal:\n"
                    "- Current issue:\n"
                    "- Reproduction steps:\n"
                    "- Expected result:\n"
                    "- Actual result:\n"
                    "- Next action:",
                    "Copied the session notes template.",
                ),
            ),
        ]

    def build_layout(self) -> None:
        self.build_header()
        self.build_sidebar()
        self.build_main_panel()
        self.build_footer()

    def build_header(self) -> None:
        header = ctk.CTkFrame(self, fg_color=THEME["panel"], corner_radius=18, border_width=1, border_color=THEME["border"])
        header.grid(row=0, column=0, columnspan=2, sticky="nsew", padx=16, pady=(16, 10))
        header.grid_columnconfigure(0, weight=1)

        title_wrap = ctk.CTkFrame(header, fg_color="transparent")
        title_wrap.grid(row=0, column=0, sticky="w", padx=18, pady=14)
        ctk.CTkLabel(
            title_wrap,
            text="Xyrex Edge Enhancer",
            text_color=THEME["text"],
            font=ctk.CTkFont(size=28, weight="bold"),
        ).pack(anchor="w")
        ctk.CTkLabel(
            title_wrap,
            text="Compact, responsive browser helpers styled after the Xyrex palette.",
            text_color=THEME["muted"],
            font=ctk.CTkFont(size=13),
        ).pack(anchor="w", pady=(4, 0))

        actions = ctk.CTkFrame(header, fg_color="transparent")
        actions.grid(row=0, column=1, sticky="e", padx=18, pady=14)
        ctk.CTkButton(actions, text="Detect Edge", command=self.detect_edge_processes, width=120, fg_color=THEME["card"], hover_color=THEME["panel_alt"], border_width=1, border_color=THEME["border"]).pack(side="left", padx=(0, 8))
        ctk.CTkButton(actions, text="Launch Edge", command=self.launch_edge, width=120, fg_color=THEME["accent"], hover_color=THEME["accent_soft"], text_color=THEME["bg"]).pack(side="left")

    def build_sidebar(self) -> None:
        sidebar = ctk.CTkFrame(self, width=290, fg_color=THEME["panel"], corner_radius=18, border_width=1, border_color=THEME["border"])
        sidebar.grid(row=1, column=0, sticky="nsew", padx=(16, 10), pady=(0, 10))
        sidebar.grid_propagate(False)
        sidebar.grid_rowconfigure(4, weight=1)

        ctk.CTkLabel(sidebar, text="Controls", text_color=THEME["text"], font=ctk.CTkFont(size=20, weight="bold")).grid(row=0, column=0, sticky="w", padx=16, pady=(16, 8))

        self.search_var = ctk.StringVar(value=self.state.get("search", ""))
        search = ctk.CTkEntry(
            sidebar,
            textvariable=self.search_var,
            placeholder_text="Search modules",
            fg_color=THEME["card"],
            border_color=THEME["border"],
            text_color=THEME["text"],
        )
        search.grid(row=1, column=0, sticky="ew", padx=16)
        search.bind("<KeyRelease>", lambda _event: self.apply_filters())

        categories = ["All", "Browser", "Quick Links", "Productivity", "Workspace"]
        self.category_var = ctk.StringVar(value=self.state.get("last_category", "All"))
        selector = ctk.CTkOptionMenu(
            sidebar,
            values=categories,
            variable=self.category_var,
            command=lambda _choice: self.apply_filters(),
            fg_color=THEME["card"],
            button_color=THEME["accent"],
            button_hover_color=THEME["accent_soft"],
            text_color=THEME["text"],
            dropdown_fg_color=THEME["panel_alt"],
            dropdown_hover_color=THEME["card"],
        )
        selector.grid(row=2, column=0, sticky="ew", padx=16, pady=12)

        stats = ctk.CTkFrame(sidebar, fg_color=THEME["card"], corner_radius=16)
        stats.grid(row=3, column=0, sticky="ew", padx=16, pady=(0, 12))
        self.edge_count_label = ctk.CTkLabel(stats, text="Edge processes: 0", text_color=THEME["text"], font=ctk.CTkFont(size=15, weight="bold"))
        self.edge_count_label.pack(anchor="w", padx=14, pady=(12, 4))
        self.module_count_label = ctk.CTkLabel(stats, text="Visible modules: 0", text_color=THEME["muted"], font=ctk.CTkFont(size=13))
        self.module_count_label.pack(anchor="w", padx=14, pady=(0, 12))

        self.module_list = ctk.CTkScrollableFrame(sidebar, fg_color="transparent")
        self.module_list.grid(row=4, column=0, sticky="nsew", padx=12, pady=(0, 12))

        ctk.CTkButton(sidebar, text="Save preferences", command=self.save_state, fg_color=THEME["card"], hover_color=THEME["panel_alt"], border_width=1, border_color=THEME["border"]).grid(row=5, column=0, sticky="ew", padx=16, pady=(0, 16))

    def build_main_panel(self) -> None:
        main = ctk.CTkFrame(self, fg_color=THEME["panel_alt"], corner_radius=18, border_width=1, border_color=THEME["border"])
        main.grid(row=1, column=1, sticky="nsew", padx=(0, 16), pady=(0, 10))
        main.grid_columnconfigure(0, weight=1)
        main.grid_rowconfigure(1, weight=1)
        main.grid_rowconfigure(2, weight=1)

        hero = ctk.CTkFrame(main, fg_color=THEME["card"], corner_radius=16)
        hero.grid(row=0, column=0, sticky="ew", padx=16, pady=16)
        hero.grid_columnconfigure(0, weight=1)
        self.hero_title = ctk.CTkLabel(hero, text="Select a module", text_color=THEME["text"], font=ctk.CTkFont(size=24, weight="bold"))
        self.hero_title.grid(row=0, column=0, sticky="w", padx=18, pady=(16, 4))
        self.hero_summary = ctk.CTkLabel(hero, text="Choose an item from the left to see what it does.", text_color=THEME["muted"], justify="left", wraplength=620, font=ctk.CTkFont(size=14))
        self.hero_summary.grid(row=1, column=0, sticky="w", padx=18, pady=(0, 16))
        self.hero_button = ctk.CTkButton(hero, text="Run action", command=self.run_selected_module, width=140, fg_color=THEME["accent"], hover_color=THEME["accent_soft"], text_color=THEME["bg"], state="disabled")
        self.hero_button.grid(row=0, column=1, rowspan=2, sticky="e", padx=18)

        tips = ctk.CTkTextbox(main, fg_color=THEME["card"], border_color=THEME["border"], border_width=1, text_color=THEME["text"], wrap="word")
        tips.grid(row=1, column=0, sticky="nsew", padx=16, pady=(0, 12))
        tips.insert(
            "1.0",
            "Xyrex style notes\n\n"
            "• Dark layered panels with periwinkle highlights.\n"
            "• Smaller layout to avoid oversized controls.\n"
            "• Safer actions: links, clipboard helpers, and process checks only.\n"
            "• No global hotkeys, mass automation, or disruptive background tasks.",
        )
        tips.configure(state="disabled")

        self.log_box = ctk.CTkTextbox(main, fg_color=THEME["bg_alt"], border_color=THEME["border"], border_width=1, text_color=THEME["accent_soft"], wrap="word")
        self.log_box.grid(row=2, column=0, sticky="nsew", padx=16, pady=(0, 16))
        self.log_box.configure(state="disabled")

    def build_footer(self) -> None:
        footer = ctk.CTkFrame(self, fg_color="transparent")
        footer.grid(row=2, column=0, columnspan=2, sticky="ew", padx=16, pady=(0, 14))
        self.status_label = ctk.CTkLabel(footer, text="Ready.", text_color=THEME["muted"], font=ctk.CTkFont(size=12))
        self.status_label.pack(side="left")

    def apply_filters(self) -> None:
        search_term = self.search_var.get().strip().lower()
        category = self.category_var.get()
        self.filtered_modules = [
            module
            for module in self.modules
            if (category == "All" or module.category == category)
            and (not search_term or search_term in f"{module.title} {module.summary} {module.category}".lower())
        ]
        self.render_module_cards()
        self.module_count_label.configure(text=f"Visible modules: {len(self.filtered_modules)}")
        if self.selected_module not in self.filtered_modules:
            self.select_module(self.filtered_modules[0] if self.filtered_modules else None)

    def render_module_cards(self) -> None:
        for card in self.module_cards:
            card.destroy()
        self.module_cards.clear()

        for module in self.filtered_modules:
            card = ctk.CTkFrame(self.module_list, fg_color=THEME["card"], corner_radius=14, border_width=1, border_color=THEME["border"])
            card.pack(fill="x", padx=4, pady=5)
            card.grid_columnconfigure(0, weight=1)

            title = ctk.CTkButton(
                card,
                text=module.title,
                anchor="w",
                command=lambda item=module: self.select_module(item),
                fg_color="transparent",
                hover_color=THEME["panel_alt"],
                text_color=THEME["text"],
                font=ctk.CTkFont(size=14, weight="bold"),
            )
            title.grid(row=0, column=0, sticky="ew", padx=10, pady=(8, 0))
            ctk.CTkLabel(card, text=module.category, text_color=THEME["accent_soft"], font=ctk.CTkFont(size=11)).grid(row=1, column=0, sticky="w", padx=12)
            ctk.CTkLabel(card, text=module.summary, text_color=THEME["muted"], justify="left", wraplength=220, font=ctk.CTkFont(size=12)).grid(row=2, column=0, sticky="ew", padx=12, pady=(2, 8))
            action = ctk.CTkButton(card, text=module.action_label, width=78, command=lambda item=module: self.execute_module(item), fg_color=THEME["accent"], hover_color=THEME["accent_soft"], text_color=THEME["bg"])
            action.grid(row=0, column=1, rowspan=3, padx=10, pady=10)
            self.module_cards.append(card)

    def select_module(self, module: Module | None) -> None:
        self.selected_module = module
        if module is None:
            self.hero_title.configure(text="No modules match the current filter")
            self.hero_summary.configure(text="Try another search term or category.")
            self.hero_button.configure(state="disabled", text="Run action")
            return
        self.hero_title.configure(text=module.title)
        self.hero_summary.configure(text=f"{module.summary}\n\nCategory: {module.category}")
        self.hero_button.configure(state="normal", text=module.action_label)

    def run_selected_module(self) -> None:
        if self.selected_module is not None:
            self.execute_module(self.selected_module)

    def execute_module(self, module: Module) -> None:
        self.select_module(module)
        try:
            module.action()
            self.status_label.configure(text=f"Last action: {module.title}")
        except Exception as exc:  # pragma: no cover - UI fallback
            self.log(f"Error while running '{module.title}': {exc}")
            messagebox.showerror("Action failed", f"{module.title} could not complete.\n\n{exc}")

    def refresh_stats(self) -> None:
        edge_count = self.get_edge_process_count()
        self.edge_count_label.configure(text=f"Edge processes: {edge_count}")

    def get_edge_process_count(self) -> int:
        count = 0
        for proc in psutil.process_iter(["name"]):
            name = (proc.info.get("name") or "").lower()
            if "msedge" in name:
                count += 1
        return count

    def detect_edge_processes(self) -> None:
        count = self.get_edge_process_count()
        self.edge_count_label.configure(text=f"Edge processes: {count}")
        self.log(f"Detected {count} Edge process{'es' if count != 1 else ''}.")
        if count:
            self.status_label.configure(text="Edge is currently running.")
        else:
            self.status_label.configure(text="No Edge processes detected.")

    def launch_edge(self) -> None:
        commands = [
            ["msedge"],
            ["microsoft-edge"],
            ["cmd", "/c", "start", "", "microsoft-edge:https://xyrex.lol"],
        ]
        for command in commands:
            try:
                subprocess.Popen(command)
                self.log("Launch request sent to Microsoft Edge.")
                self.status_label.configure(text="Launch request sent.")
                return
            except OSError:
                continue
        webbrowser.open("https://xyrex.lol")
        self.log("Edge was unavailable, so the default browser opened Xyrex.lol instead.")
        self.status_label.configure(text="Opened Xyrex.lol in the default browser.")

    def open_url(self, url: str, log_message: str) -> None:
        webbrowser.open_new_tab(url)
        self.log(log_message)

    def copy_text(self, value: str, log_message: str) -> None:
        pyperclip.copy(value)
        self.log(log_message)
        self.status_label.configure(text="Copied to clipboard.")

    def open_workspace(self) -> None:
        for url in ("https://xyrex.lol", "https://github.com", "https://chatgpt.com"):
            webbrowser.open_new_tab(url)
        self.log("Opened the default three-tab workspace.")
        self.status_label.configure(text="Workspace opened.")

    def log(self, message: str) -> None:
        timestamp = datetime.now().strftime("%H:%M:%S")
        entry = f"[{timestamp}] {message}"
        self.log_entries.append(entry)
        self.log_entries = self.log_entries[-LOG_LIMIT:]
        self.log_box.configure(state="normal")
        self.log_box.delete("1.0", "end")
        self.log_box.insert("1.0", "\n".join(self.log_entries))
        self.log_box.configure(state="disabled")

    def on_close(self) -> None:
        try:
            self.save_state()
        except OSError:
            pass
        self.destroy()


if __name__ == "__main__":
    app = EdgeEnhancer()
    app.protocol("WM_DELETE_WINDOW", app.on_close)
    app.mainloop()
