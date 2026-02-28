const products = [
  {
    name: 'Pluton',
    featured: false,
    platform: ['Windows', 'Android', 'iOS', 'macOS'],
    cheatType: 'Internal',
    keySystem: 'Keyless',
    tags: ['Trending', 'Internal'],
    features: [],
    sunc: 100,
    description: 'Pluton Executor is a next-gen Roblox executor built for raw performance and stealth, featuring a custom Lua VM, instant injection, and adaptive hot-patching to stay resilient against modern anti-cheat updates.',
    pros: ['High sUNC', 'AntiCheat Bypass', 'Instant Injection', 'High stability'],
    cons: ['Can conflict with antivirus software', 'Setup complexity is higher than average'],
    pricingOptions: ['Free plan available', '1 Week — $4.99', '1 Month — $13.99'],
    freeOrPaid: 'both',
    stability: 'Stable',
    trustLevel: 'High',
    status: 'Undetected'
  },
  {
    name: 'SkibX',
    featured: false,
    platform: ['iOS', 'Android'],
    cheatType: 'Internal',
    keySystem: 'Keyless',
    tags: ['Internal'],
    features: ['Decompiler'],
    sunc: 96,
    description: 'Internal executor with keyless access, iOS support, and high sUNC.',
    pros: ['Keyless', 'iOS support', 'High sUNC'],
    cons: ['None listed'],
    pricingOptions: ['Free'],
    freeOrPaid: 'free',
    stability: 'Unknown',
    trustLevel: 'Unknown',
    status: 'Unknown'
  },
  {
    name: 'Potassium',
    featured: true,
    platform: ['Windows'],
    cheatType: 'Internal',
    keySystem: 'Keyless',
    tags: ['Verified', 'Internal'],
    features: ['Decompiler', 'Kernel', 'Multi-instance'],
    sunc: 98,
    description: 'Internal executor with full sUNC support and advanced feature coverage.',
    pros: ['sUNC 100%'],
    cons: ['Unknown developers', 'Frequent ban waves', 'Stability issues'],
    pricingOptions: ['$22.99 lifetime'],
    freeOrPaid: 'paid',
    stability: 'Unstable',
    trustLevel: 'Low',
    status: 'Detected risk'
  },
  {
    name: 'JJSploit',
    featured: false,
    platform: ['Windows', 'Android'],
    cheatType: 'Internal',
    keySystem: 'Keyless',
    tags: ['Internal'],
    features: ['Decompiler'],
    sunc: 40,
    description: 'Simple internal executor with script buttons and broad accessibility.',
    pros: ['Simple interface with script buttons'],
    cons: ['Very simplified'],
    pricingOptions: ['Free'],
    freeOrPaid: 'free',
    stability: 'Basic',
    trustLevel: 'Medium',
    status: 'Undetected'
  },
  {
    name: 'Velocity',
    featured: true,
    platform: ['Windows'],
    cheatType: 'Internal',
    keySystem: 'Keyless',
    tags: ['Verified', 'Internal'],
    features: ['Decompiler', 'Multi-instance'],
    sunc: 94,
    description: 'Keyless internal executor with extensive customization options.',
    pros: ['Keyless', 'Lots of customizations'],
    cons: ['Stability issues'],
    pricingOptions: ['Free'],
    freeOrPaid: 'free',
    stability: 'Mixed',
    trustLevel: 'Medium',
    status: 'Undetected'
  },
  {
    name: 'Xeno',
    featured: false,
    platform: ['Windows'],
    cheatType: 'Internal',
    keySystem: 'Keyless',
    tags: ['Internal'],
    features: ['Decompiler', 'Multi-instance'],
    sunc: 33,
    description: 'Stable internal executor with script saves and multi-instance support.',
    pros: ['Stable', 'Script saves'],
    cons: ['Low sUNC', 'Level 3 execution'],
    pricingOptions: ['Free'],
    freeOrPaid: 'free',
    stability: 'Stable',
    trustLevel: 'Medium',
    status: 'Undetected'
  },
  {
    name: 'Solara',
    featured: false,
    platform: ['Windows'],
    cheatType: 'Internal',
    keySystem: 'Keyless',
    tags: ['Internal'],
    features: ['Decompiler', 'Multi-instance'],
    sunc: 38,
    description: 'Free internal executor known for solid performance.',
    pros: ['Solid performance', 'Free'],
    cons: ['Very low sUNC'],
    pricingOptions: ['Free'],
    freeOrPaid: 'free',
    stability: 'Stable',
    trustLevel: 'Medium',
    status: 'Undetected'
  },
  {
    name: 'Vega X',
    featured: false,
    platform: ['Android'],
    cheatType: 'Internal',
    keySystem: 'Keyed',
    tags: ['Internal'],
    features: [],
    sunc: null,
    description: 'Android internal executor with short key duration options.',
    pros: ['2-day keys'],
    cons: ['Fails sUNC'],
    pricingOptions: ['Free', 'From $4.99 for 30 days'],
    freeOrPaid: 'both',
    stability: 'Unknown',
    trustLevel: 'Unknown',
    status: 'Unknown'
  },
  {
    name: 'Macsploit',
    featured: false,
    platform: ['macOS'],
    cheatType: 'Internal',
    keySystem: 'Keyless',
    tags: ['Internal'],
    features: ['Decompiler', 'Multi-instance'],
    sunc: 100,
    description: 'macOS internal executor with decompiler and multi-instance support.',
    pros: ['Multi-instance', 'Decompiler', 'Source leak'],
    cons: ['None listed'],
    pricingOptions: ['From $4.99 for 30 days'],
    freeOrPaid: 'paid',
    stability: 'Stable',
    trustLevel: 'Medium',
    status: 'Undetected'
  },
  {
    name: 'Seliware',
    featured: true,
    platform: ['Windows'],
    cheatType: 'Internal',
    keySystem: 'Keyless',
    tags: ['Verified', 'Internal'],
    features: ['Decompiler', 'Multi-instance'],
    sunc: 98,
    description: 'Windows internal executor focused on smooth injection and execution.',
    pros: ['Smooth injection and execution'],
    cons: ['Frequent detection issues'],
    pricingOptions: ['From $3.99 for 7 days'],
    freeOrPaid: 'paid',
    stability: 'Mixed',
    trustLevel: 'Medium',
    status: 'Detection issues'
  },
  {
    name: 'Serotonin',
    featured: false,
    platform: ['Windows'],
    cheatType: 'External',
    keySystem: 'Keyless',
    tags: ['External'],
    features: ['Kernel'],
    sunc: null,
    description: 'External executor with kernel capabilities and many features.',
    pros: ['Kernel', 'Feature-rich'],
    cons: ['None listed'],
    pricingOptions: ['From $8.47 for 30 days'],
    freeOrPaid: 'paid',
    stability: 'Unknown',
    trustLevel: 'Unknown',
    status: 'Unknown'
  },
  {
    name: 'Severe',
    featured: false,
    platform: ['Windows'],
    cheatType: 'External',
    keySystem: 'Keyed',
    tags: ['External'],
    features: ['Decompiler'],
    sunc: null,
    description: 'External tool with decompiler and code explorer functionality.',
    pros: ['Decompiler', 'Code explorer'],
    cons: ['Password reset costs extra'],
    pricingOptions: ['$20 lifetime'],
    freeOrPaid: 'paid',
    stability: 'Unknown',
    trustLevel: 'Unknown',
    status: 'Unknown'
  },
  {
    name: 'Arceus X',
    featured: false,
    platform: ['iOS', 'Android'],
    cheatType: 'Internal',
    keySystem: 'Keyed',
    tags: ['Internal'],
    features: ['Supports VNG'],
    sunc: null,
    description: 'Internal mobile executor with VNG support.',
    pros: ['Supports VNG'],
    cons: ['Fails sUNC'],
    pricingOptions: ['From $7.47 for 30 days'],
    freeOrPaid: 'paid',
    stability: 'Unknown',
    trustLevel: 'Unknown',
    status: 'Unknown'
  },
  {
    name: 'Bunni',
    featured: false,
    platform: ['Windows'],
    cheatType: 'Internal',
    keySystem: 'Keyed',
    tags: ['Internal'],
    features: ['Decompiler'],
    sunc: 100,
    description: 'Internal Windows executor with decompiler and high sUNC.',
    pros: ['Decompiler', 'High sUNC'],
    cons: ['Lag/slowness reports'],
    pricingOptions: ['Free', 'Paid from $1.99'],
    freeOrPaid: 'both',
    stability: 'Mixed',
    trustLevel: 'Medium',
    status: 'Undetected'
  },
  {
    name: 'Delta',
    featured: false,
    platform: ['iOS', 'Android'],
    cheatType: 'Internal',
    keySystem: 'Keyed',
    tags: ['Internal'],
    features: ['Decompiler'],
    sunc: 97,
    description: 'Mobile internal executor with decompiler and high sUNC.',
    pros: ['Decompiler', 'High sUNC'],
    cons: ['Keyed'],
    pricingOptions: ['Free', 'From $8 for 30 days'],
    freeOrPaid: 'both',
    stability: 'Stable',
    trustLevel: 'Medium',
    status: 'Undetected'
  },
  {
    name: 'Hydrogen',
    featured: false,
    platform: ['macOS'],
    cheatType: 'Internal',
    keySystem: 'Keyless',
    tags: ['Internal'],
    features: ['Decompiler'],
    sunc: 96,
    description: 'Fast and customizable internal macOS executor with Luarmor support.',
    pros: ['Fast', 'Customizable', 'Luarmor support'],
    cons: ['None listed'],
    pricingOptions: ['Free', 'Paid from $4'],
    freeOrPaid: 'both',
    stability: 'Stable',
    trustLevel: 'Medium',
    status: 'Undetected'
  },
  {
    name: 'Matcha',
    featured: false,
    platform: ['Windows'],
    cheatType: 'External',
    keySystem: 'Keyless',
    tags: ['External'],
    features: ['Kernel', 'Decompiler'],
    sunc: null,
    description: 'Feature-rich external executor with kernel and decompiler support.',
    pros: ['Lots of features'],
    cons: ['Registration process very complex'],
    pricingOptions: ['$9.99 lifetime'],
    freeOrPaid: 'paid',
    stability: 'Unknown',
    trustLevel: 'Unknown',
    status: 'Unknown'
  },
  {
    name: 'Volt',
    featured: false,
    platform: ['Windows'],
    cheatType: 'Internal',
    keySystem: 'Keyless',
    tags: ['Internal'],
    features: ['Multi-instance'],
    sunc: 98,
    description: 'Internal Windows executor with Hyperion emulation and easy UI.',
    pros: ['Hyperion emulation', 'Easy UI'],
    cons: ['Exit scams'],
    pricingOptions: ['From $5.99 for 7 days'],
    freeOrPaid: 'paid',
    stability: 'Unknown',
    trustLevel: 'Low',
    status: 'Unknown'
  },
  {
    name: 'Aimmy',
    featured: false,
    platform: ['Windows'],
    cheatType: 'External',
    keySystem: 'Keyless',
    tags: ['External'],
    features: ['AI'],
    sunc: null,
    description: 'AI-based external tool with no key system.',
    pros: ['AI-based', 'No key system'],
    cons: ['Requires powerful hardware'],
    pricingOptions: ['Free'],
    freeOrPaid: 'free',
    stability: 'Unknown',
    trustLevel: 'Unknown',
    status: 'Unknown'
  },
  {
    name: 'Volcano',
    featured: false,
    platform: ['Windows'],
    cheatType: 'Internal',
    keySystem: 'Keyless',
    tags: ['Internal'],
    features: ['Decompiler', 'Multi-instance'],
    sunc: 98,
    description: 'Internal Windows executor known for long history and safety.',
    pros: ['Safe', 'Long history'],
    cons: ['Expensive'],
    pricingOptions: ['Paid'],
    freeOrPaid: 'paid',
    stability: 'Stable',
    trustLevel: 'High',
    status: 'Undetected'
  }
];

