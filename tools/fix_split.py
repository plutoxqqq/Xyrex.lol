from pathlib import Path
ROOT = Path(r"c:\Users\ver0016\Xyrex.lol")
lines = (ROOT / "script.js").read_text(encoding="utf-8").splitlines()

def sl(a,b):
    return "\n".join(lines[a-1:b]) + "\n"

def exp(code):
    o=[]
    for line in code.splitlines():
        if line.startswith("function "): line="export "+line
        elif line.startswith("async function "): line="export async "+line[len("async "):]
        o.append(line)
    return "\n".join(o)+"\n"

ui = """import { qs } from '../../core/dom.js';

export const uiModeStorageKey = 'xyrex_ui_mode';
export let isNewUiMode = localStorage.getItem(uiModeStorageKey) === 'new';
let newUiLoadAttempted = false;

""" + exp(sl(1028, 1056)).replace(
    "script.src = '/new-ui.js?v=2.1.0';",
    "import('./newUi.js').then(() => resolve(Boolean(window.XyrexNewUI))).catch(() => resolve(false)); return;"
).replace(
    """  return new Promise(resolve => {
    const script = document.createElement('script');
    import('./newUi.js').then(() => resolve(Boolean(window.XyrexNewUI))).catch(() => resolve(false)); return;
    script.defer = true;
    script.onload = () => resolve(Boolean(window.XyrexNewUI));
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });""",
    "  return import('./newUi.js').then(() => Boolean(window.XyrexNewUI)).catch(() => false);"
)

# simpler rewrite loadNewUiModule body manually
ui = """import { qs } from '../../core/dom.js';

export const uiModeStorageKey = 'xyrex_ui_mode';
export let isNewUiMode = localStorage.getItem(uiModeStorageKey) === 'new';
let newUiLoadAttempted = false;

export function loadNewUiModule() {
  if (window.XyrexNewUI) return Promise.resolve(true);
  if (newUiLoadAttempted) return Promise.resolve(false);
  newUiLoadAttempted = true;
  return import('./newUi.js').then(() => Boolean(window.XyrexNewUI)).catch(() => false);
}

export async function applyUiMode() {
  if (!isNewUiMode) {
    if (window.XyrexNewUI) window.XyrexNewUI.disable();
    return;
  }

  const loaded = await loadNewUiModule();
  if (!loaded || !window.XyrexNewUI) {
    isNewUiMode = false;
    localStorage.setItem(uiModeStorageKey, 'default');
    return;
  }

  window.XyrexNewUI.enable();
}
"""
(ROOT / "js/features/newUi/uiMode.js").write_text(ui, encoding="utf-8", newline="\n")

routing_header = """import { qs, qsa } from './dom.js';
import { applyAllFilters, renderProducts } from '../features/executors/catalog.js';
import { products } from '../data/executors.js';
import { applyUiMode, isNewUiMode, uiModeStorageKey } from '../features/newUi/uiMode.js';
import { restartAnimationClass } from './animations.js';

"""
# animations were in routing - restartAnimationClass is in routing chunk
routing_body = exp(sl(1059, 1244))
(ROOT / "js/core/routing.js").write_text(routing_header + routing_body, encoding="utf-8", newline="\n")

# catalog import openModal
cat = (ROOT / "js/features/executors/catalog.js").read_text(encoding="utf-8")
if "openModal" not in cat.split("import")[0]:
    cat = cat.replace(
        "import { qs, qsa, escapeHtml, stripTrailingPeriod } from '../../core/dom.js';",
        "import { qs, qsa, escapeHtml, stripTrailingPeriod } from '../../core/dom.js';\nimport { openModal } from './modal.js';",
    )
    (ROOT / "js/features/executors/catalog.js").write_text(cat, encoding="utf-8", newline="\n")

modal = (ROOT / "js/features/executors/modal.js").read_text(encoding="utf-8")
modal = modal.replace("import { createProductCard } from './catalog.js';\n", "")
(ROOT / "js/features/executors/modal.js").write_text(modal, encoding="utf-8", newline="\n")

# hub export currentSavedScriptId
hub = (ROOT / "js/features/scriptsHub/hub.js").read_text(encoding="utf-8")
hub = hub.replace("let currentSavedScriptId = null;", "export let currentSavedScriptId = null;")
(ROOT / "js/features/scriptsHub/hub.js").write_text(hub, encoding="utf-8", newline="\n")

ih = (ROOT / "js/features/scriptsHub/initHub.js").read_text(encoding="utf-8")
ih = ih.replace(
    "import { renderTierList, renderPopularScripts, renderRecentChanges, renderSavedScriptsList, getSavedScripts, setEditorFromSavedScript, saveScriptFromEditor, deleteSelectedScript } from './hub.js';",
    "import { renderTierList, renderPopularScripts, renderRecentChanges, renderSavedScriptsList, getSavedScripts, setEditorFromSavedScript, saveScriptFromEditor, deleteSelectedScript, currentSavedScriptId } from './hub.js';",
)
# initHub assigns to currentSavedScriptId - need import as module binding - use hub export and import * or setter
# Actually assigning to imported binding works in ES modules for export let
(ROOT / "js/features/scriptsHub/initHub.js").write_text(ih, encoding="utf-8", newline="\n")

print("fixed uiMode routing catalog")
