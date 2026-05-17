import { qs } from '../../core/dom.js';
import { escapeHtml, stripTrailingPeriod } from '../../core/utils.js';

export function initPopularScripts(ctx) {
  const { scriptsHubData, POPULAR_SCRIPT_CATEGORIES, popularScriptDiscordSvg, popularScriptFileSvg, openNoOfficialDiscordModal } = ctx;
  const wrap = qs('#popularScriptsList'); if (!wrap) return;
  const scripts = Array.isArray(scriptsHubData.popularScripts) ? scriptsHubData.popularScripts : [];
  const grouped = scripts.reduce((a,s)=>{const n=stripTrailingPeriod(s.category||s.game||'Other')||'Other'; (a[n]??=[]).push(s); return a;},{});
  const configured = POPULAR_SCRIPT_CATEGORIES.map(c=>Object.keys(grouped).find(n=>n.toLowerCase()===c.toLowerCase())||c);
  const categories=[...configured,...Object.keys(grouped).filter(c=>!configured.some(x=>x.toLowerCase()===c.toLowerCase()))];
  wrap.innerHTML = categories.map((name,index)=>`<section class="script-category"><button class="script-category-header" type="button" aria-expanded="false" aria-controls="script-category-body-${index}"><span class="script-category-title">${escapeHtml(name)}</span></button><div id="script-category-body-${index}" class="script-category-body">${(grouped[name]||[]).map(script=>{const d=String(script.stats?.discord||'').trim(); const discordUrl=/^https?:\/\//i.test(d)?d:(/^(discord\.gg|discord\.com\/invite)\//i.test(d)?`https://${d}`:''); return `<article class="script-card"><h4>${escapeHtml(script.name)}</h4><p>${escapeHtml(stripTrailingPeriod(script.description))}</p><div class="script-card-meta">${discordUrl?`<a class="script-discord-btn" href="${escapeHtml(discordUrl)}" target="_blank" rel="noopener noreferrer">${popularScriptDiscordSvg}</a>`:`<button class="script-discord-btn script-discord-btn-unavailable" type="button" data-discord-unavailable="true" data-script-name="${escapeHtml(script.name)}">${popularScriptDiscordSvg}</button>`}<button class="script-copy-btn" type="button" data-script-copy="${escapeHtml(script.script)}"><span class="script-file-icon">${popularScriptFileSvg}</span></button></div><pre>${escapeHtml(script.script)}</pre></article>`;}).join('')}</div></section>`).join('');
  if (!wrap.dataset.popularScriptsBound) wrap.addEventListener('click', async event => {
    const unavailable = event.target.closest('[data-discord-unavailable="true"]'); if (unavailable){event.preventDefault(); openNoOfficialDiscordModal(unavailable.getAttribute('data-script-name')||''); return;}
    const copyButton = event.target.closest('.script-copy-btn'); if (!copyButton) return; const v=copyButton.getAttribute('data-script-copy')||''; if(!v)return; try{await navigator.clipboard.writeText(v);}catch{}
  });
  wrap.dataset.popularScriptsBound = 'true';
}