const scriptsHubData = {
  tierListPaid: [{ tier: 'S', executor: 'Pluton', notes: 'Best overall reliability and performance.' }],
  tierListFree: [{ tier: 'S', executor: 'Pluton', notes: 'Best current free option.' }],
  popularScripts: [
    {
      name: 'Universal Auto-Farm',
      game: 'Multi-game',
      description: 'General-purpose automation loop with teleport and anti-AFK toggles.',
      script: 'loadstring(game:HttpGet("https://example.com/universal-autofarm.lua"))()'
    }
  ],
  recentChanges: [
    'Updated all requested platform and status icons to new Font Awesome v7.2.0 SVGs.',
    'Added Free + Paid pricing filter and support for executors with both plans.',
    'Added XYREX easter egg route to a hidden themed Coming Soon page.',
    'Major mobile layout/safe-area and overscroll polish for cleaner full-screen rendering.',
    'Restored saved-script Delete action and added title+content validation.'
  ]
};

const qs = sel => document.querySelector(sel);
const qsa = sel => Array.from(document.querySelectorAll(sel));

const svgIcons = {
  iOS: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M447.1 332.7C446.9 296 463.5 268.3 497.1 247.9C478.3 221 449.9 206.2 412.4 203.3C376.9 200.5 338.1 224 323.9 224C308.9 224 274.5 204.3 247.5 204.3C191.7 205.2 132.4 248.8 132.4 337.5C132.4 363.7 137.2 390.8 146.8 418.7C159.6 455.4 205.8 545.4 254 543.9C279.2 543.3 297 526 329.8 526C361.6 526 378.1 543.9 406.2 543.9C454.8 543.2 496.6 461.4 508.8 424.6C443.6 393.9 447.1 334.6 447.1 332.7zM390.5 168.5C417.8 136.1 415.3 106.6 414.5 96C390.4 97.4 362.5 112.4 346.6 130.9C329.1 150.7 318.8 175.2 321 202.8C347.1 204.8 370.9 191.4 390.5 168.5z"/></svg>',
  Windows: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M96 96L310.6 96L310.6 310.6L96 310.6L96 96zM329.4 96L544 96L544 310.6L329.4 310.6L329.4 96zM96 329.4L310.6 329.4L310.6 544L96 544L96 329.4zM329.4 329.4L544 329.4L544 544L329.4 544L329.4 329.4z"/></svg>',
  Android: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M452.5 317.9C465.8 317.9 476.5 328.6 476.5 341.9C476.5 355.2 465.8 365.9 452.5 365.9C439.2 365.9 428.5 355.2 428.5 341.9C428.5 328.6 439.2 317.9 452.5 317.9zM187.4 317.9C200.7 317.9 211.4 328.6 211.4 341.9C211.4 355.2 200.7 365.9 187.4 365.9C174.1 365.9 163.4 355.2 163.4 341.9C163.4 328.6 174.1 317.9 187.4 317.9zM461.1 221.4L509 138.4C509.8 137.3 510.3 136 510.5 134.6C510.7 133.2 510.7 131.9 510.4 130.5C510.1 129.1 509.5 127.9 508.7 126.8C507.9 125.7 506.9 124.8 505.7 124.1C504.5 123.4 503.2 123 501.8 122.8C500.4 122.6 499.1 122.8 497.8 123.2C496.5 123.6 495.3 124.3 494.2 125.1C493.1 125.9 492.3 127.1 491.7 128.3L443.2 212.4C404.4 195 362.4 186 319.9 186C277.4 186 235.4 195 196.6 212.4L148.2 128.4C147.6 127.2 146.7 126.1 145.7 125.2C144.7 124.3 143.4 123.7 142.1 123.3C140.8 122.9 139.4 122.8 138.1 122.9C136.8 123 135.4 123.5 134.2 124.2C133 124.9 132 125.8 131.2 126.9C130.4 128 129.8 129.3 129.5 130.6C129.2 131.9 129.2 133.3 129.4 134.7C129.6 136.1 130.2 137.3 130.9 138.5L178.8 221.5C96.5 266.2 40.2 349.5 32 448L608 448C599.8 349.5 543.5 266.2 461.1 221.4z"/></svg>',
  macOS: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M128 96C92.7 96 64 124.7 64 160L64 400L128 400L128 160L512 160L512 400L576 400L576 160C576 124.7 547.3 96 512 96L128 96zM19.2 448C8.6 448 0 456.6 0 467.2C0 509.6 34.4 544 76.8 544L563.2 544C605.6 544 640 509.6 640 467.2C640 456.6 631.4 448 620.8 448L19.2 448z"/></svg>',
  warning: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M320 64C334.7 64 348.2 72.1 355.2 85L571.2 485C577.9 497.4 577.6 512.4 570.4 524.5C563.2 536.6 550.1 544 536 544L104 544C89.9 544 76.8 536.6 69.6 524.5C62.4 512.4 62.1 497.4 68.8 485L284.8 85C291.8 72.1 305.3 64 320 64zM320 416C302.3 416 288 430.3 288 448C288 465.7 302.3 480 320 480C337.7 480 352 465.7 352 448C352 430.3 337.7 416 320 416zM320 224C301.8 224 287.3 239.5 288.6 257.7L296 361.7C296.9 374.2 307.4 384 319.9 384C332.5 384 342.9 374.3 343.8 361.7L351.2 257.7C352.5 239.5 338.1 224 319.8 224z"/></svg>',
  trending: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M416 224C398.3 224 384 209.7 384 192C384 174.3 398.3 160 416 160L576 160C593.7 160 608 174.3 608 192L608 352C608 369.7 593.7 384 576 384C558.3 384 544 369.7 544 352L544 269.3L374.6 438.7C362.1 451.2 341.8 451.2 329.3 438.7L224 333.3L86.6 470.6C74.1 483.1 53.8 483.1 41.3 470.6C28.8 458.1 28.8 437.8 41.3 425.3L201.3 265.3C213.8 252.8 234.1 252.8 246.6 265.3L352 370.7L498.7 224L416 224z"/></svg>'
};

