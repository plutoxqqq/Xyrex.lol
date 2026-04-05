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
    description: 'Pluton Executor is a next-gen Roblox executor built for raw performance and stealth, featuring a custom Lua VM, instant injection, and adaptive hot-patching to stay resilient against modern anti-cheat updates',
    pros: ['High sUNC', 'AntiCheat Bypass', 'Instant Injection', 'High stability'],
    cons: ['Can conflict with antivirus software', 'Setup complexity is higher than average'],
    pricingOptions: ['Free plan available', '1 Week — $4.99', '1 Month — $13.99'],
    freeOrPaid: 'both',
    stability: 'Stable',
    trustLevel: 'High',
    status: 'Undetected',
    officialSite: 'https://github.com/plutoxqq/Pluton-Executor'
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
    description: 'Solid lifetime Windows executor with reliable execution performance',
    pros: ['Lifetime access', 'Solid execution'],
    cons: ['Higher upfront cost'],
    pricingOptions: ['$22.99 lifetime'],
    freeOrPaid: 'paid',
    stability: 'Unstable',
    trustLevel: 'Low',
    status: 'Detected risk',
    officialSite: 'https://www.potassium.pro/'
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
    description: 'Simple internal executor with script buttons and broad accessibility',
    pros: ['Simple interface with script buttons'],
    cons: ['Very simplified'],
    pricingOptions: ['Free'],
    freeOrPaid: 'free',
    stability: 'Basic',
    trustLevel: 'Medium',
    status: 'Undetected',
    officialSite: 'https://wearedevs.net/d/JJSploit'
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
    description: 'Fast Windows executor focused on free performance',
    pros: ['Fast execution'],
    cons: ['Stability issues'],
    pricingOptions: ['Free'],
    freeOrPaid: 'free',
    stability: 'Mixed',
    trustLevel: 'Medium',
    status: 'Undetected',
    officialSite: 'https://work.ink/1Yct/velocitydownload'
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
    description: 'Beginner-friendly Windows executor with a clean user interface',
    pros: ['Clean UI'],
    cons: ['Limited power'],
    pricingOptions: ['Free'],
    freeOrPaid: 'free',
    stability: 'Stable',
    trustLevel: 'Medium',
    status: 'Undetected',
    officialSite: 'https://xeno.now/'
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
    description: 'Popular free Windows executor with a simple user interface',
    pros: ['Decent execution', 'Simple UI'],
    cons: ['Detection risk', 'Inconsistent updates'],
    pricingOptions: ['Free'],
    freeOrPaid: 'free',
    stability: 'Stable',
    trustLevel: 'Medium',
    status: 'Undetected',
    officialSite: 'https://getsolara.gg/'
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
    description: 'Android mobile executor with a free tier and scalable paid options',
    pros: ['Free tier', 'Scalable pricing'],
    cons: ['Ads and usage limitations'],
    pricingOptions: ['Free', 'Up to $25'],
    freeOrPaid: 'both',
    stability: 'Unknown',
    trustLevel: 'Unknown',
    status: 'Unknown',
    officialSite: 'https://vegax.gg/'
  },
  {
    name: 'MacSploit',
    featured: false,
    platform: ['macOS'],
    cheatType: 'Internal',
    keySystem: 'Keyless',
    tags: ['Internal'],
    features: ['Decompiler', 'Multi-instance'],
    sunc: 100,
    description: 'Dedicated paid macOS executor option',
    pros: ['Dedicated Mac support'],
    cons: ['Smaller ecosystem'],
    pricingOptions: ['$4.99 to $19.99'],
    freeOrPaid: 'paid',
    stability: 'Stable',
    trustLevel: 'Medium',
    status: 'Undetected',
    officialSite: 'https://www.raptor.fun/'
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
    description: 'Budget-friendly paid Windows executor with stable day-to-day use',
    pros: ['Affordable', 'Stable'],
    cons: ['Limited features'],
    pricingOptions: ['$3.99 to $9.99'],
    freeOrPaid: 'paid',
    stability: 'Mixed',
    trustLevel: 'Medium',
    status: 'Detection issues',
    officialSite: 'https://seliware.com/'
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
    description: 'External executor with kernel capabilities and many features',
    pros: ['Kernel', 'Feature-rich'],
    cons: ['None listed'],
    pricingOptions: ['From $8.47 for 30 days'],
    freeOrPaid: 'paid',
    stability: 'Unknown',
    trustLevel: 'Unknown',
    status: 'Unknown',
    officialSite: 'https://www.serotonin.win/'
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
    description: 'Niche lifetime Windows executor with stable core behavior',
    pros: ['Stable'],
    cons: ['Not widely used'],
    pricingOptions: ['$20 lifetime'],
    freeOrPaid: 'paid',
    stability: 'Unknown',
    trustLevel: 'Unknown',
    status: 'Unknown',
    officialSite: 'https://discord.com/invite/4QmWjQCgzV'
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
    description: 'Popular mobile executor for iOS and Android users',
    pros: ['Very popular mobile option'],
    cons: ['Detection concerns'],
    pricingOptions: ['$7.47'],
    freeOrPaid: 'paid',
    stability: 'Unknown',
    trustLevel: 'Unknown',
    status: 'Unknown',
    officialSite: 'https://spdmteam.com/index'
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
    description: 'Mixed-plan Windows executor with flexible free and paid usage',
    pros: ['Has a free tier', 'Flexible plans'],
    cons: ['Paid version needed for full power'],
    pricingOptions: ['Free to $34.99'],
    freeOrPaid: 'both',
    stability: 'Mixed',
    trustLevel: 'Medium',
    status: 'Undetected',
    officialSite: 'https://bunni.fun/'
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
    description: 'Popular mobile executor with free and paid plan options',
    pros: ['Mobile friendly', 'Free option'],
    cons: ['Limited compared to PC options'],
    pricingOptions: ['Free to $8'],
    freeOrPaid: 'both',
    stability: 'Stable',
    trustLevel: 'Medium',
    status: 'Undetected',
    officialSite: 'https://deltaexploits.gg/'
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
    description: 'Popular macOS executor with both free and paid tiers',
    pros: ['Free option', 'Flexible pricing'],
    cons: ['Performance varies'],
    pricingOptions: ['Free to $30'],
    freeOrPaid: 'both',
    stability: 'Stable',
    trustLevel: 'Medium',
    status: 'Undetected',
    officialSite: 'https://hydrogen.lat/'
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
    description: 'Feature-rich external executor with kernel and decompiler support',
    pros: ['Lots of features'],
    cons: ['Registration process very complex'],
    pricingOptions: ['$9.99 lifetime'],
    freeOrPaid: 'paid',
    stability: 'Unknown',
    trustLevel: 'Unknown',
    status: 'Unknown',
    officialSite: 'https://discord.com/invite/matchalattewin'
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
    description: 'Advanced Windows executor with strong execution and rich features',
    pros: ['Strong execution', 'Feature-rich'],
    cons: ['Expensive at high tiers'],
    pricingOptions: ['$5.99 to $49.99'],
    freeOrPaid: 'paid',
    stability: 'Unknown',
    trustLevel: 'Low',
    status: 'Unknown',
    officialSite: 'https://volt.bz/'
  },
  {
    name: 'Aimmy',
    featured: false,
    platform: ['Windows'],
    cheatType: 'Internal',
    keySystem: 'Keyless',
    tags: ['Internal'],
    features: [],
    sunc: null,
    description: 'Lightweight free Windows executor that is easy for beginners to use',
    pros: ['Lightweight', 'Easy to use'],
    cons: ['Limited features', 'Lower stability'],
    pricingOptions: ['Free'],
    freeOrPaid: 'free',
    stability: 'Unknown',
    trustLevel: 'Unknown',
    status: 'Unknown',
    officialSite: 'https://aimmy.dev/'
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
    description: 'Balanced paid Windows executor with stable overall performance',
    pros: ['Balanced performance'],
    cons: ['Not top-tier'],
    pricingOptions: ['$5.99 to $19.99'],
    freeOrPaid: 'paid',
    stability: 'Stable',
    trustLevel: 'High',
    status: 'Undetected',
    officialSite: 'https://volcano.wtf/'
  },
  {
    name: 'Wave',
    featured: false,
    platform: ['Windows'],
    cheatType: 'Internal',
    keySystem: 'Keyless',
    tags: ['Internal', 'Warning'],
    features: ['Decompiler', 'Multi-instance'],
    sunc: 98,
    description: 'Strong mid-tier Windows executor with flexible pricing options',
    pros: ['Good execution speed', 'Flexible pricing'],
    cons: ['Requires a key', 'No inexpensive lifetime option'],
    pricingOptions: ['$2.49 to $39.99'],
    freeOrPaid: 'paid',
    stability: 'Stable',
    trustLevel: 'Low',
    status: 'Undetected',
    officialSite: 'https://getwave.gg/'
  },
  {
    name: 'Yerba',
    featured: false,
    platform: ['Windows'],
    cheatType: 'Internal',
    keySystem: 'Keyless',
    tags: ['Internal'],
    features: [],
    sunc: null,
    description: 'Budget Windows executor offering inexpensive lifetime access',
    pros: ['Cheap lifetime price'],
    cons: ['Limited ecosystem'],
    pricingOptions: ['$9.99 lifetime'],
    freeOrPaid: 'paid',
    stability: 'Unknown',
    trustLevel: 'Unknown',
    status: 'Unknown',
    officialSite: ''
  },
  {
    name: 'Cosmic',
    featured: false,
    platform: ['Windows'],
    cheatType: 'Internal',
    keySystem: 'Keyless',
    tags: ['Internal'],
    features: [],
    sunc: null,
    description: 'Affordable lifetime Windows executor in the budget segment',
    pros: ['Affordable lifetime pricing'],
    cons: ['Not widely trusted'],
    pricingOptions: ['$9.99 lifetime'],
    freeOrPaid: 'paid',
    stability: 'Unknown',
    trustLevel: 'Low',
    status: 'Unknown',
    officialSite: ''
  },
  {
    name: 'Isaeva',
    featured: false,
    platform: ['Windows'],
    cheatType: 'Internal',
    keySystem: 'Keyless',
    tags: ['Internal'],
    features: [],
    sunc: null,
    description: 'Premium Windows executor with tiered plans that scale upward',
    pros: ['Good scaling plans'],
    cons: ['Price climbs quickly'],
    pricingOptions: ['$4.99 to $44.99'],
    freeOrPaid: 'paid',
    stability: 'Unknown',
    trustLevel: 'Unknown',
    status: 'Unknown',
    officialSite: ''
  },
  {
    name: 'Ronin',
    featured: false,
    platform: ['Windows'],
    cheatType: 'Internal',
    keySystem: 'Keyless',
    tags: ['Internal'],
    features: [],
    sunc: null,
    description: 'Entry-level paid Windows executor with low pricing',
    pros: ['Very affordable'],
    cons: ['Lower power'],
    pricingOptions: ['$2.99 to $9.98'],
    freeOrPaid: 'paid',
    stability: 'Unknown',
    trustLevel: 'Unknown',
    status: 'Unknown',
    officialSite: ''
  },
  {
    name: 'Cryptic',
    featured: false,
    platform: ['Windows', 'macOS', 'iOS', 'Android'],
    cheatType: 'Internal',
    keySystem: 'Keyed',
    tags: ['Internal'],
    features: [],
    sunc: null,
    description: 'Multi-platform executor spanning desktop and mobile environments',
    pros: ['Multi-platform support', 'Flexible pricing'],
    cons: ['Mixed trust reputation', 'Currency varies by region'],
    pricingOptions: ['€4.5 to €34'],
    freeOrPaid: 'paid',
    stability: 'Unknown',
    trustLevel: 'Unknown',
    status: 'Unknown',
    officialSite: ''
  },
  {
    name: 'Codex',
    featured: false,
    platform: ['Android'],
    cheatType: 'Internal',
    keySystem: 'Keyed',
    tags: ['Internal'],
    features: [],
    sunc: null,
    description: 'Android-focused mobile executor with budget-friendly paid options',
    pros: ['Affordable mobile option'],
    cons: ['Android only'],
    pricingOptions: ['$4.99 to $19.99'],
    freeOrPaid: 'paid',
    stability: 'Unknown',
    trustLevel: 'Unknown',
    status: 'Unknown',
    officialSite: ''
  },
  {
    name: 'SirHurt',
    featured: false,
    platform: ['Windows'],
    cheatType: 'Internal',
    keySystem: 'Keyless',
    tags: ['Internal'],
    features: [],
    sunc: null,
    description: 'Legacy Windows executor with long-standing name recognition',
    pros: ['Long-standing and well-known'],
    cons: ['Very expensive lifetime plan'],
    pricingOptions: ['$2.8 to $100'],
    freeOrPaid: 'paid',
    stability: 'Unknown',
    trustLevel: 'Unknown',
    status: 'Unknown',
    officialSite: ''
  },
  {
    name: 'Matrix',
    featured: false,
    platform: ['Windows'],
    cheatType: 'Internal',
    keySystem: 'Keyless',
    tags: ['Internal'],
    features: [],
    sunc: null,
    description: 'Simple Windows lifetime executor for budget-focused users',
    pros: ['Cheap lifetime access'],
    cons: ['Limited features'],
    pricingOptions: ['$4.99 lifetime'],
    freeOrPaid: 'paid',
    stability: 'Unknown',
    trustLevel: 'Unknown',
    status: 'Unknown',
    officialSite: ''
  }
];

