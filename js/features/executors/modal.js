import { qs } from '../../core/dom.js';
import { escapeHtml } from '../../core/dom.js';

export function openModal(product) {
  const overlay = qs('#modalOverlay');
  const content = qs('#modalContent');

  const officialSite = product.officialSite || '';
  const officialSiteHost = officialSite
    ? (() => {
        try {
          return new URL(officialSite).hostname;
        } catch {
          return officialSite;
        }
      })()
    : 'Not provided';

  const faviconUrl = officialSite
    ? `https://www.google.com/s2/favicons?sz=64&domain_url=${encodeURIComponent(officialSite)}`
    : '';

  const officialDiscord = product.officialDiscord || XYREX_OFFICIAL_DISCORD_URL;
  const officialDiscordHost = officialDiscord
    ? (() => {
        try {
          return new URL(officialDiscord).hostname;
        } catch {
          return officialDiscord;
        }
      })()
    : 'Not provided';

  content.innerHTML = `
    <h2>${escapeHtml(product.name)}</h2>
    <p class="modal-headline">${escapeHtml(stripTrailingPeriod(product.description))}</p>
    <div class="modal-layout">
      <div>
        <div class="modal-section"><strong>Pros</strong><ul>${product.pros.map(f => `<li>${escapeHtml(f)}</li>`).join('')}</ul></div>
        <div class="modal-section"><strong>Cons</strong><ul>${product.cons.map(i => `<li>${escapeHtml(i)}</li>`).join('')}</ul></div>
        <div class="modal-section"><strong>Pricing</strong><ul>${product.pricingOptions.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul></div>
      </div>
      <aside class="status-panel">
        <h3>Status</h3>
        <div class="status-item"><span>Current State</span><strong>${escapeHtml(product.status)}</strong></div>
        <div class="status-item"><span>Trust Level</span><strong>${escapeHtml(product.trustLevel)}</strong></div>
        <div class="status-item"><span>Stability</span><strong>${escapeHtml(product.stability)}</strong></div>
        <div class="status-item"><span>sUNC</span><strong>${Number.isFinite(product.sunc) ? `${product.sunc}%` : 'None'}</strong></div>
        <div class="status-item status-site">
          <span>Official Site</span>
          ${
            officialSite
              ? `<a class="official-link-btn" href="${escapeHtml(officialSite)}" target="_blank" rel="noopener noreferrer">
                   ${faviconUrl ? `<img src="${escapeHtml(faviconUrl)}" alt="Site icon" />` : ''}
                   <span>${escapeHtml(officialSiteHost)}</span>
                 </a>`
              : `<span class="no-site">Not provided</span>`
          }
        </div>
        <div class="status-item status-site">
          <span>Official Discord</span>
          ${
            officialDiscord
              ? `<a class="official-link-btn" href="${escapeHtml(officialDiscord)}" target="_blank" rel="noopener noreferrer" aria-label="Official Discord server">
                   ${discordWordmarkSvg}
                   <span>${escapeHtml(officialDiscordHost)}</span>
                 </a>`
              : `<span class="no-site">Not provided</span>`
          }
        </div>
      </aside>
    </div>`;

  overlay.classList.remove('is-closing');
  overlay.setAttribute('aria-hidden', 'false');
  qs('#modalCloseBtn').focus();
}

