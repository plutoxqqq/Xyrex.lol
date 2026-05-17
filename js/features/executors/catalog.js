import { products } from '../../data/executors.js';
import { tagSymbolMap } from '../../data/tagSymbols.js';
import { svgIcons } from '../../data/icons.js';
import { qs, qsa, escapeHtml, stripTrailingPeriod } from '../../core/dom.js';
import { openModal } from './modal.js';

export function createTagSymbols(product) {
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

export function getPlatformLogo(platform) {
  return svgIcons[platform] ? `<span class="icon-svg">${svgIcons[platform]}</span>` : '•';
}

export function createPlatformChips(platforms) {
  const wrap = document.createElement('div');
  wrap.className = 'platform-chips no-text-select';

  (platforms || []).forEach(platform => {
    const chip = document.createElement('span');
    chip.className = 'platform-chip';
    chip.innerHTML = `<span class="platform-logo">${getPlatformLogo(platform)}</span><span>${escapeHtml(platform)}</span>`;
    wrap.appendChild(chip);
  });

  return wrap;
}

export function getPriceLabel(product) {
  if (product.freeOrPaid === 'both') return 'Free + Paid';
  return product.freeOrPaid === 'free' ? 'Free' : 'Paid';
}

export function createProductCard(product, index) {
  const card = document.createElement('article');
  card.className = 'card';
  if (product.featured) card.classList.add('featured-card');
  card.setAttribute('data-index', index);
  card.setAttribute('data-name', product.name);
  card.dataset.officialSite = product.officialSite || '';
  card.dataset.officialDiscord = product.officialDiscord || '';
  card.dataset.status = product.status || '';
  card.dataset.trustLevel = product.trustLevel || '';
  card.dataset.stability = product.stability || '';

  const body = document.createElement('div');
  body.className = 'card-body';

  const header = document.createElement('div');
  header.className = 'card-header';

  const left = document.createElement('div');
  left.className = 'card-header-left no-text-select';

  const name = document.createElement('div');
  name.className = 'product-name';
  name.textContent = product.name;

  left.appendChild(name);
  const right = document.createElement('div');
  right.className = 'card-header-right';

  const sunc = document.createElement('div');
  sunc.className = 'sunc no-text-select';
  sunc.textContent = Number.isFinite(product.sunc) ? `sUNC ${product.sunc}%` : 'sUNC None';

  right.appendChild(sunc);
  right.appendChild(createTagSymbols(product));

  header.appendChild(left);
  header.appendChild(right);

  const summary = document.createElement('p');
  summary.className = 'summary';
  summary.textContent = stripTrailingPeriod(product.description);

  const price = document.createElement('div');
  price.className = 'price no-text-select';
  price.textContent = getPriceLabel(product);

  body.appendChild(header);
  body.appendChild(createPlatformChips(product.platform));
  body.appendChild(summary);
  body.appendChild(price);

  const infoBtn = document.createElement('button');
  infoBtn.className = 'info-btn';
  infoBtn.textContent = 'More Info';
  infoBtn.addEventListener('click', () => openModal(product));

  card.appendChild(body);
  card.appendChild(infoBtn);
  return card;
}

export function renderProducts(list) {
  const grid = qs('#productGrid');
  const sorted = [...list].sort((a, b) => {
    if (a.featured === b.featured) return a.name.localeCompare(b.name);
    return a.featured ? -1 : 1;
  });

  if (!grid.dataset.renderVersion) grid.dataset.renderVersion = '0';
  const nextVersion = String(Number(grid.dataset.renderVersion) + 1);
  grid.dataset.renderVersion = nextVersion;

  const oldCards = Array.from(grid.querySelectorAll('.card'));
  if (!oldCards.length) {
    grid.innerHTML = '';
    qs('#noResults').hidden = Boolean(sorted.length);
    if (!sorted.length) return;
    sorted.forEach((product, index) => grid.appendChild(createProductCard(product, index)));
    return;
  }

  const oldRectByName = new Map(oldCards.map(card => [card.getAttribute('data-name'), card.getBoundingClientRect()]));
  const nextNames = new Set(sorted.map(item => item.name));

  oldCards.forEach(card => {
    if (!nextNames.has(card.getAttribute('data-name'))) card.classList.add('card-exit');
  });

  window.setTimeout(() => {
    if (grid.dataset.renderVersion !== nextVersion) return;

    grid.innerHTML = '';
    qs('#noResults').hidden = Boolean(sorted.length);
    if (!sorted.length) return;

    sorted.forEach((product, index) => {
      const card = createProductCard(product, index);
      grid.appendChild(card);

      const oldRect = oldRectByName.get(product.name);
      if (!oldRect) {
        card.classList.add('card-enter');
        return;
      }

      const newRect = card.getBoundingClientRect();
      const deltaX = oldRect.left - newRect.left;
      const deltaY = oldRect.top - newRect.top;
      if (Math.abs(deltaX) < 0.5 && Math.abs(deltaY) < 0.5) return;

      card.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
      card.style.transition = 'transform 0s';
      requestAnimationFrame(() => {
        card.classList.add('card-shift');
        card.style.transform = '';
        card.style.transition = '';
      });
    });
  }, 180);
}

export function getActiveFilters() {
  const active = {};
  qsa('.filter-checkbox').forEach(input => {
    if (!input.checked) return;
    const group = input.getAttribute('data-filter-group');
    if (!active[group]) active[group] = [];
    active[group].push(input.value);
  });
  return active;
}

export function getPriceControls() {
  return { free: qs('#priceFree').checked, paid: qs('#pricePaid').checked, both: qs('#priceBoth').checked };
}

export function isPriceMatch(prod, priceControls) {
  if (!priceControls.free && !priceControls.paid && !priceControls.both) return true;

  if (priceControls.free && priceControls.paid) return ['free', 'paid', 'both'].includes(prod.freeOrPaid);
  if (priceControls.both) return prod.freeOrPaid === 'both';
  if (priceControls.free) return prod.freeOrPaid === 'free' || prod.freeOrPaid === 'both';
  if (priceControls.paid) return prod.freeOrPaid === 'paid' || prod.freeOrPaid === 'both';
  return false;
}

export function applyAllFilters() {
  const active = getActiveFilters();
  const priceControls = getPriceControls();
  const searchText = qs('#searchInput').value.trim();

  const filtered = products.filter(prod => {
    if (searchText && !prod.name.toLowerCase().includes(searchText.toLowerCase())) return false;
    if (active.platform?.length && !active.platform.every(platform => (prod.platform || []).includes(platform))) return false;
    if (active.tags?.length && !active.tags.every(tag => [...(prod.tags || []), ...(prod.features || [])].includes(tag))) return false;
    if (active.cheatType?.length && !active.cheatType.includes(prod.cheatType)) return false;
    if (active.keySystem?.length && !active.keySystem.includes(prod.keySystem)) return false;
    if (!isPriceMatch(prod, priceControls)) return false;
    return true;
  });

  renderProducts(filtered);
}