const scriptsHubData = {
  tierListPaid: [
    { tier: '1', executor: 'Pluton', notes: 'Top paid pick for balanced performance, consistency, and support coverage' },
    { tier: '2', executor: 'Potassium', notes: 'Strong feature depth with excellent sUNC support, but trust concerns remain' },
    { tier: '3', executor: 'Seliware', notes: 'Smooth execution and polished UX, with occasional detection instability' },
    { tier: '4', executor: 'Volcano', notes: 'Stable long-term option with reliable execution, but comparatively expensive' }
  ],
  tierListFree: [
    { tier: '1', executor: 'Pluton', notes: 'Best free overall package right now with broad platform support' },
    { tier: '2', executor: 'Velocity', notes: 'Fast keyless free option with modern tooling and customization' },
    { tier: '3', executor: 'Solara', notes: 'Reliable free Windows option with steady day-to-day stability' },
    { tier: '4', executor: 'JJSploit', notes: 'Beginner-friendly choice with a simplified workflow' }
  ],
  popularScripts: [
    {
      name: 'Voidware Bedwars',
      game: 'Bedwars',
      description: 'The most popular Roblox Bedwars script',
      script: 'loadstring(game:HttpGet("https://raw.githubusercontent.com/VapeVoidware/VWRewrite/master/NewMainScript.lua", true))()'
    }
  ],
  recentChanges: [
    'Expanded the Executors tab with updated free, paid, premium, mobile, Mac, and legacy options plus normalized pricing, pros, and cons formatting',
    'Revamped the New UI with a modern visual refresh and a modal-based Theme Customizer',
    'Added route-aware navigation for /scripthub and /newui paths, including Script Hub subtabs and browser history support',
    'Improved AI Insight reliability with retry and backoff handling, stronger timeout behavior, and cached successful responses',
    'Added Official Discord links in the top navigation and executor modal, then refined the top navigation to a clean icon-only Discord logo',
    'Fixed refresh behavior for subpage routes by funneling all route entrypoints to the latest root build',
    'Reworked Theme Customizer to control the full site mood with complete palette overrides',
    'Redesigned Theme Customizer with Basic and Advanced subtabs and added five pastel preset circles for one-click themes',
    'Fixed pink theme mood mapping so New UI surfaces, panels, cards, and overlays now fully follow the selected palette',
    'Expanded New UI theme application so all blue UI surfaces now follow the selected palette, including buttons, search, Script Hub controls, and form elements',
    'Hardened route bootstrap parsing so refreshing any tab reliably restores executors and New UI state',
    'Finalized full theme propagation for tier lists, popular scripts, saved scripts, recent changes, featured executor highlights, and themed scrollbars'
  ]
};

