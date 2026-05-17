import { qs } from '../../core/dom.js';
import { escapeHtml, stripTrailingPeriod } from '../../core/utils.js';

export function createTagSymbols(product, tagSymbolMap) {
  const wrap = document.createElement('div');
  wrap.className = 'tag-symbols no-text-select';
  [...new Set(product.tags || [])].forEach(tag => {
    const config = tagSymbolMap[tag];
    if (!config) return;
    const marker = document.createElement('span');
    marker.className = `legend-icon ${config.cls}`;
    if (config.isSvg) marker.innerHTML = `<span class="icon-svg">${config.symbol}</span>`;
    else marker.textContent = config.symbol;
    marker.title = tag;
    marker.setAttribute('aria-label', tag);
    wrap.appendChild(marker);
  });
  return wrap;
}

export function createPlatformChips(platforms, svgIcons) {
  const wrap = document.createElement('div');
  wrap.className = 'platform-chips no-text-select';
  (platforms || []).forEach(platform => {
    const chip = document.createElement('span');
    chip.className = 'platform-chip';
    const icon = svgIcons[platform] ? `<span class="icon-svg">${svgIcons[platform]}</span>` : '•';
    chip.innerHTML = `<span class="platform-logo">${icon}</span><span>${escapeHtml(platform)}</span>`;
    wrap.appendChild(chip);
  });
  return wrap;
}

export const getPriceLabel = product => (product.freeOrPaid === 'both' ? 'Free + Paid' : product.freeOrPaid === 'free' ? 'Free' : 'Paid');
const buildExpandedExecutorDescription = product => `${stripTrailingPeriod(product.description)}. It targets ${(product.platform||[]).join(', ') || 'Unknown platforms'}, includes ${((product.features||[]).join(', ') || 'No standout features listed').toLowerCase()}, and is offered through ${(product.pricingOptions||[]).join(', ') || getPriceLabel(product)}.`;

export function createProductCard(product, index, ctx) {
  const { openModal, openSuncSimulationModal, tagSymbolMap, svgIcons } = ctx;
  const card = document.createElement('article');
  card.className = 'card';
  if (product.featured) card.classList.add('featured-card');
  card.setAttribute('data-index', index);
  card.setAttribute('data-name', product.name);
  const body = document.createElement('div'); body.className = 'card-body';
  const header = document.createElement('div'); header.className = 'card-header';
  const left = document.createElement('div'); left.className = 'card-header-left no-text-select';
  const name = document.createElement('div'); name.className = 'product-name'; name.textContent = product.name; left.appendChild(name);
  const right = document.createElement('div'); right.className = 'card-header-right';
  const sunc = document.createElement('div'); sunc.className = 'sunc no-text-select'; sunc.textContent = Number.isFinite(product.sunc) ? `sUNC ${product.sunc}%` : 'sUNC None'; sunc.addEventListener('click', () => openSuncSimulationModal(product));
  right.appendChild(sunc); right.appendChild(createTagSymbols(product, tagSymbolMap)); header.appendChild(left); header.appendChild(right);
  const summary = document.createElement('p'); summary.className = 'summary'; summary.textContent = buildExpandedExecutorDescription(product);
  const price = document.createElement('div'); price.className = 'price no-text-select'; price.textContent = getPriceLabel(product);
  body.appendChild(header); body.appendChild(createPlatformChips(product.platform, svgIcons)); body.appendChild(summary); body.appendChild(price);
  const infoBtn = document.createElement('button'); infoBtn.className = 'info-btn'; infoBtn.textContent = 'More Info'; infoBtn.addEventListener('click', () => openModal(product));
  card.appendChild(body); card.appendChild(infoBtn);
  return card;
}

export function renderProducts(list, ctx) {
  const grid = qs('#productGrid');
  const sorted = [...list].sort((a,b)=>a.featured===b.featured?a.name.localeCompare(b.name):a.featured?-1:1);
  grid.innerHTML = '';
  qs('#noResults').hidden = Boolean(sorted.length);
  sorted.forEach((product,index)=>grid.appendChild(createProductCard(product,index,ctx)));
}
