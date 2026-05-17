import { qs, qsa } from '../../core/dom.js';

export function getActiveFilters() {
  const vals = name => qsa(`.filter-checkbox[data-filter="${name}"]:checked`).map(c => c.value);
  return {
    status: vals('status'), trust: vals('trust'), stability: vals('stability'), platform: vals('platform'), keySystem: vals('keySystem'), tags: vals('tags'), execution: vals('execution')
  };
}

export function getPriceControls() {
  const selected = qsa('.price-checkbox:checked').map(cb => cb.value);
  return { includeFree: selected.includes('free'), includePaid: selected.includes('paid') };
}

export function isPriceMatch(prod, priceControls) {
  const { includeFree, includePaid } = priceControls;
  if (!includeFree && !includePaid) return true;
  if (prod.freeOrPaid === 'both') return includeFree || includePaid;
  if (prod.freeOrPaid === 'free') return includeFree;
  if (prod.freeOrPaid === 'paid') return includePaid;
  return false;
}

export function applyAllFilters(products, renderProducts) {
  const f = getActiveFilters();
  const priceControls = getPriceControls();
  const q = qs('#searchInput').value.trim().toLowerCase();
  const filtered = products.filter(prod => {
    const status = !f.status.length || f.status.includes(prod.status);
    const trust = !f.trust.length || f.trust.includes(prod.trustLevel);
    const stability = !f.stability.length || f.stability.includes(prod.stability);
    const platform = !f.platform.length || (prod.platform || []).some(p => f.platform.includes(p));
    const keySystem = !f.keySystem.length || f.keySystem.includes(prod.keySystem);
    const tags = !f.tags.length || (prod.tags || []).some(tag => f.tags.includes(tag));
    const execution = !f.execution.length || f.execution.includes(Number.isFinite(prod.sunc) ? (prod.sunc >= 95 ? 'High' : prod.sunc >= 80 ? 'Medium' : 'Low') : 'Unknown');
    const price = isPriceMatch(prod, priceControls);
    const search = !q || [prod.name, prod.description, ...(prod.features || [])].join(' ').toLowerCase().includes(q);
    return status && trust && stability && platform && keySystem && tags && execution && price && search;
  });
  renderProducts(filtered);
}