const XYREX_OFFICIAL_DISCORD_URL = 'https://discord.gg/6YXCAQYY';

const discordWordmarkSvg = '<svg viewBox="0 0 127.14 96.36" aria-hidden="true" focusable="false"><path fill="currentColor" d="M107.7 8.07A105.15 105.15 0 0081.47 0a72.06 72.06 0 00-3.36 6.83 97.68 97.68 0 00-29.94 0A72.37 72.37 0 0044.8 0 105.89 105.89 0 0018.57 8.08C1.03 34.37-3.72 60 1.39 85.28A105.73 105.73 0 0033.32 96a77.7 77.7 0 006.84-11.16 68.42 68.42 0 01-10.78-5.15c.91-.67 1.8-1.37 2.66-2.09a75.57 75.57 0 0063.48 0c.87.72 1.76 1.42 2.67 2.09a68.68 68.68 0 01-10.8 5.16A77.53 77.53 0 0094.24 96a105.25 105.25 0 0031.91-10.72c6-29.3-1-54.68-18.45-77.21zM42.45 65.69c-6.23 0-11.33-5.69-11.33-12.69s5-12.7 11.33-12.7S53.78 46 53.78 53s-5.03 12.69-11.33 12.69zm42.24 0c-6.23 0-11.33-5.69-11.33-12.69s5-12.7 11.33-12.7S96.02 46 96.02 53s-5.03 12.69-11.33 12.69z"/></svg>';

const popularScriptFileSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" aria-hidden="true" focusable="false"><path fill="currentColor" d="M288 64C252.7 64 224 92.7 224 128L224 384C224 419.3 252.7 448 288 448L480 448C515.3 448 544 419.3 544 384L544 183.4C544 166 536.9 149.3 524.3 137.2L466.6 81.8C454.7 70.4 438.8 64 422.3 64L288 64zM160 192C124.7 192 96 220.7 96 256L96 512C96 547.3 124.7 576 160 576L352 576C387.3 576 416 547.3 416 512L416 496L352 496L352 512L160 512L160 256L176 256L176 192L160 192z"/></svg>';

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

function stripTrailingPeriod(value) {
  return String(value ?? '').replace(/\.+$/g, '').trim();
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

const CARD_EXIT_ANIMATION_MS = 210;

function renderProducts(list) {
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
    sorted.forEach((product, index) => grid.appendChild(createProductCard(product, index)));
    return;
  }
  const existingByName = new Map(oldCards.map(card => [card.getAttribute('data-name'), card]));
  const oldRectByName = new Map(oldCards.map(card => [card.getAttribute('data-name'), card.getBoundingClientRect()]));
  const nextNames = new Set(sorted.map(item => item.name));
  qs('#noResults').hidden = Boolean(sorted.length);

  oldCards.forEach(card => {
    const name = card.getAttribute('data-name');
    if (!nextNames.has(name)) card.classList.add('card-exit');
  });

  window.setTimeout(() => {
    if (grid.dataset.renderVersion !== nextVersion) return;

    oldCards.forEach(card => {
      if (!nextNames.has(card.getAttribute('data-name'))) card.remove();
    });
    if (!sorted.length) return;

    const orderedCards = sorted.map((product, index) => {
      const existingCard = existingByName.get(product.name);
      if (existingCard) {
        existingCard.setAttribute('data-index', String(index));
        return existingCard;
      }
      const newCard = createProductCard(product, index);
      newCard.classList.add('card-enter');
      return newCard;
    });
    orderedCards.forEach(card => grid.appendChild(card));

    orderedCards.forEach(card => {
      const name = card.getAttribute('data-name');
      const oldRect = oldRectByName.get(name);
      if (!oldRect) return;
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
        window.setTimeout(() => card.classList.remove('card-shift'), 430);
      });
    });
  }, CARD_EXIT_ANIMATION_MS);
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

  if (priceControls.free && priceControls.paid) return ['free', 'paid', 'both'].includes(prod.freeOrPaid);
  if (priceControls.both) return prod.freeOrPaid === 'both';
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

function getAiTokenSummary() {
  const fallback = { available: 0, freeRemaining: 0, purchased: 0 };
  const summary = window.XyrexDodge?.getTokenSummary?.();
  if (!summary || typeof summary !== 'object') return fallback;
  return {
    available: Number.isFinite(summary.available) ? summary.available : 0,
    freeRemaining: Number.isFinite(summary.freeRemaining) ? summary.freeRemaining : 0,
    purchased: Number.isFinite(summary.purchased) ? summary.purchased : 0
  };
}


