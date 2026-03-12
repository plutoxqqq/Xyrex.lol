/* script.js
   Modular JS to render products, handle search, filters, price slider, and modal.
   Comments explain where/how to add products, filters, tags, icons, and modal fields.
*/

/* ================================
   PRODUCT DATA
   ================================
   To add a product:
    - Copy one object in the array and change fields.
    - priceValue: numeric price for filtering (null means Lifetime)
    - price: display string shown on card
    - features: array with feature keywords (these map to icons below)
    - tags: array for status tags (Internal, Warning, Trending, etc.)
*/
const products = [
  {
    name: "Aether Decompiler",
    platform: ["Windows","macOS"],
    cheatType: "Internal",
    keySystem: "Keyless",
    tags: ["Internal","Trending"],
    features: ["Decompiler","Multi-instance"],
    sunc: 97,
    summary: "Lightweight decompiler with fast analysis and multi-instance support.",
    details: "Aether Decompiler offers symbol recovery, smart heuristics, and plugin support. Designed for performance on modern CPUs.",
    issues: ["Minor UI lag on initial load", "Some heuristics false-positive in corner cases"],
    price: "$5.99 • 7 days",
    priceValue: 5.99,
    durationDays: 7
  },
  {
    name: "KernelForge",
    platform: ["Windows"],
    cheatType: "External",
    keySystem: "Keyed",
    tags: ["Kernel","Verified"],
    features: ["Kernel"],
    sunc: 88,
    summary: "Robust kernel-level hooking utilities for advanced tasks.",
    details: "KernelForge provides a secure kernel driver, with fallback and safety checks. Intended for advanced users.",
    issues: ["Requires driver signing workaround on some systems"],
    price: "$19.99 • 30 days",
    priceValue: 19.99,
    durationDays: 30
  },
  {
    name: "Nebula AI Runner",
    platform: ["Android","iOS"],
    cheatType: "External",
    keySystem: "Keyless",
    tags: ["AI","Supports VNG"],
    features: ["Multi-instance","Decompiler"],
    sunc: 92,
    summary: "AI-powered assistant for automated analysis and large-batch runs.",
    details: "Nebula uses advanced ML to detect patterns and accelerate workflows. Cloud-backed features available.",
    issues: ["Cloud sync occasionally slow in AU region"],
    price: "Lifetime",
    priceValue: null,
    durationDays: null
  },
  {
    name: "MiniCore",
    platform: ["Windows","Android"],
    cheatType: "Internal",
    keySystem: "Keyless",
    tags: ["Internal","Supports VNG"],
    features: ["Multi-instance"],
    sunc: 71,
    summary: "Compact executor focused on low-latency multi-instance runs.",
    details: "MiniCore is optimized for low footprint and quick spins of many instances.",
    issues: ["Some incompatibility with older GPUs"],
    price: "$3.99 • 3 days",
    priceValue: 3.99,
    durationDays: 3
  },
  {
    name: "Sigma Suite",
    platform: ["macOS"],
    cheatType: "External",
    keySystem: "Keyed",
    tags: ["Warning"],
    features: [],
    sunc: 60,
    summary: "A feature-rich suite — use caution; active maintenance required.",
    details: "Sigma Suite packs many tools but requires careful configuration and maintenance.",
    issues: ["Known to conflict with some antivirus", "Setup can be complex"],
    price: "$12.00 • 14 days",
    priceValue: 12.0,
    durationDays: 14
  }
];

/* ================================
   ICON MAPPING (feature keyword → SVG symbol id)
   To add icons, add more symbols in index.html <svg> and map them here.
   ================================ */
const featureIconMap = {
  "Decompiler": "#icon-decompiler",
  "Multi-instance": "#icon-multi",
  "Kernel": "#icon-kernel"
};

/* ================================
   UTILITY HELPERS
   ================================ */
const qs = sel => document.querySelector(sel);
const qsa = sel => Array.from(document.querySelectorAll(sel));

/* ================================
   RENDERING: product card markup
   ================================ */