const tagSymbolMap = {
  Verified: { symbol: '✓', cls: 'verified' },
  Warning: { symbol: svgIcons.warning, cls: 'warning', isSvg: true },
  Trending: { symbol: svgIcons.trending, cls: 'trending', isSvg: true },
  Internal: { symbol: 'I', cls: 'internal' },
  External: { symbol: 'E', cls: 'external' }
};

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}

function createTagSymbols(product) {
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

function getPlatformLogo(platform) {
  return svgIcons[platform] ? `<span class="icon-svg">${svgIcons[platform]}</span>` : '•';
}

function createPlatformChips(platforms) {
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

function getPriceLabel(product) {
  if (product.freeOrPaid === 'both') return 'Free + Paid';
  return product.freeOrPaid === 'free' ? 'Free' : 'Paid';
}

function createProductCard(product, index) {
  const card = document.createElement('article');
  card.className = 'card';
  if (product.featured) card.classList.add('featured-card');
  card.setAttribute('data-index', index);

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
  summary.textContent = product.description;

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

function renderProducts(list) {
  const grid = qs('#productGrid');
  grid.innerHTML = '';
  if (!list.length) {
    qs('#noResults').hidden = false;
    return;
  }

  const sorted = [...list].sort((a, b) => {
    if (a.featured === b.featured) return a.name.localeCompare(b.name);
    return a.featured ? -1 : 1;
  });

  qs('#noResults').hidden = true;
  sorted.forEach((p, i) => grid.appendChild(createProductCard(p, i)));
}

function getActiveFilters() {
  const active = {};
  qsa('.filter-checkbox').forEach(input => {
    if (!input.checked) return;
    const group = input.getAttribute('data-filter-group');
    if (!active[group]) active[group] = [];
    active[group].push(input.value);
  });
  return active;
}

function getPriceControls() {
  return { free: qs('#priceFree').checked, paid: qs('#pricePaid').checked, both: qs('#priceBoth').checked };
}

function isPriceMatch(prod, priceControls) {
  if (!priceControls.free && !priceControls.paid && !priceControls.both) return true;
  if ((priceControls.free && priceControls.paid) || priceControls.both) return prod.freeOrPaid === 'both';
  if (priceControls.free) return prod.freeOrPaid === 'free' || prod.freeOrPaid === 'both';
  if (priceControls.paid) return prod.freeOrPaid === 'paid' || prod.freeOrPaid === 'both';
  return false;
}

function applyAllFilters() {
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

function openModal(product) {
  const overlay = qs('#modalOverlay');
  const content = qs('#modalContent');
  overlay.setAttribute('aria-hidden', 'false');

  content.innerHTML = `
    <h2>${escapeHtml(product.name)}</h2>
    <div class="modal-layout">
      <div>
        <div class="modal-section"><strong>Description</strong><p>${escapeHtml(product.description)}</p></div>
        <div class="modal-section"><strong>Pros</strong><ul>${product.pros.map(f => `<li>${escapeHtml(f)}</li>`).join('')}</ul></div>
        <div class="modal-section"><strong>Cons</strong><ul>${product.cons.map(i => `<li>${escapeHtml(i)}</li>`).join('')}</ul></div>
        <div class="modal-section"><strong>Pricing</strong><ul>${product.pricingOptions.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul></div>
      </div>
      <aside class="status-panel">
        <h3>Status</h3>
        <div class="status-item"><span>Stability</span><strong>${escapeHtml(product.stability)}</strong></div>
        <div class="status-item"><span>Trust Level</span><strong>${escapeHtml(product.trustLevel)}</strong></div>
        <div class="status-item"><span>Current State</span><strong>${escapeHtml(product.status)}</strong></div>
      </aside>
    </div>`;

  qs('#modalCloseBtn').focus();
}

function closeModal() {
  qs('#modalOverlay').setAttribute('aria-hidden', 'true');
  qs('#modalContent').innerHTML = '';
}

function renderTierList(containerId, entries) {
  const wrap = qs(`#${containerId}`);
  if (!wrap) return;
  wrap.innerHTML = entries.map(entry => `
    <article class="rank-item rank-tier-${escapeHtml(String(entry.tier || '').toLowerCase())}">
      <div class="rank-badge">${escapeHtml(entry.tier)}</div>
      <div><h4>${escapeHtml(entry.executor)}</h4><p>${escapeHtml(entry.notes)}</p></div>
    </article>`).join('');
}

function renderPopularScripts() {
  const wrap = qs('#popularScriptsList');
  if (!wrap) return;
  wrap.innerHTML = scriptsHubData.popularScripts.map(item => `
    <article class="script-card"><div class="script-card-head"><h4>${escapeHtml(item.name)}</h4><span>${escapeHtml(item.game)}</span></div><p>${escapeHtml(item.description)}</p><pre>${escapeHtml(item.script)}</pre></article>`).join('');
}

function renderRecentChanges() {
  const wrap = qs('#recentChangesList');
  if (!wrap) return;
  wrap.innerHTML = scriptsHubData.recentChanges.map(entry => `<li>${escapeHtml(entry)}</li>`).join('');
}

const savedScriptsStorageKey = 'voxlis_saved_scripts';
let currentSavedScriptId = null;

function getSavedScripts() {
  try {
    const parsed = JSON.parse(localStorage.getItem(savedScriptsStorageKey) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeSavedScripts(items) {
  localStorage.setItem(savedScriptsStorageKey, JSON.stringify(items));
}

function renderSavedScriptsList() {
  const wrap = qs('#savedScriptsList');
  if (!wrap) return;

  const items = getSavedScripts();
  if (!items.length) {
    wrap.innerHTML = '<p class="saved-empty">No saved scripts yet.</p>';
    return;
  }

  wrap.innerHTML = items.map(item => `
    <button class="saved-script-item ${item.id === currentSavedScriptId ? 'is-active' : ''}" data-saved-script-id="${escapeHtml(item.id)}" type="button">
      <strong>${escapeHtml(item.title)}</strong>
      <span>${new Date(item.updatedAt).toLocaleString()}</span>
    </button>`).join('');
}

function clearSavedScriptEditor() {
  const nameInput = qs('#savedScriptName');
  const bodyInput = qs('#savedScriptBody');
  if (!nameInput || !bodyInput) return;
  nameInput.value = '';
  bodyInput.value = '';
  qs('#savedScriptError').hidden = true;
}

function setEditorFromSavedScript(item) {
  const nameInput = qs('#savedScriptName');
  const bodyInput = qs('#savedScriptBody');
  if (!nameInput || !bodyInput) return;
  nameInput.value = item?.title || '';
  bodyInput.value = item?.body || '';
}

function saveScriptFromEditor() {
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
    id: currentSavedScriptId || `script_${Date.now()}`,
    title: trimmedTitle,
    body: bodyInput.value,
    updatedAt: Date.now()
  };

  const withoutCurrent = items.filter(item => item.id !== currentSavedScriptId);
  writeSavedScripts([scriptToPersist, ...withoutCurrent]);
  currentSavedScriptId = null;
  clearSavedScriptEditor();
  renderSavedScriptsList();
  nameInput.focus();
}

function deleteSelectedScript() {
  if (!currentSavedScriptId) return;
  const items = getSavedScripts().filter(item => item.id !== currentSavedScriptId);
  writeSavedScripts(items);
  currentSavedScriptId = null;
  clearSavedScriptEditor();
  renderSavedScriptsList();
}

const PAGE_TRANSITION_MS = 200;
const SUBTAB_TRANSITION_MS = 160;
let activePageId = null;
let activeSubtabId = 'tierPaidPanel';

function setActivePage(targetPageId) {
  if (targetPageId === activePageId) return;

  const currentPage = qs(`#${activePageId}`);
  const nextPage = qs(`#${targetPageId}`);

  if (!nextPage) return;

  if (currentPage) {
    currentPage.classList.remove('is-entering');
    currentPage.classList.add('is-leaving');
    window.setTimeout(() => {
      currentPage.hidden = true;
      currentPage.classList.remove('is-active', 'is-leaving');
    }, PAGE_TRANSITION_MS);
  }

  nextPage.hidden = false;
  nextPage.classList.add('is-active', 'is-entering');
  window.requestAnimationFrame(() => {
    nextPage.classList.remove('is-entering');
  });

  activePageId = targetPageId;

  const onScriptsPage = targetPageId === 'scriptsPage';
  const onEasterPage = targetPageId === 'easterEggPage';
  qs('#sidebar').hidden = onScriptsPage || onEasterPage;
  qs('#searchInput').disabled = onScriptsPage;
  qs('#clearSearchBtn').disabled = onScriptsPage;
  qs('.page-layout').classList.toggle('scripts-mode', onScriptsPage || onEasterPage);
}

function setActiveSubtab(targetSubtabId) {
  if (targetSubtabId === activeSubtabId) return;

  const currentPanel = qs(`#${activeSubtabId}`);
  const nextPanel = qs(`#${targetSubtabId}`);

  if (!nextPanel) return;

  if (currentPanel) {
    currentPanel.classList.remove('is-entering');
    currentPanel.classList.add('is-leaving');
    window.setTimeout(() => {
      currentPanel.hidden = true;
      currentPanel.classList.remove('is-leaving');
    }, SUBTAB_TRANSITION_MS);
  }

  nextPanel.hidden = false;
  nextPanel.classList.add('is-entering');
  window.requestAnimationFrame(() => {
    nextPanel.classList.remove('is-entering');
  });

  activeSubtabId = targetSubtabId;
}

function injectLegendIcons() {
  qsa('.legend-icon[data-icon]').forEach(icon => {
    const key = icon.getAttribute('data-icon');
    if (!svgIcons[key]) return;
    icon.innerHTML = `<span class="icon-svg">${svgIcons[key]}</span>`;
  });
}

function initScriptsHub() {
  renderTierList('tierPaidList', scriptsHubData.tierListPaid);
  renderTierList('tierFreeList', scriptsHubData.tierListFree);
  renderPopularScripts();
  renderRecentChanges();
  renderSavedScriptsList();

  qsa('.subtab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-subtab-target');
      qsa('.subtab-btn').forEach(item => {
        const active = item === btn;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-selected', String(active));
      });
      setActiveSubtab(target);
    });
  });

  qsa('.page-switch-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-page-target');
      qsa('.page-switch-btn').forEach(item => item.classList.toggle('is-active', item === btn));
      setActivePage(target);
    });
  });

  qs('#savedScriptsList').addEventListener('click', event => {
    const trigger = event.target.closest('[data-saved-script-id]');
    if (!trigger) return;
    currentSavedScriptId = trigger.getAttribute('data-saved-script-id');
    const selected = getSavedScripts().find(item => item.id === currentSavedScriptId);
    setEditorFromSavedScript(selected);
    renderSavedScriptsList();
  });

  qs('#saveScriptBtn').addEventListener('click', saveScriptFromEditor);
  qs('#deleteScriptBtn').addEventListener('click', deleteSelectedScript);
}

