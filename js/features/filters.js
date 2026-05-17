(function () {
  window.XyrexModules = window.XyrexModules || {};
  window.XyrexModules.createFiltersModule = function createFiltersModule(deps) {
    const { qs, qsa, products, renderProducts } = deps;
    function getActiveFilters() { const checked = qsa('.filter-checkbox:checked'); const out = { platform: [], tags: [], cheatType: [], keySystem: [] }; checked.forEach(cb => out[cb.dataset.filterGroup].push(cb.value)); return out; }
    function getPriceControls() { return { free: qs('#priceFree').checked, paid: qs('#pricePaid').checked, both: qs('#priceBoth').checked }; }
    function isPriceMatch(prod, priceControls) { const anyChecked = priceControls.free || priceControls.paid || priceControls.both; if (!anyChecked) return true; if (priceControls.both) return prod.freeOrPaid === 'both'; const freeMatch = priceControls.free && (prod.freeOrPaid === 'free' || prod.freeOrPaid === 'both'); const paidMatch = priceControls.paid && (prod.freeOrPaid === 'paid' || prod.freeOrPaid === 'both'); return freeMatch || paidMatch; }
    function applyAllFilters() {
      const search = qs('#searchInput').value.trim().toLowerCase(); const f = getActiveFilters(); const priceControls = getPriceControls();
      const filtered = products.filter(p => { const nameMatch = p.name.toLowerCase().includes(search); const platformMatch = f.platform.length ? f.platform.some(x => p.platform.includes(x)) : true; const tagsMatch = f.tags.length ? f.tags.every(x => (p.features || []).concat(p.tags || []).includes(x)) : true; const cheatTypeMatch = f.cheatType.length ? f.cheatType.includes(p.cheatType) : true; const keySystemMatch = f.keySystem.length ? f.keySystem.includes(p.keySystem) : true; const priceMatch = isPriceMatch(p, priceControls); return nameMatch && platformMatch && tagsMatch && cheatTypeMatch && keySystemMatch && priceMatch; });
      renderProducts(filtered);
    }
    function initCollapsibleFilters() {
      const layout = qs('.page-layout'); const toggleBtn = qs('#filtersToggleBtn'); const filtersContent = qs('#filtersContent'); if (!layout || !toggleBtn || !filtersContent) return;
      const setFiltersCollapsed = collapsed => { layout.classList.toggle('filters-collapsed', collapsed); toggleBtn.setAttribute('aria-expanded', String(!collapsed)); const label = collapsed ? 'Expand filters' : 'Collapse filters'; toggleBtn.setAttribute('title', label); toggleBtn.setAttribute('aria-label', label); };
      setFiltersCollapsed(false); toggleBtn.addEventListener('click', () => { const collapsed = !layout.classList.contains('filters-collapsed'); setFiltersCollapsed(collapsed); });
    }
    return { getActiveFilters, getPriceControls, isPriceMatch, applyAllFilters, initCollapsibleFilters };
  };
})();