function createProductCard(product, index) {
  // Create container
  const card = document.createElement('article');
  card.className = 'card';
  card.setAttribute('data-index', index);

  // Header: name + tags + sUNC
  const header = document.createElement('div');
  header.className = 'card-header';

  const name = document.createElement('div');
  name.className = 'product-name';
  name.textContent = product.name;

  const status = document.createElement('div');
  status.className = 'status-tags';
  // status tags
  product.tags.forEach(t => {
    const span = document.createElement('span');
    span.className = 'small-tag ' + (t.toLowerCase() === 'internal' ? 'internal' : (t.toLowerCase() === 'warning' ? 'warning' : (t.toLowerCase()==='trending'?'trending':'')));
    span.textContent = t;
    status.appendChild(span);
  });
  // sUNC
  const sunc = document.createElement('div');
  sunc.className = 'sunc';
  sunc.textContent = `sUNC ${product.sunc}%`;

  header.appendChild(name);
  header.appendChild(status);
  header.appendChild(sunc);

  // Features row
  const featuresRow = document.createElement('div');
  featuresRow.className = 'features-row';

  product.features.forEach(f => {
    const ic = document.createElementNS('http://www.w3.org/2000/svg','svg');
    ic.setAttribute('class','feature-icon');
    ic.setAttribute('viewBox','0 0 24 24');
    // use <use> to refer to inline symbol
    const use = document.createElementNS('http://www.w3.org/2000/svg','use');
    use.setAttributeNS('http://www.w3.org/1999/xlink','href', featureIconMap[f] || '#icon-info');
    ic.appendChild(use);
    ic.title = f;
    featuresRow.appendChild(ic);
  });

  // Add platform hint text
  const platformSmall = document.createElement('div');
  platformSmall.className = 'small';
  platformSmall.textContent = 'Platforms: ' + (product.platform.join(', ') || '—');

  // Summary
  const summary = document.createElement('p');
  summary.className = 'summary';
  summary.textContent = product.summary;

  // Footer: price + info button
  const footer = document.createElement('div');
  footer.className = 'card-footer';

  const price = document.createElement('div');
  price.className = 'price';
  price.textContent = product.price || '—';

  const infoBtn = document.createElement('button');
  infoBtn.className = 'info-btn';
  infoBtn.innerHTML = 'Info';
  infoBtn.addEventListener('click', () => openModal(product));

  footer.appendChild(price);
  footer.appendChild(infoBtn);

  // assemble
  card.appendChild(header);
  card.appendChild(featuresRow);
  card.appendChild(platformSmall);
  card.appendChild(summary);
  card.appendChild(footer);

  return card;
}

/* ================================
   RENDER LIST
   ================================ */
function renderProducts(list) {
  const grid = qs('#productGrid');
  grid.innerHTML = ''; // clear
  if (list.length === 0) {
    qs('#noResults').hidden = false;
    return;
  }
  qs('#noResults').hidden = true;

  list.forEach((p, i) => {
    grid.appendChild(createProductCard(p, i));
  });
}

/* ================================
   FILTER LOGIC
   - Reads all checked filter inputs and price controls and search input
   - Returns filtered array
   ================================ */
function getActiveFilters() {
  const filterInputs = qsa('.filter-checkbox');
  const active = {};
  filterInputs.forEach(input => {
    if (!input.checked) return;
    const group = input.getAttribute('data-filter-group');
    if (!active[group]) active[group] = [];
    active[group].push(input.value);
  });
  return active;
}

function parsePriceValue(prod) {
  // priceValue is explicitly provided in products — if null = Lifetime
  return prod.priceValue;
}

// price slider & dropdown values
function getPriceControls() {
  const max = parseFloat(qs('#priceRange').max);
  const val = parseFloat(qs('#priceRange').value);
  const dropdown = qs('#priceDropdown').value;
  const includeLifetime = qs('#includeLifetime').checked;
  return { max, val, dropdown, includeLifetime };
}

function applyAllFilters() {
  const active = getActiveFilters();
  const { val: maxPriceVal, dropdown, includeLifetime } = getPriceControls();
  const searchText = qs('#searchInput').value.trim().toLowerCase();

  let filtered = products.filter(prod => {
    // SEARCH NAME filter (case-insensitive)
    if (searchText) {
      if (!prod.name.toLowerCase().includes(searchText)) return false;
    }

    // PLATFORM filter (if any)
    if (active.platform && active.platform.length) {
      // keep product if any of its platforms match any selected
      if (!prod.platform.some(p => active.platform.includes(p))) return false;
    }

    // TAGS filter (tag must be present in product.tags)
    if (active.tags && active.tags.length) {
      const matches = active.tags.some(t => prod.tags.includes(t));
      if (!matches) return false;
    }

    // CHEAT TYPE
    if (active.cheatType && active.cheatType.length) {
      if (!active.cheatType.includes(prod.cheatType)) return false;
    }

    // KEY SYSTEM
    if (active.keySystem && active.keySystem.length) {
      if (!active.keySystem.includes(prod.keySystem)) return false;
    }

    // PRICE slider + dropdown logic
    const pv = parsePriceValue(prod); // number or null
    // handle dropdown quick filter
    if (dropdown && dropdown !== 'all') {
      if (dropdown === 'lt5' && !(pv !== null && pv < 5)) return false;
      if (dropdown === 'lt10' && !(pv !== null && pv < 10)) return false;
      if (dropdown === 'lt20' && !(pv !== null && pv < 20)) return false;
      if (dropdown === '20plus' && !(pv !== null && pv >= 20)) return false;
      if (dropdown === 'lifetime' && !(pv === null)) return false;
    }

    // slider check: show product if its priceValue <= maxPriceVal OR if lifetime is allowed
    if (pv === null) { // lifetime
      if (!includeLifetime) return false;
    } else {
      if (pv > maxPriceVal) return false;
    }

    // passed all filters
    return true;
  });

  renderProducts(filtered);
}

/* ================================
   MODAL: open / close
   ================================ */
