from pathlib import Path

ROOT = Path(r"c:\Users\ver0016\Xyrex.lol")
script_lines = (ROOT / "script.js").read_text(encoding="utf-8").splitlines()

def slice_lines(start, end):
    return "\n".join(script_lines[start - 1 : end]) + "\n"

def export_functions(code: str) -> str:
    out = []
    for line in code.splitlines():
        if line.startswith("function "):
            line = "export " + line
        elif line.startswith("async function "):
            line = "export async " + line[len("async ") :]
        out.append(line)
    return "\n".join(out) + "\n"

def write(rel: str, content: str) -> None:
    path = ROOT / rel
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8", newline="\n")

# dom helpers (qs/qsa live before line 444 in original)
qs_block = ""
for i, line in enumerate(script_lines):
    if line.startswith("const qs ="):
        qs_block = "\n".join(script_lines[i : i + 2]) + "\n\n"
        break

dom_body = qs_block + slice_lines(444, 451)
write(
    "js/core/dom.js",
    dom_body.replace("const qs =", "export const qs =").replace("const qsa =", "export const qsa =")
    + export_functions(slice_lines(444, 451)).split("\n", 1)[-1],
)

# Fix dom.js - avoid duplicate escapeHtml
write(
    "js/core/dom.js",
    qs_block.replace("const qs =", "export const qs =").replace("const qsa =", "export const qsa =")
    + export_functions(slice_lines(444, 451)),
)

chunks = {
    "js/features/executors/catalog.js": (453, 659),
    "js/features/executors/modal.js": (660, 734),
    "js/features/settings/accountUi.js": (735, 764),
    "js/features/settings/settingsModal.js": (765, 908),
    "js/features/scriptsHub/hub.js": (909, 1027),
    "js/features/newUi/uiMode.js": (1028, 1074),
    "js/core/routing.js": (1075, 1244),
    "js/features/scriptsHub/initHub.js": (1253, 1291),
    "js/core/layout.js": (1293, 1318),
}

for rel, (a, b) in chunks.items():
    write(rel, export_functions(slice_lines(a, b)))

account_listener = """
export function registerAccountChangeListener() {
  window.addEventListener('xyrex:account-changed', () => {
    const overlay = qs('#modalOverlay');
    if (overlay?.getAttribute('aria-hidden') === 'false' && qs('.settings-modal')) {
      openSettingsModal();
    }
  });
}
"""

bootstrap = export_functions(slice_lines(1320, 1374)).replace(
    "document.addEventListener('DOMContentLoaded', init);",
    "",
)
write("js/core/bootstrap.js", bootstrap)
write("js/core/accountListener.js", "import { qs } from './dom.js';\nimport { openSettingsModal } from '../features/settings/settingsModal.js';\n" + account_listener)

# Build import headers per module
headers = {
    "js/features/executors/catalog.js": """import { products } from '../../data/executors.js';
import { tagSymbolMap } from '../../data/tagSymbols.js';
import { svgIcons } from '../../data/icons.js';
import { qs, qsa, escapeHtml, stripTrailingPeriod } from '../../core/dom.js';
""",
    "js/features/executors/modal.js": """import { qs } from '../../core/dom.js';
import { escapeHtml } from '../../core/dom.js';
import { createProductCard } from './catalog.js';
""",
    "js/features/settings/accountUi.js": """import { qs } from '../../core/dom.js';
""",
    "js/features/settings/settingsModal.js": """import { qs, qsa, escapeHtml } from '../../core/dom.js';
import { getAiTokenSummary, getBetaFeaturesEnabled, setBetaFeaturesEnabled, getCurrentAccountName, isGuestAccount } from './accountUi.js';
import { closeModal } from '../executors/modal.js';
import { syncNavButtonsWithPage, setActivePage } from '../../core/routing.js';
import { applyUiMode } from '../newUi/uiMode.js';
""",
    "js/features/scriptsHub/hub.js": """import { scriptsHubData, XYREX_OFFICIAL_DISCORD_URL, discordWordmarkSvg } from '../../data/scriptHub.js';
import { qs, qsa, escapeHtml } from '../../core/dom.js';
""",
    "js/features/newUi/uiMode.js": """import { qs } from '../../core/dom.js';
""",
    "js/core/routing.js": """import { qs, qsa } from './dom.js';
import { applyAllFilters, renderProducts } from '../features/executors/catalog.js';
import { products } from '../data/executors.js';
import { applyUiMode, loadNewUiModule } from '../features/newUi/uiMode.js';
import { openSettingsModal } from '../features/settings/settingsModal.js';
""",
    "js/features/scriptsHub/initHub.js": """import { qs, qsa } from '../../core/dom.js';
import { renderTierList, renderPopularScripts, renderRecentChanges, renderSavedScriptsList, getSavedScripts, setEditorFromSavedScript, saveScriptFromEditor, deleteSelectedScript } from './hub.js';
import { scriptsHubData } from '../../data/scriptHub.js';
import { syncNavButtonsWithPage, setActivePage, setActiveSubtab } from '../../core/routing.js';
""",
    "js/core/layout.js": """import { qs } from './dom.js';
""",
    "js/core/bootstrap.js": """import { products } from '../data/executors.js';
import { qs, qsa } from './dom.js';
import { renderProducts, applyAllFilters } from '../features/executors/catalog.js';
import { closeModal } from '../features/executors/modal.js';
import { openSettingsModal } from '../features/settings/settingsModal.js';
import { getBetaFeaturesEnabled, setBetaFeaturesEnabled } from '../features/settings/accountUi.js';
import { initScriptsHub } from '../features/scriptsHub/initHub.js';
import { syncNavigationLayoutMetrics } from './layout.js';
import { injectLegendIcons, applyRoute, getInitialRoutePath, syncNavButtonsWithPage, setActivePage } from './routing.js';
import { registerAccountChangeListener } from './accountListener.js';
""",
}

for rel, header in headers.items():
    path = ROOT / rel
    body = path.read_text(encoding="utf-8")
    if not body.startswith("import "):
        path.write_text(header + "\n" + body, encoding="utf-8", newline="\n")

# export init from bootstrap
p = ROOT / "js/core/bootstrap.js"
text = p.read_text(encoding="utf-8")
if "export function initApp" not in text:
    text = text.replace("export function init()", "export function initApp()")
    p.write_text(text, encoding="utf-8", newline="\n")

# rename initScriptsHub export in initHub
ih = ROOT / "js/features/scriptsHub/initHub.js"
t = ih.read_text(encoding="utf-8")
t = t.replace("export function initScriptsHub", "export function initScriptsHub")
ih.write_text(t, encoding="utf-8", newline="\n")

main_js = """import { initSupabaseConfig } from './config/supabase.js';
import { initAuth } from './features/auth/accountAuth.js';
import { initDodge } from './features/dodge/xyrexDodge.js';
import { initApp } from './core/bootstrap.js';
import { registerAccountChangeListener } from './core/accountListener.js';

registerAccountChangeListener();

document.addEventListener('DOMContentLoaded', () => {
  initSupabaseConfig();
  initDodge();
  initAuth();
  initApp();
});
"""
write("js/main.js", main_js)

# style shim
write("style.css", '@import url("./css/main.css");\n')

print("split complete")