function init() {
  renderProducts(products);
  initScriptsHub();
  injectLegendIcons();

  qs('#searchInput').addEventListener('input', applyAllFilters);
  qs('#searchInput').addEventListener('keydown', e => {
    if (e.key === 'Enter' && qs('#searchInput').value.trim() === 'XYREX') {
      qsa('.page-switch-btn').forEach(item => item.classList.remove('is-active'));
      setActivePage('easterEggPage');
    }
  });

  qs('#clearSearchBtn').addEventListener('click', () => {
    qs('#searchInput').value = '';
    applyAllFilters();
  });

  qs('#brandHomeBtn').addEventListener('click', () => {
    qsa('.page-switch-btn').forEach(item => item.classList.toggle('is-active', item.getAttribute('data-page-target') === 'executorsPage'));
    setActivePage('executorsPage');
  });

  qsa('.filter-checkbox').forEach(cb => cb.addEventListener('change', applyAllFilters));
  qsa('.price-checkbox').forEach(cb => cb.addEventListener('change', applyAllFilters));

  qs('#resetFilters').addEventListener('click', () => {
    qsa('.filter-checkbox, .price-checkbox').forEach(cb => (cb.checked = false));
    qs('#searchInput').value = '';
    applyAllFilters();
  });

  qs('#modalCloseBtn').addEventListener('click', closeModal);
  qs('#modalOverlay').addEventListener('click', e => {
    if (e.target === qs('#modalOverlay')) closeModal();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

  setActivePage('executorsPage');
}

document.addEventListener('DOMContentLoaded', init);