function openModal(product) {
  const overlay = qs('#modalOverlay');
  const content = qs('#modalContent');
  overlay.setAttribute('aria-hidden', 'false');

  // Build modal inner HTML (clear comments show where to extend)
  content.innerHTML = `
    <h2>${escapeHtml(product.name)}</h2>
    <div class="modal-section">
      <strong>Summary</strong>
      <p>${escapeHtml(product.summary)}</p>
    </div>

    <div class="modal-section">
      <strong>Full description</strong>
      <p>${escapeHtml(product.details)}</p>
    </div>

    <div class="modal-section">
      <strong>Features</strong>
      <ul>
        ${product.features.map(f => `<li>${escapeHtml(f)}</li>`).join('')}
      </ul>
    </div>

    <div class="modal-section">
      <strong>Issues</strong>
      <ul>
        ${product.issues.map(i => `<li>${escapeHtml(i)}</li>`).join('')}
      </ul>
    </div>

    <div class="modal-section">
      <strong>Pricing</strong>
      <p>${escapeHtml(product.price)}</p>
      <!-- To add a pricing breakdown, include new fields in the product object like product.pricing.breakdown -->
    </div>

    <div class="modal-section">
      <strong>Metadata</strong>
      <p class="small">Platforms: ${product.platform.join(', ') || '—'} • Cheat: ${product.cheatType} • Key system: ${product.keySystem} • sUNC ${product.sunc}%</p>
    </div>
  `;

  // Focus management: place focus on close button
  qs('#modalCloseBtn').focus();
}

function closeModal() {
  const overlay = qs('#modalOverlay');
  overlay.setAttribute('aria-hidden', 'true');
  qs('#modalContent').innerHTML = '';
}

/* simple HTML escape to prevent injection if product data is untrusted */
function escapeHtml(str){
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, function(m){
    return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m];
  });
}

/* ================================
   INITIAL SETUP & EVENTS
   ================================ */
function init() {
  // compute price range based on data
  const numericPrices = products.map(p => p.priceValue).filter(v => v !== null && !isNaN(v));
  const maxPrice = numericPrices.length ? Math.ceil(Math.max(...numericPrices)) : 100;
  qs('#priceRange').max = Math.max(maxPrice, 20); // ensure comfortable max
  qs('#priceRange').value = qs('#priceRange').max; // default show all
  qs('#priceMaxLabel').textContent = `$${qs('#priceRange').value}`;

  // initial render
  renderProducts(products);

  // Event listeners: search input
  qs('#searchInput').addEventListener('input', () => {
    applyAllFilters();
  });
  qs('#clearSearchBtn').addEventListener('click', () => {
    qs('#searchInput').value = '';
    applyAllFilters();
  });

  // filter checkboxes
  qsa('.filter-checkbox').forEach(cb => cb.addEventListener('change', applyAllFilters));

  // price slider
  qs('#priceRange').addEventListener('input', (e) => {
    qs('#priceMaxLabel').textContent = `$${e.target.value}`;
    applyAllFilters();
  });

  // dropdown quick prices
  qs('#priceDropdown').addEventListener('change', () => {
    // if dropdown selects 'lifetime', we can optionally set includeLifetime
    if (qs('#priceDropdown').value === 'lifetime') {
      qs('#includeLifetime').checked = true;
    }
    applyAllFilters();
  });

  // includeLifetime checkbox
  qs('#includeLifetime').addEventListener('change', applyAllFilters);

  // reset button
  qs('#resetFilters').addEventListener('click', () => {
    qsa('.filter-checkbox').forEach(cb => cb.checked = false);
    qs('#priceRange').value = qs('#priceRange').max;
    qs('#priceDropdown').value = 'all';
    qs('#includeLifetime').checked = false;
    qs('#searchInput').value = '';
    applyAllFilters();
  });

  // modal close & overlay
  qs('#modalCloseBtn').addEventListener('click', closeModal);
  qs('#modalOverlay').addEventListener('click', (e) => {
    if (e.target === qs('#modalOverlay')) closeModal();
  });
  // Esc to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // Make product cards clickable via keyboard (delegated)
  qs('#productGrid').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.matches('.info-btn')) {
      e.target.click();
    }
  });

  // Accessibility: prevent focus traps when modal closed
}

/* ================================
  Run init on DOM ready
  ================================ */
document.addEventListener('DOMContentLoaded', init);

/* ================================
   NOTES / HOW TO EXTEND
   ================================
  - To add a product: append an object to the `products` array above, include "priceValue" numeric or null.
  - To add a new filter group: create inputs in the HTML with data-filter-group="<groupName>" and update getActiveFilters() if needed.
  - To add more feature icons: add a <symbol> in index.html SVG block and map its id in featureIconMap.
  - To change search behavior to include tags or features: update applyAllFilters() where searchText is checked.
  - To modify modal content: edit openModal() — keep escaping for safety.
  - To add sorting: create a sort control (select) and apply a sort before renderProducts().
*/