function getBetaFeaturesEnabled() {
  return localStorage.getItem('xyrex_beta_features') === 'enabled';
}

function setBetaFeaturesEnabled(enabled) {
  localStorage.setItem('xyrex_beta_features', enabled ? 'enabled' : 'disabled');
  document.body.classList.toggle('beta-features-enabled', enabled);
}

function getCurrentAccountName() {
  const account = window.XyrexAuth?.getCurrentAccount?.() || window.XyrexAccountScope?.getAccount?.() || 'guest';
  return String(account || 'guest');
}

function isGuestAccount() {
  return getCurrentAccountName() === 'guest';
}

function openSettingsModal() {
  const overlay = qs('#modalOverlay');
  const content = qs('#modalContent');
  const tokenSummary = getAiTokenSummary();
  const authConfigured = Boolean(window.XyrexAuth?.hasRemoteSync?.());
  const accountActionsDisabled = authConfigured ? '' : 'disabled';

  content.innerHTML = `
    <section class="settings-modal">
      <header class="settings-modal-head">
        <h2>Settings</h2>
        <p class="modal-headline">Manage interface preferences, open the dodge game quickly, and review your AI token balance</p>
      </header>
      <div class="settings-group">
        <h3>Interface</h3>
        <div class="settings-actions">
          <button id="settingsUiModeBtn" class="btn-primary settings-action-btn" type="button">${isNewUiMode ? 'Switch to Default UI' : 'Switch to New UI'}</button>
          <button id="settingsThemeCustomizerBtn" class="btn-primary settings-action-btn" type="button" ${isNewUiMode ? '' : 'disabled'}>Theme Customizer</button>
        </div>
        <p class="settings-note">Theme Customizer is available when New UI mode is active</p>
      </div>
      <div class="settings-group">
        <h3>Gameplay</h3>
        <div class="settings-actions">
          <button id="settingsPlayDodgeBtn" class="btn-primary settings-action-btn" type="button">Play Dodge</button>
          <button id="settingsBetaFeaturesBtn" class="btn-primary settings-action-btn" type="button">${getBetaFeaturesEnabled() ? 'Disable BETA Features' : 'Enable BETA Features'}</button>
        </div>
      </div>
      <div class="settings-group">
        <h3>Account</h3>
        <p class="settings-note">Current account: <strong>${escapeHtml(getCurrentAccountName())}</strong></p>
        <p id="settingsAuthFeedback" class="settings-note" hidden></p>
        <div class="settings-actions">
          <button id="settingsLoginBtn" class="btn-primary settings-action-btn" type="button" ${accountActionsDisabled}>Login</button>
          <button id="settingsSignUpBtn" class="btn-primary settings-action-btn" type="button" ${accountActionsDisabled}>Sign Up</button>
          <button id="settingsResetPasswordBtn" class="btn-primary settings-action-btn" type="button" ${accountActionsDisabled}>Reset Password</button>
          ${isGuestAccount() ? '' : `<button id="settingsLogoutBtn" class="btn-primary settings-action-btn" type="button" ${accountActionsDisabled}>Log Out</button>`}
        </div>
        <p class="settings-note">Use letters, numbers, underscores, or periods for usernames. Passwords require 8+ characters, at least one uppercase letter, and at least one number.</p>
        <p class="settings-note">${authConfigured ? 'Account sync is enabled for this deployment.' : 'Account sync is not configured on this deployment yet.'}</p>
      </div>
      <div class="settings-group">
        <h3>AI Usage</h3>
        <p class="settings-token-count">Available AI tokens: <strong>${tokenSummary.available}</strong></p>
      </div>
      <footer class="settings-credit">Made by Joseph (plutoxqq)</footer>
    </section>`;

  overlay.classList.remove('is-closing');
  overlay.setAttribute('aria-hidden', 'false');

  const uiModeBtn = qs('#settingsUiModeBtn');
  uiModeBtn?.addEventListener('click', async () => {
    isNewUiMode = !isNewUiMode;
    localStorage.setItem(uiModeStorageKey, isNewUiMode ? 'new' : 'default');
    await applyUiMode();
    syncRouteWithState();
    openSettingsModal();
  });

  const themeBtn = qs('#settingsThemeCustomizerBtn');
  themeBtn?.addEventListener('click', () => {
    if (!isNewUiMode || !window.XyrexNewUI?.toggleThemeCustomizer) return;
    window.XyrexNewUI.toggleThemeCustomizer();
  });

  const dodgeBtn = qs('#settingsPlayDodgeBtn');
  dodgeBtn?.addEventListener('click', () => {
    syncNavButtonsWithPage('easterEggPage');
    setActivePage('easterEggPage');
    closeModal();
  });

  const betaBtn = qs('#settingsBetaFeaturesBtn');
  betaBtn?.addEventListener('click', () => {
    const enabled = !getBetaFeaturesEnabled();
    setBetaFeaturesEnabled(enabled);
    openSettingsModal();
  });

  const authFeedback = qs('#settingsAuthFeedback');
  const setAuthFeedback = (message, type = 'error') => {
    if (!authFeedback) return;
    authFeedback.hidden = !message;
    authFeedback.textContent = message || '';
    authFeedback.className = `settings-note ${type === 'success' ? 'xy-auth-status success' : type === 'error' ? 'xy-auth-status error' : ''}`;
  };

  if (!authConfigured) {
    setAuthFeedback('Account actions are disabled because Supabase auth is not configured on this deployment.', 'error');
  }

  qs('#settingsLoginBtn')?.addEventListener('click', () => {
    if (!isGuestAccount()) {
      setAuthFeedback('You are already logged in. Log out first if you want to switch accounts.', 'error');
      return;
    }
    window.XyrexAuth?.openAuthModal?.('login');
  });
  qs('#settingsSignUpBtn')?.addEventListener('click', () => {
    window.XyrexAuth?.openAuthModal?.('signup');
  });

  qs('#settingsResetPasswordBtn')?.addEventListener('click', async event => {
    const button = event.currentTarget;
    if (!button) return;
    button.disabled = true;
    try {
      window.XyrexAuth?.openAuthModal?.('login');
      setAuthFeedback('Enter your username or email in the login modal and click Reset Password.', 'success');
    } catch (error) {
      setAuthFeedback(error?.message || 'Failed to start password reset flow.', 'error');
    } finally {
      button.disabled = false;
    }
  });
  qs('#settingsLogoutBtn')?.addEventListener('click', async event => {
    const button = event.currentTarget;
    if (!button) return;
    button.disabled = true;
    try {
      await window.XyrexAuth?.logout?.();
      openSettingsModal();
    } finally {
      button.disabled = false;
    }
  });

  qs('#modalCloseBtn').focus();
}

