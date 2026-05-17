#!/usr/bin/env python3
"""One-time refactor helper: split CSS/JS into modular layout."""
from __future__ import annotations

import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def write(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8", newline="\n")


def split_css() -> None:
    src = (ROOT / "style.css").read_text(encoding="utf-8")
    lines = src.splitlines(keepends=True)

    def chunk(start: int, end: int) -> str:
        return "".join(lines[start - 1 : end])

    chunks = {
        "css/base/variables.css": chunk(1, 27),
        "css/base/reset.css": chunk(29, 69),
        "css/layout/header.css": chunk(71, 114),
        "css/layout/grid.css": chunk(116, 137),
        "css/features/executors.css": chunk(139, 187),
        "css/components/modals.css": chunk(189, 230),
        "css/components/buttons.css": chunk(232, 235),
        "css/layout/navigation.css": chunk(237, 248),
        "css/features/script-hub.css": chunk(250, 278),
        "css/features/dodge.css": chunk(279, 335),
        "css/utilities/animations.css": chunk(347, 386),
        "css/utilities/responsive.css": chunk(388, 531),
        "css/features/settings.css": chunk(545, 571) + chunk(573, 710) + chunk(724, 761),
        "css/features/new-ui-compat.css": "",  # placeholder; new-ui has own file
    }

    for rel, content in chunks.items():
        if content.strip():
            write(ROOT / rel, content)

    main_css = """/* Xyrex.lol — master stylesheet (preserve import order) */
@import "./base/variables.css";
@import "./base/reset.css";
@import "./layout/header.css";
@import "./layout/grid.css";
@import "./features/executors.css";
@import "./components/modals.css";
@import "./components/buttons.css";
@import "./layout/navigation.css";
@import "./features/script-hub.css";
@import "./features/dodge.css";
@import "./utilities/animations.css";
@import "./utilities/responsive.css";
@import "./features/settings.css";
@import "./features/new-ui.css";
"""
    write(ROOT / "css/main.css", main_css)

    new_ui_src = (ROOT / "new-ui.css").read_text(encoding="utf-8")
    write(ROOT / "css/features/new-ui.css", new_ui_src)


def extract_script_data() -> None:
    script = (ROOT / "script.js").read_text(encoding="utf-8")

    m_products = re.search(r"^const products = \[(.*?)^\];", script, re.S | re.M)
    m_hub = re.search(r"^const scriptsHubData = \{(.*?)^\};", script, re.S | re.M)
    m_discord = re.search(r"^const XYREX_OFFICIAL_DISCORD_URL = (.+);", script, re.M)
    m_wordmark = re.search(r"^const discordWordmarkSvg = (.+);", script, re.M)
    m_icons = re.search(r"^const svgIcons = \{(.*?)^\};", script, re.S | re.M)
    m_tags = re.search(r"^const tagSymbolMap = \{(.*?)^\};", script, re.S | re.M)

    write(ROOT / "js/data/executors.js", f"export const products = [{m_products.group(1)}];\n")
    write(
        ROOT / "js/data/scriptHub.js",
        "\n".join(
            [
                f"export const XYREX_OFFICIAL_DISCORD_URL = {m_discord.group(1)};",
                f"export const discordWordmarkSvg = {m_wordmark.group(1)};",
                f"export const scriptsHubData = {{{m_hub.group(1)}}};",
            ]
        )
        + "\n",
    )
    write(ROOT / "js/data/icons.js", f"export const svgIcons = {{{m_icons.group(1)}}};\n")
    write(
        ROOT / "js/data/tagSymbols.js",
        "import { svgIcons } from './icons.js';\n\n"
        f"export const tagSymbolMap = {{{m_tags.group(1)}}};\n",
    )


def convert_iife_to_module(src_path: Path, dest_path: Path, window_export: str | None, init_call: str | None) -> None:
    text = src_path.read_text(encoding="utf-8").strip()
    if text.startswith("(() =>"):
        text = text[len("(() =>") :].strip()
    elif text.startswith("(function ()"):
        text = text[len("(function ()") :].strip()
    elif text.startswith("(function()"):
        text = text[len("(function()") :].strip()

    if text.endswith("})();"):
        text = text[: -len("})();")].strip()
    elif text.endswith("})();"):
        text = text[: -5].strip()

    if text.startswith("{"):
        text = text[1:].strip()
    if text.endswith("})"):
        text = text[:-2].strip()
    if text.endswith("}"):
        text = text[:-1].strip()

    footer = ""
    if window_export:
        footer += f"\n\nexport function register{window_export}() {{\n  // window binding applied in source\n}}\n"

    write(dest_path, text + footer)


def move_legacy_modules() -> None:
    shutil.copy2(ROOT / "xyrex-dodge.js", ROOT / "js/features/dodge/xyrexDodge.js")
    shutil.copy2(ROOT / "account-auth.js", ROOT / "js/features/auth/accountAuth.js")
    shutil.copy2(ROOT / "new-ui.js", ROOT / "js/features/newUi/newUi.js")
    shutil.copy2(ROOT / "supabase-config.js", ROOT / "js/config/supabase.js")

    for path in [
        ROOT / "js/features/dodge/xyrexDodge.js",
        ROOT / "js/features/auth/accountAuth.js",
        ROOT / "js/features/newUi/newUi.js",
        ROOT / "js/config/supabase.js",
    ]:
        text = path.read_text(encoding="utf-8")
        if "(() =>" in text[:20] or "(function" in text[:20]:
            # strip IIFE wrapper, keep body
            t = text.strip()
            if t.startswith("(() => {"):
                t = t[7:-5]  # remove () => { and })();
            elif t.startswith("(function () {"):
                t = t[14:-5]
            elif t.startswith("(function() {"):
                t = t[13:-5]
            path.write_text(t.strip() + "\n", encoding="utf-8")

    dodge = (ROOT / "js/features/dodge/xyrexDodge.js").read_text(encoding="utf-8")
    if "window.XyrexDodge" in dodge and "export function initDodge" not in dodge:
        dodge = dodge.rstrip() + "\n\nexport function initDodge() {\n  // API registered on window.XyrexDodge by legacy init block above\n}\n"
        write(ROOT / "js/features/dodge/xyrexDodge.js", dodge)

    auth = (ROOT / "js/features/auth/accountAuth.js").read_text(encoding="utf-8")
    auth = auth.replace("  window.XyrexAuth.initialize();\n})();", "  window.XyrexAuth.initialize();\n")
    auth = auth.replace("})();", "")
    if "export function initAuth" not in auth:
        auth += "\n\nexport function initAuth() {\n  if (window.XyrexAuth?.initialize) window.XyrexAuth.initialize();\n}\n"
    write(ROOT / "js/features/auth/accountAuth.js", auth)

    supa = (ROOT / "js/config/supabase.js").read_text(encoding="utf-8")
    if "export function initSupabaseConfig" not in supa:
        supa += "\n\nexport function initSupabaseConfig() {\n  // configures window.__XYREX_SUPABASE_CONFIG\n}\n"
    write(ROOT / "js/config/supabase.js", supa)

    new_ui = (ROOT / "js/features/newUi/newUi.js").read_text(encoding="utf-8")
    new_ui = new_ui.replace("link.href = '/new-ui.css?v=2.1.0';", "link.href = './css/features/new-ui.css?v=2.1.0';")
    new_ui = new_ui.replace("})();", "")
    if "export async function loadNewUi" not in new_ui:
        new_ui += """

export async function loadNewUi() {
  if (window.XyrexNewUI) return true;
  return Boolean(window.XyrexNewUI);
}
"""
    write(ROOT / "js/features/newUi/newUi.js", new_ui)


def main() -> None:
    split_css()
    extract_script_data()
    move_legacy_modules()
    print("Refactor scaffolding complete.")


if __name__ == "__main__":
    main()
