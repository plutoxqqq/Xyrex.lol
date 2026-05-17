import { scriptsHubData, XYREX_OFFICIAL_DISCORD_URL, discordWordmarkSvg } from '../../data/scriptHub.js';
import { qs, escapeHtml, stripTrailingPeriod } from '../../core/dom.js';

export function renderTierList(containerId, entries) {
  const wrap = qs(`#${containerId}`);
  if (!wrap) return;
  wrap.innerHTML = entries.map(entry => `
    <article class="rank-item rank-tier-${escapeHtml(String(entry.tier || '').toLowerCase())}">
      <div class="rank-badge">${escapeHtml(entry.tier)}</div>
      <div><h4>${escapeHtml(entry.executor)}</h4><p>${escapeHtml(entry.notes)}</p></div>
    </article>`).join('');
}

export function renderPopularScripts() {
  const wrap = qs('#popularScriptsList');
  if (!wrap) return;
  wrap.innerHTML = scriptsHubData.popularScripts.map(item => `
    <article class="script-card"><div class="script-card-head"><h4>${escapeHtml(item.name)}</h4><span>${escapeHtml(stripTrailingPeriod(item.game))}</span></div><p>${escapeHtml(stripTrailingPeriod(item.description))}</p><pre>${escapeHtml(item.script)}</pre></article>`).join('');
}

export function renderRecentChanges() {
  const wrap = qs('#recentChangesList');
  if (!wrap) return;
  wrap.innerHTML = scriptsHubData.recentChanges.map(entry => `<li>${escapeHtml(entry)}</li>`).join('');
}

const savedScriptsStorageKey = 'voxlis_saved_scripts';
let currentSavedScriptId = null;

export function setCurrentSavedScriptId(nextId) {
  currentSavedScriptId = nextId || null;
}

export function getCurrentSavedScriptId() {
  return currentSavedScriptId;
}

export function getSavedScripts() {
  try {
    const parsed = JSON.parse(localStorage.getItem(savedScriptsStorageKey) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeSavedScripts(items) {
  localStorage.setItem(savedScriptsStorageKey, JSON.stringify(items));
}

export function renderSavedScriptsList() {
  const wrap = qs('#savedScriptsList');
  if (!wrap) return;

  const items = getSavedScripts();
  if (!items.length) {
    wrap.innerHTML = '<p class="saved-empty">No saved scripts yet</p>';
    return;
  }

  wrap.innerHTML = items.map(item => `
    <button class="saved-script-item ${item.id === getCurrentSavedScriptId() ? 'is-active' : ''}" data-saved-script-id="${escapeHtml(item.id)}" type="button">
      <strong>${escapeHtml(item.title)}</strong>
      <span>${new Date(item.updatedAt).toLocaleString()}</span>
    </button>`).join('');
}

export function clearSavedScriptEditor() {
  const nameInput = qs('#savedScriptName');
  const bodyInput = qs('#savedScriptBody');
  if (!nameInput || !bodyInput) return;
  nameInput.value = '';
  bodyInput.value = '';
  qs('#savedScriptError').hidden = true;
}

export function setEditorFromSavedScript(item) {
  const nameInput = qs('#savedScriptName');
  const bodyInput = qs('#savedScriptBody');
  if (!nameInput || !bodyInput) return;
  nameInput.value = item?.title || '';
  bodyInput.value = item?.body || '';
}

export function saveScriptFromEditor() {
  const nameInput = qs('#savedScriptName');
  const bodyInput = qs('#savedScriptBody');
  const errorBlock = qs('#savedScriptError');
  if (!nameInput || !bodyInput || !errorBlock) return;

  const trimmedTitle = nameInput.value.trim();
  const trimmedBody = bodyInput.value.trim();

  if (!trimmedTitle || !trimmedBody) {
    errorBlock.hidden = false;
    return;
  }

  errorBlock.hidden = true;

  const items = getSavedScripts();
  const scriptToPersist = {
    id: getCurrentSavedScriptId() || `script_${Date.now()}`,
    title: trimmedTitle,
    body: bodyInput.value,
    updatedAt: Date.now()
  };

  const withoutCurrent = items.filter(item => item.id !== getCurrentSavedScriptId());
  writeSavedScripts([scriptToPersist, ...withoutCurrent]);
  setCurrentSavedScriptId(null);
  clearSavedScriptEditor();
  renderSavedScriptsList();
  nameInput.focus();
}

export function deleteSelectedScript() {
  if (!getCurrentSavedScriptId()) return;
  const items = getSavedScripts().filter(item => item.id !== getCurrentSavedScriptId());
  writeSavedScripts(items);
  setCurrentSavedScriptId(null);
  clearSavedScriptEditor();
  renderSavedScriptsList();
}