function closeModal() {
  const overlay = qs('#modalOverlay');
  if (overlay.getAttribute('aria-hidden') === 'true') return;

  overlay.classList.add('is-closing');
  window.setTimeout(() => {
    if (!overlay.classList.contains('is-closing')) return;
    overlay.setAttribute('aria-hidden', 'true');
    overlay.classList.remove('is-closing');
    qs('#modalContent').innerHTML = '';
  }, 190);
}

function renderTierList(containerId, entries) {
  const wrap = qs(`#${containerId}`);
  if (!wrap) return;
  wrap.innerHTML = entries.map(entry => `
    <article class="rank-item rank-tier-${escapeHtml(String(entry.tier || '').toLowerCase())}">
      <div class="rank-badge"><span>${escapeHtml(entry.tier)}</span></div>
      <div><h4>${escapeHtml(entry.executor)}</h4><p>${escapeHtml(entry.notes)}</p></div>
    </article>`).join('');
}

function renderPopularScripts() {
  const wrap = qs('#popularScriptsList');
  if (!wrap) return;
  wrap.innerHTML = scriptsHubData.popularScripts.map(item => `
    <article class="script-card">
      <div class="script-card-head">
        <h4 class="script-card-title"><span class="script-file-icon">${popularScriptFileSvg}</span>${escapeHtml(item.name)}</h4>
        <div class="script-card-meta">
          <span>${escapeHtml(stripTrailingPeriod(item.game))}</span>
          <button class="script-copy-btn" type="button" data-script-copy="${escapeHtml(item.script)}" title="Copy script" aria-label="Copy script">
            <span class="script-file-icon">${popularScriptFileSvg}</span>
          </button>
        </div>
      </div>
      <p>${escapeHtml(stripTrailingPeriod(item.description))}</p>
      <div class="script-code-wrap">
        <pre>${escapeHtml(item.script)}</pre>
      </div>
    </article>`).join('');

  wrap.querySelectorAll('.script-copy-btn').forEach(button => {
    button.addEventListener('click', async () => {
      const scriptValue = button.getAttribute('data-script-copy') || '';
      if (!scriptValue) return;
      try {
        await navigator.clipboard.writeText(scriptValue);
        button.classList.add('is-copied');
        window.setTimeout(() => button.classList.remove('is-copied'), 900);
      } catch {
        // no-op
      }
    });
  });
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
    wrap.innerHTML = '<p class="saved-empty">No saved scripts yet</p>';
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


const uiModeStorageKey = 'xyrex_ui_mode';
let isNewUiMode = localStorage.getItem(uiModeStorageKey) === 'new';
let newUiLoadAttempted = false;

function loadNewUiModule() {
  if (window.XyrexNewUI) return Promise.resolve(true);
  if (newUiLoadAttempted) return Promise.resolve(false);
  newUiLoadAttempted = true;

  return new Promise(resolve => {
    const script = document.createElement('script');
    script.src = '/new-ui.js?v=2.1.0';
    script.defer = true;
    script.onload = () => resolve(Boolean(window.XyrexNewUI));
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
}

async function applyUiMode() {
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

let activePageId = null;
let activeSubtabId = 'tierPaidPanel';
let suppressRouteSync = false;

const subtabPathSlugMap = {
  tierPaidPanel: 'executortierlistpaid',
  tierFreePanel: 'executortierlistfree',
  popularScriptsPanel: 'popularscripts',
  savedScriptsPanel: 'savedscripts',
  recentChangesPanel: 'recentchanges'
};

const subtabPathToIdMap = Object.fromEntries(
  Object.entries(subtabPathSlugMap).map(([key, value]) => [value, key])
);

function normalisePath(pathname) {
  const clean = String(pathname || '/').replace(/\/+$/, '');
  return clean || '/';
}

function getRouteStateFromPath(pathname) {
  const segments = normalisePath(pathname).split('/').filter(Boolean).map(item => item.toLowerCase());
  let isRouteNewUi = false;
  let cursor = 0;

  if (segments[0] === 'newui') {
    isRouteNewUi = true;
    cursor = 1;
  }

  let pageId = 'executorsPage';
  let subtabId = 'tierPaidPanel';

  if (segments[cursor] === 'dodge') {
    pageId = 'easterEggPage';
  }

  if (segments[cursor] === 'scripthub') {
    pageId = 'scriptsPage';
    const slug = segments[cursor + 1] || '';
    if (slug && subtabPathToIdMap[slug]) {
      subtabId = subtabPathToIdMap[slug];
    }
  }

  return {
    isRouteNewUi,
    pageId,
    subtabId
  };
}

function buildPathFromState() {
  const base = isNewUiMode ? '/newui' : '';
  if (activePageId === 'scriptsPage') {
    const subtabSegment = subtabPathSlugMap[activeSubtabId];
    if (subtabSegment && activeSubtabId !== 'tierPaidPanel') return `${base}/scripthub/${subtabSegment}`;
    return `${base}/scripthub`;
  }

  if (activePageId === 'easterEggPage') return `${base}/dodge`;

  return base || '/';
}

function syncRouteWithState(replace = false) {
  if (suppressRouteSync) return;
  const nextPath = buildPathFromState();
  if (normalisePath(window.location.pathname) === normalisePath(nextPath)) return;
  const method = replace ? 'replaceState' : 'pushState';
  window.history[method]({}, '', nextPath);
}

function syncNavButtonsWithPage(targetPageId) {
  qsa('.page-switch-btn').forEach(item => {
    item.classList.toggle('is-active', item.getAttribute('data-page-target') === targetPageId);
  });
}

function syncSubtabButtons(targetSubtabId) {
  qsa('.subtab-btn').forEach(item => {
    const active = item.getAttribute('data-subtab-target') === targetSubtabId;
    item.classList.toggle('is-active', active);
    item.setAttribute('aria-selected', String(active));
  });
}


function normalizeIncomingRoute(routeValue) {
  const route = String(routeValue || '').trim();
  if (!route) return '/';

  try {
    const parsed = new URL(route, window.location.origin);
    return parsed.pathname || '/';
  } catch {
    const pathOnly = route.split(/[?#]/)[0];
    return pathOnly.startsWith('/') ? pathOnly : '/';
  }
}

function getInitialRoutePath() {
  const params = new URLSearchParams(window.location.search);
  const routeParam = params.get('route');
  if (!routeParam) return window.location.pathname;
  return normalizeIncomingRoute(routeParam);
}

async function applyRoute(pathname, replace = false) {
  const routeState = getRouteStateFromPath(pathname);
  suppressRouteSync = true;

  isNewUiMode = routeState.isRouteNewUi;
  localStorage.setItem(uiModeStorageKey, isNewUiMode ? 'new' : 'default');

  syncNavButtonsWithPage(routeState.pageId);
  syncSubtabButtons(routeState.subtabId);
  setActiveSubtab(routeState.subtabId);
  setActivePage(routeState.pageId);
  await applyUiMode();

  suppressRouteSync = false;
  syncRouteWithState(replace);
}

function restartAnimationClass(element, animationClass) {
  if (!element) return;
  element.classList.remove(animationClass);
  void element.offsetWidth;
  element.classList.add(animationClass);
}

function animateMainContentTransition() {
  restartAnimationClass(qs('.main-content'), 'is-view-switching');
}

function setActivePage(targetPageId) {
  if (targetPageId === activePageId) return;

  const nextPage = qs(`#${targetPageId}`);
  if (!nextPage) return;

  qsa('.app-page').forEach(page => {
    const isTarget = page.id === targetPageId;
    page.hidden = !isTarget;
    page.classList.toggle('is-active', isTarget);
  });

  animateMainContentTransition();
  restartAnimationClass(nextPage, 'animate-in-page');
  activePageId = targetPageId;

  const onScriptsPage = targetPageId === 'scriptsPage';
  const onEasterPage = targetPageId === 'easterEggPage';
  qs('#sidebar').hidden = onScriptsPage || onEasterPage;
  qs('#searchInput').disabled = onScriptsPage;
  qs('#clearSearchBtn').disabled = onScriptsPage;
  qs('.page-layout').classList.toggle('scripts-mode', onScriptsPage || onEasterPage);
  document.body.classList.toggle('easter-game-mode', onEasterPage);

  if (onEasterPage) {
    window.XyrexDodge?.start?.();
  } else {
    window.XyrexDodge?.stop?.();
  }

  syncRouteWithState();
}

function setActiveSubtab(targetSubtabId) {
  if (targetSubtabId === activeSubtabId) return;

  const nextPanel = qs(`#${targetSubtabId}`);
  const previousPanel = qs(`#${activeSubtabId}`);
  if (!nextPanel) return;

  const tabOrder = ['tierPaidPanel', 'tierFreePanel', 'popularScriptsPanel', 'savedScriptsPanel', 'recentChangesPanel'];
  const previousIndex = tabOrder.indexOf(activeSubtabId);
  const nextIndex = tabOrder.indexOf(targetSubtabId);
  const direction = nextIndex > previousIndex ? 'forward' : 'backward';
  if (!previousPanel || typeof nextPanel.animate !== 'function' || typeof previousPanel.animate !== 'function') {
    qsa('.subtab-panel').forEach(panel => {
      panel.hidden = panel.id !== targetSubtabId;
    });
  } else {
    const wrapper = previousPanel.parentElement;
    const outgoingTransform = direction === 'forward' ? 'translateX(-42px)' : 'translateX(42px)';
    const incomingFrom = direction === 'forward' ? 'translateX(42px)' : 'translateX(-42px)';
    const wrapperHeight = Math.max(previousPanel.offsetHeight, nextPanel.offsetHeight);
    wrapper.style.position = 'relative';
    wrapper.style.minHeight = `${wrapperHeight}px`;

    previousPanel.hidden = false;
    previousPanel.style.position = 'absolute';
    previousPanel.style.inset = '0';
    previousPanel.style.width = '100%';

    nextPanel.hidden = false;
    nextPanel.style.position = 'absolute';
    nextPanel.style.inset = '0';
    nextPanel.style.width = '100%';

    const outgoing = previousPanel.animate(
      [{ opacity: 1, transform: 'translateX(0)' }, { opacity: 0, transform: outgoingTransform }],
      { duration: 260, easing: 'cubic-bezier(.22,.84,.25,1)', fill: 'forwards' }
    );
    const incoming = nextPanel.animate(
      [{ opacity: 0, transform: incomingFrom }, { opacity: 1, transform: 'translateX(0)' }],
      { duration: 300, easing: 'cubic-bezier(.2,.9,.26,1)', fill: 'forwards' }
    );

    Promise.allSettled([outgoing.finished, incoming.finished]).then(() => {
      previousPanel.hidden = true;
      [previousPanel, nextPanel].forEach(panel => {
        panel.style.position = '';
        panel.style.inset = '';
        panel.style.width = '';
        panel.style.opacity = '';
        panel.style.transform = '';
      });
      wrapper.style.minHeight = '';
    });
  }
  activeSubtabId = targetSubtabId;
  syncRouteWithState();
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
      syncNavButtonsWithPage(target);
      setActivePage(target);
    });
  });

  qs('#savedScriptsList').addEventListener('click', event => {
    const trigger = event.target.closest('[data-saved-script-id]');
    if (!trigger) return;
    const selectedId = trigger.getAttribute('data-saved-script-id');
    if (selectedId === currentSavedScriptId) {
      currentSavedScriptId = null;
      clearSavedScriptEditor();
      renderSavedScriptsList();
      return;
    }
    currentSavedScriptId = selectedId;
    const selected = getSavedScripts().find(item => item.id === currentSavedScriptId);
    setEditorFromSavedScript(selected);
    renderSavedScriptsList();
  });

  qs('#saveScriptBtn').addEventListener('click', saveScriptFromEditor);
  qs('#deleteScriptBtn').addEventListener('click', deleteSelectedScript);
}

function syncNavigationLayoutMetrics() {
  const topnav = qs('.topnav');
  if (!topnav) return;

  const updateNavHeight = () => {
    const navHeight = Math.max(56, Math.ceil(topnav.getBoundingClientRect().height));
    document.documentElement.style.setProperty('--nav-height', `${navHeight}px`);
  };

  updateNavHeight();
  window.addEventListener('resize', updateNavHeight, { passive: true });
  window.addEventListener('orientationchange', updateNavHeight, { passive: true });

  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(updateNavHeight);
    observer.observe(topnav);
  }
}


window.addEventListener('xyrex:account-changed', () => {
  const overlay = qs('#modalOverlay');
  if (overlay?.getAttribute('aria-hidden') === 'false' && qs('.settings-modal')) {
    openSettingsModal();
  }
});

function init() {
  setBetaFeaturesEnabled(getBetaFeaturesEnabled());
  syncNavigationLayoutMetrics();
  renderProducts(products);
  initScriptsHub();
  injectLegendIcons();

  qs('#searchInput').addEventListener('input', applyAllFilters);
  qs('#searchInput').addEventListener('keydown', e => {
    const searchValue = qs('#searchInput').value.trim().toLowerCase();
    if (e.key === 'Enter' && searchValue === 'dodge') {
      qsa('.page-switch-btn').forEach(item => item.classList.remove('is-active'));
      setActivePage('easterEggPage');
    }
  });

  qs('#clearSearchBtn').addEventListener('click', () => {
    qs('#searchInput').value = '';
    applyAllFilters();
  });

  qs('#brandHomeBtn').addEventListener('click', () => {
    qs('#searchInput').value = '';
    applyAllFilters();
    syncNavButtonsWithPage('executorsPage');
    setActivePage('executorsPage');
  });

  qs('#settingsTabBtn').addEventListener('click', openSettingsModal);

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

  window.addEventListener('popstate', () => {
    applyRoute(getInitialRoutePath(), true);
  });

  applyRoute(getInitialRoutePath(), true);
}

document.addEventListener('DOMContentLoaded', init);
