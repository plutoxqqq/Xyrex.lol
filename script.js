const products = [
  {
    name: 'Aimmy',
    featured: false,
    platform: ['Windows'],
    cheatType: 'External',
    keySystem: 'Keyless',
    tags: ['External'],
    features: ['AI'],
    sunc: null,
    description: 'AI-powered external tool for Roblox and other games',
    pros: ['Supports other games', 'No key system', 'AI-powered'],
    cons: ['Requires AI training', 'Needs powerful hardware for best results'],
    pricingOptions: ['Free'],
    freeOrPaid: 'free',
    stability: 'Unknown',
    trustLevel: 'Unknown',
    status: 'Unknown',
    officialSite: 'https://aimmy.dev/',
    officialDiscord: 'discord.gg/aimmy',
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
    description: 'Mobile executor for iOS and Android with VNG support',
    pros: ['Supports VNG', 'Mobile support'],
    cons: ['Fails sUNC', 'Key system required'],
    pricingOptions: ['Unknown'],
    freeOrPaid: 'paid',
    stability: 'Unknown',
    trustLevel: 'Unknown',
    status: 'Unknown',
    officialSite: 'https://spdmteam.com/',
    officialDiscord: 'https://discord.com/invite/wQKjUYf99A',
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
    cons: ['Paid version needed for full power', 'Popularity has significantly dropped'],
    pricingOptions: ['Free', '}.99 daily', '$9.99 monthly', '$34.99 lifetime'],
    freeOrPaid: 'both',
    stability: 'Mixed',
    trustLevel: 'Low',
    status: 'Undetected',
    officialSite: 'https://bunni.fun/',
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
    officialSite: '',
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
    officialSite: 'https://cosmic.best',
  },
  {
    name: 'Cryptic',
    featured: false,
    platform: ['Windows', 'macOS', 'iOS', 'Android'],
    cheatType: 'Internal',
    keySystem: 'Keyed',
    tags: ['Internal'],
    features: [],
    sunc: 97,
    description: 'Multi-platform executor spanning desktop and mobile environments',
    pros: ['Multi-platform support', 'Flexible pricing'],
    cons: ['Mixed trust reputation', 'Currency varies by region'],
    pricingOptions: ['€4.5 to €34'],
    freeOrPaid: 'paid',
    stability: 'Unknown',
    trustLevel: 'Unknown',
    status: 'Unknown',
    officialSite: 'https://getcryptic.net',
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
    officialSite: 'https://deltaexploits.gg/',
  },
  {
    name: 'Exoliner',
    featured: false,
    platform: ['Windows'],
    cheatType: 'Serverside',
    keySystem: 'Keyless',
    tags: ['Serverside'],
    features: ['Serverside'],
    sunc: null,
    description: 'Paid serverside Roblox executor with lifetime access',
    pros: ['Serverside support', 'Lifetime access'],
    cons: ['Strict TOS for cheaper access tiers', 'Limited public verification'],
    pricingOptions: ['$9.99 lifetime'],
    freeOrPaid: 'paid',
    stability: 'Unknown',
    trustLevel: 'Unknown',
    status: 'Unknown',
    officialSite: 'https://exoliner.wtf',
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
    officialSite: 'https://hydrogen.lat/',
  },
  {
    name: 'Isaeva',
    featured: false,
    platform: ['Windows'],
    cheatType: 'Internal',
    keySystem: 'Keyless',
    tags: ['Internal'],
    features: [],
    sunc: 100,
    description: 'Premium Windows executor with tiered plans that scale upward',
    pros: ['Good scaling plans'],
    cons: ['Price climbs quickly', 'Quite new'],
    pricingOptions: ['$4.99 to $44.99'],
    freeOrPaid: 'paid',
    stability: 'Unknown',
    trustLevel: 'Unknown',
    status: 'Unknown',
    officialSite: 'https://isaeva.xyz',
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
    pros: ['Dedicated Mac support', 'Has a free trial'],
    cons: ['Smaller ecosystem'],
    pricingOptions: ['$4.99 to $19.99'],
    freeOrPaid: 'paid',
    stability: 'Stable',
    trustLevel: 'Medium',
    status: 'Undetected',
    officialSite: 'https://www.raptor.fun/',
  },
  {
    name: 'Madium',
    featured: false,
    platform: ['Windows'],
    cheatType: 'Internal',
    keySystem: 'Keyless',
    tags: ['Internal', 'Warning'],
    features: ['Decompiler', 'Multi-instance'],
    sunc: null,
    description: 'New Windows internal executor with decompiler and multi-instance support',
    pros: ['Free', 'Decompiler support', 'Multi-instance support'],
    cons: ['Very new product', 'Questionable developers', 'Support reportedly spread malware recently'],
    pricingOptions: ['Free'],
    freeOrPaid: 'free',
    stability: 'Questionable',
    trustLevel: 'Low',
    status: 'Unknown',
    officialSite: 'https://discord.gg/Olemad',
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
    officialSite: 'https://discord.com/invite/matchalattewin',
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
    officialSite: '',
  },
  {
    name: 'Milkers',
    featured: false,
    platform: ['Windows'],
    cheatType: 'Internal',
    keySystem: 'Keyless',
    tags: ['Verified', 'Internal', 'Kernel'],
    features: ['Decompiler', 'Kernel', 'Multi-instance', 'RakNet', 'Hyperion emulation', 'Invite-only'],
    sunc: 100,
    description: 'Invite-only Windows executor with Hyperion emulation, RakNet support, and strong stability',
    pros: ['Hyperion emulation', 'RakNet support', 'Very stable', 'Polished execution', 'Long-running product'],
    cons: ['Invite-only access', 'Limited public availability'],
    pricingOptions: ['Free / invite-only'],
    freeOrPaid: 'free',
    stability: 'Very stable',
    trustLevel: 'High',
    status: 'Undetected',
    officialSite: 'https://milkers.best',
  },
  {
    name: 'Potassium',
    featured: true,
    platform: ['Windows'],
    cheatType: 'Internal',
    keySystem: 'Keyless',
    tags: ['Verified', 'Internal', 'Trending'],
    features: ['Decompiler', 'Kernel', 'Multi-instance', 'RakNet'],
    sunc: 100,
    description: 'Powerful Windows executor with kernel-level features and lifetime access',
    pros: ['Operating for more than a year', 'Strong execution', 'Decompiler support', 'Kernel-level features', 'RakNet support', 'Lifetime access', 'Recent update brought many customization tools'],
    cons: ['Unknown developers', 'Can have stability problems', 'Kernel-level tools may cause system issues on some setups', 'Windows 11 focused'],
    pricingOptions: ['$22.99 lifetime'],
    freeOrPaid: 'paid',
    stability: 'Stable',
    trustLevel: 'Medium',
    status: 'Undetected',
    officialSite: 'https://www.potassium.pro/',
    officialDiscord: 'discord.gg/potassium',
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
    officialSite: 'https://getronin.xyz/',
  },
  {
    name: 'Seliware',
    featured: false,
    platform: ['Windows'],
    cheatType: 'Internal',
    keySystem: 'Keyless',
    tags: ['Verified', 'Internal'],
    features: ['Decompiler', 'Multi-instance'],
    sunc: 98,
    description: 'Paid Windows executor that recently returned and is treated as risky in Voxlis data',
    pros: ['Affordable'],
    cons: ['Vulnerability concerns', 'Risky with random scripts'],
    pricingOptions: ['$3.99 weekly', '$9.99 monthly'],
    freeOrPaid: 'paid',
    stability: 'Mixed',
    trustLevel: 'Medium',
    status: 'Detection issues',
    officialSite: 'https://seliware.com/',
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
    pricingOptions: ['$8.47 monthly', '$19.99 quarterly', '$47.99 yearly'],
    freeOrPaid: 'paid',
    stability: 'Unknown',
    trustLevel: 'Unknown',
    status: 'Unknown',
    officialSite: 'https://www.serotonin.win/',
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
    officialSite: 'https://discord.com/invite/4QmWjQCgzV',
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
    pricingOptions: ['$2.80 weekly', '$9.50 monthly', '$100 lifetime'],
    freeOrPaid: 'paid',
    stability: 'Unknown',
    trustLevel: 'Unknown',
    status: 'Unknown',
    officialSite: '',
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
    officialSite: 'https://getsolara.gg/',
  },
  {
    name: 'Tomato',
    featured: false,
    platform: ['Windows'],
    cheatType: 'Internal',
    keySystem: 'Keyless',
    tags: ['Internal', 'Warning'],
    features: [],
    sunc: null,
    description: 'Windows internal executor that appears genuine but is not verified',
    pros: ['Genuine product'],
    cons: ['Not verified', 'Limited public detail'],
    pricingOptions: ['Unknown'],
    freeOrPaid: 'paid',
    stability: 'Unknown',
    trustLevel: 'Low',
    status: 'Unknown',
    officialSite: 'https://get-tomato.lol',
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
    officialSite: 'https://vegax.gg/',
  },
  {
    name: 'Velocity',
    featured: true,
    platform: ['Windows'],
    cheatType: 'Internal',
    keySystem: 'Keyless',
    tags: ['Internal'],
    features: ['Decompiler', 'Multi-instance'],
    sunc: 94,
    description: 'Free Windows executor with a reputable past and fast setup',
    pros: ['Free', 'Has a reputable past', 'Decompiler support', 'Multi-instance support'],
    cons: ['Stability issues', 'Owner recently got compromised', 'Reports of Velocity containing a RAT'],
    pricingOptions: ['Free'],
    freeOrPaid: 'free',
    stability: 'Mixed',
    trustLevel: 'Low',
    status: 'Unknown',
    officialSite: 'https://realvelocity.xyz',
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
    cons: ['Not top-tier', 'Some say it\'s a scam'],
    pricingOptions: ['$5.99 weekly', '$19.99 monthly'],
    freeOrPaid: 'paid',
    stability: 'Stable',
    trustLevel: 'High',
    status: 'Undetected',
    officialSite: 'https://volcano.wtf/',
  },
  {
    name: 'Volt',
    featured: false,
    platform: ['Windows'],
    cheatType: 'Internal',
    keySystem: 'Keyless',
    tags: ['Internal'],
    features: ['Multi-instance', 'RakNet'],
    sunc: 98,
    description: 'High-end Windows executor with easy setup, strong usability, and a complicated project background',
    pros: ['Easy UI and installation', 'Hyperion emulation', 'Strong execution'],
    cons: ['Complicated background history', 'Past detection and ownership concerns'],
    pricingOptions: ['$5.99 weekly', '$19.99 monthly', '$49.99 quarterly'],
    freeOrPaid: 'paid',
    stability: 'Unknown',
    trustLevel: 'Low',
    status: 'Unknown',
    officialSite: 'https://volt.bz/',
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
    cons: ['Controversial project history', 'Recent ownership changes and internal conflicts'],
    pricingOptions: ['$2.49 daily', '$5.99 weekly', '$18.99 monthly', '$39.99 quarterly'],
    freeOrPaid: 'paid',
    stability: 'Stable',
    trustLevel: 'Low',
    status: 'Undetected',
    officialSite: 'https://getwave.gg/',
  },
  {
    name: 'Xeno',
    featured: true,
    platform: ['Windows'],
    cheatType: 'Internal',
    keySystem: 'Keyless',
    tags: ['Internal'],
    features: ['Decompiler', 'Multi-instance'],
    sunc: 33,
    description: 'Free Windows executor that runs on many systems but has limited execution power',
    pros: ['Free', 'Runs on almost any device', 'Compact and beginner friendly', 'Decompiler support', 'Multi-instance support'],
    cons: ['Low sUNC score', 'Vulnerable', 'Risky when using public scripts'],
    pricingOptions: ['Free'],
    freeOrPaid: 'free',
    stability: 'Stable',
    trustLevel: 'Medium',
    status: 'Undetected',
    officialSite: 'https://www.xeno.now/',
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
    officialSite: '',
  },
  {
    name: 'YuB-X',
    featured: false,
    platform: ['Windows'],
    cheatType: 'Internal',
    keySystem: 'Keyed',
    tags: ['Internal'],
    features: ['Decompiler', 'Multi-instance', 'RakNet', 'Freemium'],
    sunc: null,
    description: 'Freemium Windows executor with decompiler, multi-instance, and RakNet support',
    pros: ['Freemium access', 'Decompiler support', 'Multi-instance support', 'RakNet support'],
    cons: ['Key system required', 'Not verified'],
    pricingOptions: ['Free / freemium'],
    freeOrPaid: 'free',
    stability: 'Unknown',
    trustLevel: 'Medium',
    status: 'Unknown',
    officialSite: 'https://yub-x.net/',
  }
];

const EXPLOIT_ASSISTANT_API = 'https://xyres-ai-api.vercel.app/api/exploit-assistant';
const DODGE_STORAGE_KEYS = ['xyrex_dodge_save_v2', 'xyrex_dodge_save_v1'];
const FREE_DAILY_AI_TOKENS = 5;
const NO_ASSISTANT_TOKENS_MESSAGE = 'You have no AI tokens remaining. Daily tokens reset at midnight, or you can buy more in the Token Shop.';

const FREE_TOKEN_SHOP = Object.freeze({
  minClaim: 1,
  maxClaim: 30,
  baseCooldownMinutes: 2,
  perTokenCooldownMinutes: 2
});

function clampTokenClaimAmount(value) {
  if (!Number.isFinite(value)) return FREE_TOKEN_SHOP.minClaim;
  return Math.min(FREE_TOKEN_SHOP.maxClaim, Math.max(FREE_TOKEN_SHOP.minClaim, Math.trunc(value)));
}

function getFreeTokenCooldownMs(amount) {
  const safeAmount = clampTokenClaimAmount(amount);
  const totalMinutes = FREE_TOKEN_SHOP.baseCooldownMinutes + (safeAmount * FREE_TOKEN_SHOP.perTokenCooldownMinutes);
  return totalMinutes * 60 * 1000;
}

function formatDuration(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
  return `${minutes}m ${String(seconds).padStart(2, '0')}s`;
}

const NO_OFFICIAL_DISCORD_MESSAGE = 'This script does not have an official discord server';
const POPULAR_SCRIPT_CATEGORIES = [
  'Bedwars',
  'Universal',
  'Grace',
  'Pressure',
  'Doors',
  'Steal a Brainrot',
  'Adopt Me',
  'Brookhaven RP',
  'Blox Fruits',
  'Slime RNG',
  'Kick a Lucky Block',
  '99 Nights in the Forest'
];

const scriptsHubData = {
  smartRankingLabels: {
    bestFree: 'Best Free',
    safest: 'Safest Right Now',
    beginners: 'Best for Beginners',
    powerful: 'Most Powerful'
  },

  popularScripts: [
    {
      name: 'Voidware Rewrite',
      category: 'Bedwars',
      description: 'The most popular Roblox Bedwars script',
      script: 'loadstring(game:HttpGet("https://raw.githubusercontent.com/VapeVoidware/VWRewrite/master/NewMainScript.lua", true))()',
      stats: {
        price: 'Free and Paid',
        keySystem: 'Keyless',
        suncRequired: '80%+',
        bestExecutor: 'Any compatible executor',
        stability: 'Stable',
        buggy: false,
        status: 'Working',
        platform: ['PC', 'Mobile'],
        discord: 'https://discord.gg/voidware',
        discordIcon: true
      }
    },
    {
      name: 'Infinite Yield',
      category: 'Universal',
      description: 'Widely used utility command script for many Roblox experiences',
      script: 'loadstring(game:HttpGet("https://raw.githubusercontent.com/EdgeIY/infiniteyield/master/source"))()',
      stats: {
        price: 'Free',
        keySystem: 'Keyless',
        suncRequired: 'Any %',
        bestExecutor: 'Any compatible executor',
        stability: 'Stable',
        buggy: false,
        status: 'Working',
        platform: ['PC', 'Mobile'],
        discord: '...',
        discordIcon: false
      }
    },
    {
      name: 'Dark Dex Explorer',
      category: 'Universal',
      description: 'Object explorer utility script for inspection and debugging workflows',
      script: 'loadstring(game:HttpGet("https://raw.githubusercontent.com/peyton2465/Dex/master/out.lua"))()',
      stats: {
        price: 'Free',
        keySystem: 'Keyless',
        suncRequired: 'Any %',
        bestExecutor: 'Any compatible executor',
        stability: 'Stable',
        buggy: false,
        status: 'Working',
        platform: ['PC', 'Mobile'],
        discord: '...',
        discordIcon: false
      }
    },
    {
      name: 'KiciaHook',
      category: 'Rivals',
      description: 'Roblox script loader for KiciaHook',
      script: 'loadstring(game:HttpGet("https://raw.githubusercontent.com/kiciahook/kiciahook/refs/heads/main/loader.luau"))()',
      stats: {
        price: 'Free',
        keySystem: 'Keyed',
        suncRequired: '90%+',
        bestExecutor: 'Any compatible executor',
        stability: 'Stable',
        buggy: false,
        status: 'Working',
        platform: ['PC', 'Mobile'],
        discord: '...',
        discordIcon: false
      }
    },
    {
      name: 'Unnamed Enhancements',
      category: 'Rivals',
      description: 'Paid script for rivals, da-hood, and wild-west. Script is paid-only so you must pay to get the script',
      script: 'PURCHASE FROM DISCORD',
      stats: {
        price: 'Paid ($14.99)',
        keySystem: 'Keyed',
        suncRequired: '99%+',
        bestExecutor: 'Volt / Potassium',
        stability: 'Stable',
        buggy: false,
        status: 'Working',
        platform: ['PC', 'Mobile'],
        discord: '...',
        discordIcon: false
      }
    },
      {
      name: 'CatVape',
      category: 'Bedwars',
      description: 'A popular Roblox Bedwars script',
      script: "loadstring(game:HttpGet('https://raw.githubusercontent.com/MaxlaserTech/CatV6/main/init.lua'), 'init.lua')({})",
      stats: {
        price: 'Free',
        keySystem: 'Keyless',
        suncRequired: '80%+',
        bestExecutor: 'Any compatible executor',
        stability: 'Stable',
        buggy: false,
        status: 'Working',
        platform: ['PC', 'Mobile'],
        discord: '...',
        discordIcon: false
      }
    },

    {
      name: 'Aero V4',
      category: 'Bedwars',
      description: 'Aero V4. A private, invite-only Bedwars script',
      script: 'loadstring(game:HttpGet("https://raw.githubusercontent.com/poopparty/poopparty/main/NewMainScript.lua", true))()',
      stats: {
        price: 'Free',
        keySystem: 'Keyless',
        suncRequired: '90%+',
        bestExecutor: 'Any compatible executor',
        stability: 'Stable',
        buggy: false,
        status: 'Working',
        platform: ['PC', 'Mobile'],
        discord: '...',
        discordIcon: false
      }
    },

    // Bedwars placeholders

    /*
    {
      name: '...',
      category: 'Bedwars',
      description: '...',
      script: {
      stats: {
        price: '...',
        keySystem: '...',
        suncRequired: '...',
        bestExecutor: '...r',
        stability: '...',
        buggy: ...,
        status: '...',
        platform: [...],
        discord: '...',
        discordIcon: false
      }
    },
    */

    /*
    {
      name: '...',
      category: 'Bedwars',
      description: '...',
      script: {
      stats: {
        price: '...',
        keySystem: '...',
        suncRequired: '...',
        bestExecutor: '...r',
        stability: '...',
        buggy: ...,
        status: '...',
        platform: [...],
        discord: '...',
        discordIcon: false
      }
    },
    */

    /*
    {
      name: '...',
      category: 'Bedwars',
      description: '...',
      script: {
      stats: {
        price: '...',
        keySystem: '...',
        suncRequired: '...',
        bestExecutor: '...r',
        stability: '...',
        buggy: ...,
        status: '...',
        platform: [...],
        discord: '...',
        discordIcon: false
      }
    },
    */

    /*
    {
      name: '...',
      category: 'Bedwars',
      description: '...',
      script: {
      stats: {
        price: '...',
        keySystem: '...',
        suncRequired: '...',
        bestExecutor: '...r',
        stability: '...',
        buggy: ...,
        status: '...',
        platform: [...],
        discord: '...',
        discordIcon: false
      }
    },
    */

    /*
    {
      name: '...',
      category: 'Bedwars',
      description: '...',
      script: {
      stats: {
        price: '...',
        keySystem: '...',
        suncRequired: '...',
        bestExecutor: '...r',
        stability: '...',
        buggy: ...,
        status: '...',
        platform: [...],
        discord: '...',
        discordIcon: false
      }
    },
    */

    // Universal placeholders

    /*
    {
      name: '...',
      category: 'Universal',
      description: '...',
      script: {
      stats: {
        price: '...',
        keySystem: '...',
        suncRequired: '...',
        bestExecutor: '...r',
        stability: '...',
        buggy: ...,
        status: '...',
        platform: [...],
        discord: '...',
        discordIcon: false
      }
    },
    */

    /*
    {
      name: '...',
      category: 'Universal',
      description: '...',
      script: {
      stats: {
        price: '...',
        keySystem: '...',
        suncRequired: '...',
        bestExecutor: '...r',
        stability: '...',
        buggy: ...,
        status: '...',
        platform: [...],
        discord: '...',
        discordIcon: false
      }
    },
    */

    /*
    {
      name: '...',
      category: 'Universal',
      description: '...',
      script: {
      stats: {
        price: '...',
        keySystem: '...',
        suncRequired: '...',
        bestExecutor: '...r',
        stability: '...',
        buggy: ...,
        status: '...',
        platform: [...],
        discord: '...',
        discordIcon: false
      }
    },
    */

    /*
    {
      name: '...',
      category: 'Universal',
      description: '...',
      script: {
      stats: {
        price: '...',
        keySystem: '...',
        suncRequired: '...',
        bestExecutor: '...r',
        stability: '...',
        buggy: ...,
        status: '...',
        platform: [...],
        discord: '...',
        discordIcon: false
      }
    },
    */

    /*
    {
      name: '...',
      category: 'Universal',
      description: '...',
      script: {
      stats: {
        price: '...',
        keySystem: '...',
        suncRequired: '...',
        bestExecutor: '...r',
        stability: '...',
        buggy: ...,
        status: '...',
        platform: [...],
        discord: '...',
        discordIcon: false
      }
    },
    */

    // Rivals placeholders

    /*
    {
      name: '...',
      category: 'Rivals',
      description: '...',
      script: {
      stats: {
        price: '...',
        keySystem: '...',
        suncRequired: '...',
        bestExecutor: '...r',
        stability: '...',
        buggy: ...,
        status: '...',
        platform: [...],
        discord: '...',
        discordIcon: false
      }
    },
    */

    /*
    {
      name: '...',
      category: 'Rivals',
      description: '...',
      script: {
      stats: {
        price: '...',
        keySystem: '...',
        suncRequired: '...',
        bestExecutor: '...r',
        stability: '...',
        buggy: ...,
        status: '...',
        platform: [...],
        discord: '...',
        discordIcon: false
      }
    },
    */

    /*
    {
      name: '...',
      category: 'Rivals',
      description: '...',
      script: {
      stats: {
        price: '...',
        keySystem: '...',
        suncRequired: '...',
        bestExecutor: '...r',
        stability: '...',
        buggy: ...,
        status: '...',
        platform: [...],
        discord: '...',
        discordIcon: false
      }
    },
    */

    /*
    {
      name: '...',
      category: 'Rivals',
      description: '...',
      script: {
      stats: {
        price: '...',
        keySystem: '...',
        suncRequired: '...',
        bestExecutor: '...r',
        stability: '...',
        buggy: ...,
        status: '...',
        platform: [...],
        discord: '...',
        discordIcon: false
      }
    },
    */

    /*
    {
      name: '...',
      category: 'Rivals',
      description: '...',
      script: {
      stats: {
        price: '...',
        keySystem: '...',
        suncRequired: '...',
        bestExecutor: '...r',
        stability: '...',
        buggy: ...,
        status: '...',
        platform: [...],
        discord: '...',
        discordIcon: false
      }
    },
    */

    // Grace placeholders

    /*
    {
      name: '...',
      category: 'Grace',
      description: '...',
      script: {
      stats: {
        price: '...',
        keySystem: '...',
        suncRequired: '...',
        bestExecutor: '...r',
        stability: '...',
        buggy: ...,
        status: '...',
        platform: [...],
        discord: '...',
        discordIcon: false
      }
    },
    */

    /*
    {
      name: '...',
      category: 'Grace',
      description: '...',
      script: {
      stats: {
        price: '...',
        keySystem: '...',
        suncRequired: '...',
        bestExecutor: '...r',
        stability: '...',
        buggy: ...,
        status: '...',
        platform: [...],
        discord: '...',
        discordIcon: false
      }
    },
    */

    /*
    {
      name: '...',
      category: 'Grace',
      description: '...',
      script: {
      stats: {
        price: '...',
        keySystem: '...',
        suncRequired: '...',
        bestExecutor: '...r',
        stability: '...',
        buggy: ...,
        status: '...',
        platform: [...],
        discord: '...',
        discordIcon: false
      }
    },
    */

    /*
    {
      name: '...',
      category: 'Grace',
      description: '...',
      script: {
      stats: {
        price: '...',
        keySystem: '...',
        suncRequired: '...',
        bestExecutor: '...r',
        stability: '...',
        buggy: ...,
        status: '...',
        platform: [...],
        discord: '...',
        discordIcon: false
      }
    },
    */

    /*
    {
      name: '...',
      category: 'Grace',
      description: '...',
      script: {
      stats: {
        price: '...',
        keySystem: '...',
        suncRequired: '...',
        bestExecutor: '...r',
        stability: '...',
        buggy: ...,
        status: '...',
        platform: [...],
        discord: '...',
        discordIcon: false
      }
    },
    */

    // Pressure placeholders

    /*
    {
      name: '...',
      category: 'Pressure',
      description: '...',
      script: {
      stats: {
        price: '...',
        keySystem: '...',
        suncRequired: '...',
        bestExecutor: '...r',
        stability: '...',
        buggy: ...,
        status: '...',
        platform: [...],
        discord: '...',
        discordIcon: false
      }
    },
    */

    /*
    {
      name: '...',
      category: 'Pressure',
      description: '...',
      script: {
      stats: {
        price: '...',
        keySystem: '...',
        suncRequired: '...',
        bestExecutor: '...r',
        stability: '...',
        buggy: ...,
        status: '...',
        platform: [...],
        discord: '...',
        discordIcon: false
      }
    },
    */

    /*
    {
      name: '...',
      category: 'Pressure',
      description: '...',
      script: {
      stats: {
        price: '...',
        keySystem: '...',
        suncRequired: '...',
        bestExecutor: '...r',
        stability: '...',
        buggy: ...,
        status: '...',
        platform: [...],
        discord: '...',
        discordIcon: false
      }
    },
    */

    /*
    {
      name: '...',
      category: 'Pressure',
      description: '...',
      script: {
      stats: {
        price: '...',
        keySystem: '...',
        suncRequired: '...',
        bestExecutor: '...r',
        stability: '...',
        buggy: ...,
        status: '...',
        platform: [...],
        discord: '...',
        discordIcon: false
      }
    },
    */

    /*
    {
      name: '...',
      category: 'Pressure',
      description: '...',
      script: {
      stats: {
        price: '...',
        keySystem: '...',
        suncRequired: '...',
        bestExecutor: '...r',
        stability: '...',
        buggy: ...,
        status: '...',
        platform: [...],
        discord: '...',
        discordIcon: false
      }
    },
    */

    // Doors placeholders

    /*
    {
      name: '...',
      category: 'Doors',
      description: '...',
      script: {
      stats: {
        price: '...',
        keySystem: '...',
        suncRequired: '...',
        bestExecutor: '...r',
        stability: '...',
        buggy: ...,
        status: '...',
        platform: [...],
        discord: '...',
        discordIcon: false
      }
    },
    */

    /*
    {
      name: '...',
      category: 'Doors',
      description: '...',
      script: {
      stats: {
        price: '...',
        keySystem: '...',
        suncRequired: '...',
        bestExecutor: '...r',
        stability: '...',
        buggy: ...,
        status: '...',
        platform: [...],
        discord: '...',
        discordIcon: false
      }
    },
    */

    /*
    {
      name: '...',
      category: 'Doors',
      description: '...',
      script: {
      stats: {
        price: '...',
        keySystem: '...',
        suncRequired: '...',
        bestExecutor: '...r',
        stability: '...',
        buggy: ...,
        status: '...',
        platform: [...],
        discord: '...',
        discordIcon: false
      }
    },
    */

    /*
    {
      name: '...',
      category: 'Doors',
      description: '...',
      script: {
      stats: {
        price: '...',
        keySystem: '...',
        suncRequired: '...',
        bestExecutor: '...r',
        stability: '...',
        buggy: ...,
        status: '...',
        platform: [...],
        discord: '...',
        discordIcon: false
      }
    },
    */

    /*
    {
      name: '...',
      category: 'Doors',
      description: '...',
      script: {
      stats: {
        price: '...',
        keySystem: '...',
        suncRequired: '...',
        bestExecutor: '...r',
        stability: '...',
        buggy: ...,
        status: '...',
        platform: [...],
        discord: '...',
        discordIcon: false
      }
    },
    */

    // Steal a Brainrot placeholders

    /*
    {
      name: '...',
      category: 'Steal a Brainrot',
      description: '...',
      script: {
      stats: {
        price: '...',
        keySystem: '...',
        suncRequired: '...',
        bestExecutor: '...r',
        stability: '...',
        buggy: ...,
        status: '...',
        platform: [...],
        discord: '...',
        discordIcon: false
      }
    },
    */

    /*
    {
      name: '...',
      category: 'Steal a Brainrot',
      description: '...',
      script: {
      stats: {
        price: '...',
        keySystem: '...',
        suncRequired: '...',
        bestExecutor: '...r',
        stability: '...',
        buggy: ...,
        status: '...',
        platform: [...],
        discord: '...',
        discordIcon: false
      }
    },
    */

    /*
    {
      name: '...',
      category: 'Steal a Brainrot',
      description: '...',
      script: {
      stats: {
        price: '...',
        keySystem: '...',
        suncRequired: '...',
        bestExecutor: '...r',
        stability: '...',
        buggy: ...,
        status: '...',
        platform: [...],
        discord: '...',
        discordIcon: false
      }
    },
    */

    /*
    {
      name: '...',
      category: 'Steal a Brainrot',
      description: '...',
      script: {
      stats: {
        price: '...',
        keySystem: '...',
        suncRequired: '...',
        bestExecutor: '...r',
        stability: '...',
        buggy: ...,
        status: '...',
        platform: [...],
        discord: '...',
        discordIcon: false
      }
    },
    */

    /*
    {
      name: '...',
      category: 'Steal a Brainrot',
      description: '...',
      script: {
      stats: {
        price: '...',
        keySystem: '...',
        suncRequired: '...',
        bestExecutor: '...r',
        stability: '...',
        buggy: ...,
        status: '...',
        platform: [...],
        discord: '...',
        discordIcon: false
      }
    },
    */

    // Adopt Me placeholders

    /*
    {
      name: '...',
      category: 'Adopt Me',
      description: '...',
      script: {
      stats: {
        price: '...',
        keySystem: '...',
        suncRequired: '...',
        bestExecutor: '...r',
        stability: '...',
        buggy: ...,
        status: '...',
        platform: [...],
        discord: '...',
        discordIcon: false
      }
    },
    */

    /*
    {
      name: '...',
      category: 'Adopt Me',
      description: '...',
      script: {
      stats: {
        price: '...',
        keySystem: '...',
        suncRequired: '...',
        bestExecutor: '...r',
        stability: '...',
        buggy: ...,
        status: '...',
        platform: [...],
        discord: '...',
        discordIcon: false
      }
    },
    */

    /*
    {
      name: '...',
      category: 'Adopt Me',
      description: '...',
      script: {
      stats: {
        price: '...',
        keySystem: '...',
        suncRequired: '...',
        bestExecutor: '...r',
        stability: '...',
        buggy: ...,
        status: '...',
        platform: [...],
        discord: '...',
        discordIcon: false
      }
    },
    */

    /*
    {
      name: '...',
      category: 'Adopt Me',
      description: '...',
      script: {
      stats: {
        price: '...',
        keySystem: '...',
        suncRequired: '...',
        bestExecutor: '...r',
        stability: '...',
        buggy: ...,
        status: '...',
        platform: [...],
        discord: '...',
        discordIcon: false
      }
    },
    */

    /*
    {
      name: '...',
      category: 'Adopt Me',
      description: '...',
      script: {
      stats: {
        price: '...',
        keySystem: '...',
        suncRequired: '...',
        bestExecutor: '...r',
        stability: '...',
        buggy: ...,
        status: '...',
        platform: [...],
        discord: '...',
        discordIcon: false
      }
    },
    */

    // Brookhaven RP placeholders

    /*
    {
      name: '...',
      category: 'Brookhaven RP',
      description: '...',
      script: {
      stats: {
        price: '...',
        keySystem: '...',
        suncRequired: '...',
        bestExecutor: '...r',
        stability: '...',
        buggy: ...,
        status: '...',
        platform: [...],
        discord: '...',
        discordIcon: false
      }
    },
    */

    /*
    {
      name: '...',
      category: 'Brookhaven RP',
      description: '...',
      script: {
      stats: {
        price: '...',
        keySystem: '...',
        suncRequired: '...',
        bestExecutor: '...r',
        stability: '...',
        buggy: ...,
        status: '...',
        platform: [...],
        discord: '...',
        discordIcon: false
      }
    },
    */

    /*
    {
      name: '...',
      category: 'Brookhaven RP',
      description: '...',
      script: {
      stats: {
        price: '...',
        keySystem: '...',
        suncRequired: '...',
        bestExecutor: '...r',
        stability: '...',
        buggy: ...,
        status: '...',
        platform: [...],
        discord: '...',
        discordIcon: false
      }
    },
    */

    /*
    {
      name: '...',
      category: 'Brookhaven RP',
      description: '...',
      script: {
      stats: {
        price: '...',
        keySystem: '...',
        suncRequired: '...',
        bestExecutor: '...r',
        stability: '...',
        buggy: ...,
        status: '...',
        platform: [...],
        discord: '...',
        discordIcon: false
      }
    },
    */

    /*
    {
      name: '...',
      category: 'Brookhaven RP',
      description: '...',
      script: {
      stats: {
        price: '...',
        keySystem: '...',
        suncRequired: '...',
        bestExecutor: '...r',
        stability: '...',
        buggy: ...,
        status: '...',
        platform: [...],
        discord: '...',
        discordIcon: false
      }
    },
    */

    // Blox Fruits placeholders

    /*
    {
      name: '...',
      category: 'Blox Fruits',
      description: '...',
      script: {
      stats: {
        price: '...',
        keySystem: '...',
        suncRequired: '...',
        bestExecutor: '...r',
        stability: '...',
        buggy: ...,
        status: '...',
        platform: [...],
        discord: '...',
        discordIcon: false
      }
    },
    */

    /*
    {
      name: '...',
      category: 'Blox Fruits',
      description: '...',
      script: {
      stats: {
        price: '...',
        keySystem: '...',
        suncRequired: '...',
        bestExecutor: '...r',
        stability: '...',
        buggy: ...,
        status: '...',
        platform: [...],
        discord: '...',
        discordIcon: false
      }
    },
    */

    /*
    {
      name: '...',
      category: 'Blox Fruits',
      description: '...',
      script: {
      stats: {
        price: '...',
        keySystem: '...',
        suncRequired: '...',
        bestExecutor: '...r',
        stability: '...',
        buggy: ...,
        status: '...',
        platform: [...],
        discord: '...',
        discordIcon: false
      }
    },
    */

    /*
    {
      name: '...',
      category: 'Blox Fruits',
      description: '...',
      script: {
      stats: {
        price: '...',
        keySystem: '...',
        suncRequired: '...',
        bestExecutor: '...r',
        stability: '...',
        buggy: ...,
        status: '...',
        platform: [...],
        discord: '...',
        discordIcon: false
      }
    },
    */

    /*
    {
      name: '...',
      category: 'Blox Fruits',
      description: '...',
      script: {
      stats: {
        price: '...',
        keySystem: '...',
        suncRequired: '...',
        bestExecutor: '...r',
        stability: '...',
        buggy: ...,
        status: '...',
        platform: [...],
        discord: '...',
        discordIcon: false
      }
    },
    */

    // Slime RNG placeholders

    /*
    {
      name: '...',
      category: 'Slime RNG',
      description: '...',
      script: {
      stats: {
        price: '...',
        keySystem: '...',
        suncRequired: '...',
        bestExecutor: '...r',
        stability: '...',
        buggy: ...,
        status: '...',
        platform: [...],
        discord: '...',
        discordIcon: false
      }
    },
    */

    /*
    {
      name: '...',
      category: 'Slime RNG',
      description: '...',
      script: {
      stats: {
        price: '...',
        keySystem: '...',
        suncRequired: '...',
        bestExecutor: '...r',
        stability: '...',
        buggy: ...,
        status: '...',
        platform: [...],
        discord: '...',
        discordIcon: false
      }
    },
    */

    /*
    {
      name: '...',
      category: 'Slime RNG',
      description: '...',
      script: {
      stats: {
        price: '...',
        keySystem: '...',
        suncRequired: '...',
        bestExecutor: '...r',
        stability: '...',
        buggy: ...,
        status: '...',
        platform: [...],
        discord: '...',
        discordIcon: false
      }
    },
    */

    /*
    {
      name: '...',
      category: 'Slime RNG',
      description: '...',
      script: {
      stats: {
        price: '...',
        keySystem: '...',
        suncRequired: '...',
        bestExecutor: '...r',
        stability: '...',
        buggy: ...,
        status: '...',
        platform: [...],
        discord: '...',
        discordIcon: false
      }
    },
    */

    /*
    {
      name: '...',
      category: 'Slime RNG',
      description: '...',
      script: {
      stats: {
        price: '...',
        keySystem: '...',
        suncRequired: '...',
        bestExecutor: '...r',
        stability: '...',
        buggy: ...,
        status: '...',
        platform: [...],
        discord: '...',
        discordIcon: false
      }
    },
    */

    // Kick a Lucky Block placeholders

    /*
    {
      name: '...',
      category: 'Kick a Lucky Block',
      description: '...',
      script: {
      stats: {
        price: '...',
        keySystem: '...',
        suncRequired: '...',
        bestExecutor: '...r',
        stability: '...',
        buggy: ...,
        status: '...',
        platform: [...],
        discord: '...',
        discordIcon: false
      }
    },
    */

    /*
    {
      name: '...',
      category: 'Kick a Lucky Block',
      description: '...',
      script: {
      stats: {
        price: '...',
        keySystem: '...',
        suncRequired: '...',
        bestExecutor: '...r',
        stability: '...',
        buggy: ...,
        status: '...',
        platform: [...],
        discord: '...',
        discordIcon: false
      }
    },
    */

    /*
    {
      name: '...',
      category: 'Kick a Lucky Block',
      description: '...',
      script: {
      stats: {
        price: '...',
        keySystem: '...',
        suncRequired: '...',
        bestExecutor: '...r',
        stability: '...',
        buggy: ...,
        status: '...',
        platform: [...],
        discord: '...',
        discordIcon: false
      }
    },
    */

    /*
    {
      name: '...',
      category: 'Kick a Lucky Block',
      description: '...',
      script: {
      stats: {
        price: '...',
        keySystem: '...',
        suncRequired: '...',
        bestExecutor: '...r',
        stability: '...',
        buggy: ...,
        status: '...',
        platform: [...],
        discord: '...',
        discordIcon: false
      }
    },
    */

    /*
    {
      name: '...',
      category: 'Kick a Lucky Block',
      description: '...',
      script: {
      stats: {
        price: '...',
        keySystem: '...',
        suncRequired: '...',
        bestExecutor: '...r',
        stability: '...',
        buggy: ...,
        status: '...',
        platform: [...],
        discord: '...',
        discordIcon: false
      }
    },
    */

    // 99 Nights in the Forest placeholders

    /*
    {
      name: '...',
      category: '99 Nights in the Forest',
      description: '...',
      script: {
      stats: {
        price: '...',
        keySystem: '...',
        suncRequired: '...',
        bestExecutor: '...r',
        stability: '...',
        buggy: ...,
        status: '...',
        platform: [...],
        discord: '...',
        discordIcon: false
      }
    },
    */

    /*
    {
      name: '...',
      category: '99 Nights in the Forest',
      description: '...',
      script: {
      stats: {
        price: '...',
        keySystem: '...',
        suncRequired: '...',
        bestExecutor: '...r',
        stability: '...',
        buggy: ...,
        status: '...',
        platform: [...],
        discord: '...',
        discordIcon: false
      }
    },
    */

    /*
    {
      name: '...',
      category: '99 Nights in the Forest',
      description: '...',
      script: {
      stats: {
        price: '...',
        keySystem: '...',
        suncRequired: '...',
        bestExecutor: '...r',
        stability: '...',
        buggy: ...,
        status: '...',
        platform: [...],
        discord: '...',
        discordIcon: false
      }
    },
    */

    /*
    {
      name: '...',
      category: '99 Nights in the Forest',
      description: '...',
      script: {
      stats: {
        price: '...',
        keySystem: '...',
        suncRequired: '...',
        bestExecutor: '...r',
        stability: '...',
        buggy: ...,
        status: '...',
        platform: [...],
        discord: '...',
        discordIcon: false
      }
    },
    */

    /*
    {
      name: '...',
      category: '99 Nights in the Forest',
      description: '...',
      script: {
      stats: {
        price: '...',
        keySystem: '...',
        suncRequired: '...',
        bestExecutor: '...r',
        stability: '...',
        buggy: ...,
        status: '...',
        platform: [...],
        discord: '...',
        discordIcon: false
      }
    },
    */

  ],

  recentChanges: [
    'For the latest changes, updates, and bug fixes, join the official Xyrex Discord server'
  ]
};


const XYREX_OFFICIAL_DISCORD_URL = 'https://discord.gg/6X8cyjUcAj';

const discordWordmarkSvg = '<svg viewBox="0 0 127.14 96.36" aria-hidden="true" focusable="false"><path fill="currentColor" d="M107.7 8.07A105.15 105.15 0 0081.47 0a72.06 72.06 0 00-3.36 6.83 97.68 97.68 0 00-29.94 0A72.37 72.37 0 0044.8 0 105.89 105.89 0 0018.57 8.08C1.03 34.37-3.72 60 1.39 85.28A105.73 105.73 0 0033.32 96a77.7 77.7 0 006.84-11.16 68.42 68.42 0 01-10.78-5.15c.91-.67 1.8-1.37 2.66-2.09a75.57 75.57 0 0063.48 0c.87.72 1.76 1.42 2.67 2.09a68.68 68.68 0 01-10.8 5.16A77.53 77.53 0 0094.24 96a105.25 105.25 0 0031.91-10.72c6-29.3-1-54.68-18.45-77.21zM42.45 65.69c-6.23 0-11.33-5.69-11.33-12.69s5-12.7 11.33-12.7S53.78 46 53.78 53s-5.03 12.69-11.33 12.69zm42.24 0c-6.23 0-11.33-5.69-11.33-12.69s5-12.7 11.33-12.7S96.02 46 96.02 53s-5.03 12.69-11.33 12.69z"/></svg>';

const popularScriptFileSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" aria-hidden="true" focusable="false"><path fill="currentColor" d="M288 64C252.7 64 224 92.7 224 128L224 384C224 419.3 252.7 448 288 448L480 448C515.3 448 544 419.3 544 384L544 183.4C544 166 536.9 149.3 524.3 137.2L466.6 81.8C454.7 70.4 438.8 64 422.3 64L288 64zM160 192C124.7 192 96 220.7 96 256L96 512C96 547.3 124.7 576 160 576L352 576C387.3 576 416 547.3 416 512L416 496L352 496L352 512L160 512L160 256L176 256L176 192L160 192z"/></svg>';
const popularScriptCopySvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" aria-hidden="true" focusable="false"><path fill="currentColor" d="M288 64C252.7 64 224 92.7 224 128L224 384C224 419.3 252.7 448 288 448L480 448C515.3 448 544 419.3 544 384L544 183.4C544 166 536.9 149.3 524.3 137.2L466.6 81.8C454.7 70.4 438.8 64 422.3 64L288 64zM160 192C124.7 192 96 220.7 96 256L96 512C96 547.3 124.7 576 160 576L352 576C387.3 576 416 547.3 416 512L416 496L352 496L352 512L160 512L160 256L176 256L176 192L160 192z"/></svg>';
const popularScriptDiscordSvg = '<svg viewBox="0 0 127.14 96.36" aria-hidden="true" focusable="false"><path fill="currentColor" d="M107.7 8.07A105.15 105.15 0 0081.47 0a72.06 72.06 0 00-3.36 6.83 97.68 97.68 0 00-29.94 0A72.37 72.37 0 0044.8 0 105.89 105.89 0 0018.57 8.08C1.03 34.37-3.72 60 1.39 85.28A105.73 105.73 0 0033.32 96a77.7 77.7 0 006.84-11.16 68.42 68.42 0 01-10.78-5.15c.91-.67 1.8-1.37 2.66-2.09a75.57 75.57 0 0063.48 0c.87.72 1.76 1.42 2.67 2.09a68.68 68.68 0 01-10.8 5.16A77.53 77.53 0 0094.24 96a105.25 105.25 0 0031.91-10.72c6-29.3-1-54.68-18.45-77.21zM42.45 65.69c-6.23 0-11.33-5.69-11.33-12.69s5-12.7 11.33-12.7S53.78 46 53.78 53s-5.03 12.69-11.33 12.69zm42.24 0c-6.23 0-11.33-5.69-11.33-12.69s5-12.7 11.33-12.7S96.02 46 96.02 53s-5.03 12.69-11.33 12.69z"/></svg>';

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

const trustRiskMap = { High: 2, Medium: 5, Low: 8, Unknown: 7 };
const stabilityScoreMap = { Stable: 9, High: 8, Mixed: 6, Basic: 4, Unstable: 3, Unknown: 4 };
let lastModalTrigger = null;


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

function buildExpandedExecutorDescription(product) {
  const platformText = Array.isArray(product.platform) && product.platform.length ? product.platform.join(', ') : 'Unknown platforms';
  const featureText = Array.isArray(product.features) && product.features.length ? product.features.join(', ') : 'No standout features listed';
  const priceText = Array.isArray(product.pricingOptions) && product.pricingOptions.length ? product.pricingOptions.join(', ') : getPriceLabel(product);
  return `${stripTrailingPeriod(product.description)}. It targets ${platformText}, includes ${featureText.toLowerCase()}, and is offered through ${priceText}.`;
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
  card.dataset.platform = (product.platform || []).join(', ');
  card.dataset.keySystem = product.keySystem || '';
  card.dataset.tags = (product.tags || []).join(', ');
  card.dataset.execution = Number.isFinite(product.sunc) ? (product.sunc >= 95 ? 'High' : product.sunc >= 80 ? 'Medium' : 'Low') : 'Unknown';

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
  sunc.title = 'Click to check an sUNC';
  sunc.addEventListener('click', () => openSuncSimulationModal(product));

  right.appendChild(sunc);
  right.appendChild(createTagSymbols(product));

  header.appendChild(left);
  header.appendChild(right);

  const summary = document.createElement('p');
  summary.className = 'summary';
  summary.textContent = buildExpandedExecutorDescription(product);

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
    if (active.platform?.length && !active.platform.some(platform => (prod.platform || []).includes(platform))) return false;
    if (active.tags?.length && !active.tags.every(tag => [...(prod.tags || []), ...(prod.features || [])].includes(tag))) return false;
    if (active.cheatType?.length && !active.cheatType.includes(prod.cheatType)) return false;
    if (active.keySystem?.length && !active.keySystem.includes(prod.keySystem)) return false;
    if (!isPriceMatch(prod, priceControls)) return false;
    return true;
  });

  renderProducts(filtered);
}

function setCompactModal(isCompact) {
  const modal = qs('#modalOverlay')?.querySelector('.modal');
  if (!modal) return;
  modal.classList.toggle('modal-compact', Boolean(isCompact));
}

function openModal(product) {
  const overlay = qs('#modalOverlay');
  const content = qs('#modalContent');
  setCompactModal(false);
  lastModalTrigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;

  const officialSite = product.officialSite || '';
  const consMarkup = Array.isArray(product.cons) && product.cons.length
    ? `<div class="modal-section"><strong>Cons</strong><ul>${product.cons.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul></div>`
    : '';
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
        ${consMarkup}
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

function openSuncSimulationModal(product) {
  const overlay = qs('#modalOverlay');
  const content = qs('#modalContent');
  setCompactModal(false);
  const targetScore = Number.isFinite(product.sunc) ? product.sunc : 0;
  content.innerHTML = `
    <section class="sunc-sim-modal">
      <h2>sUNC Score</h2>
      <p class="modal-headline">Running a sUNC test for <strong>${escapeHtml(product.name)}</strong> based on listed executor data.</p>
      <div class="sunc-sim-progress-wrap" aria-live="polite">
        <div id="suncSimBar" class="sunc-sim-progress-bar"><span id="suncSimFill" class="sunc-sim-progress-fill"></span></div>
        <div id="suncSimValue" class="sunc-sim-value">0%</div>
      </div>
      <p class="settings-note">This test will not show UNC or functions passed/failed.</p>
    </section>`;

  overlay.classList.remove('is-closing');
  overlay.setAttribute('aria-hidden', 'false');
  qs('#modalCloseBtn').focus();

  const fill = qs('#suncSimFill');
  const value = qs('#suncSimValue');
  const durationMs = 1050;
  const startAt = performance.now();

  const step = now => {
    if (overlay.getAttribute('aria-hidden') === 'true') return;
    const progress = Math.min((now - startAt) / durationMs, 1);
    const current = Math.round(targetScore * progress);
    fill.style.width = `${current}%`;
    value.textContent = `${current}%`;
    if (progress < 1) {
      requestAnimationFrame(step);
      return;
    }
    value.textContent = Number.isFinite(product.sunc) ? `${product.sunc}% confirmed` : 'No score available';
  };
  requestAnimationFrame(step);
}

function getAiTokenSummary() {
  const fallback = { available: 0, freeRemaining: 0, purchased: 0 };
  const summary = window.XyrexDodge?.getTokenSummary?.();
  if (summary && typeof summary === 'object') {
    return {
      available: Number.isFinite(summary.available) ? summary.available : 0,
      freeRemaining: Number.isFinite(summary.freeRemaining) ? summary.freeRemaining : 0,
      purchased: Number.isFinite(summary.purchased) ? summary.purchased : 0
    };
  }
  return getFallbackAiTokenSummary() || fallback;
}

function getLocalDayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function readFallbackAiTokenData() {
  for (const key of DODGE_STORAGE_KEYS) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return { key, data: parsed };
    } catch {
      // Ignore invalid saved token data and keep looking.
    }
  }
  return { key: DODGE_STORAGE_KEYS[0], data: {} };
}

function normalizeFallbackAiTokenData(data) {
  const next = { ...(data || {}) };
  const today = getLocalDayKey();
  if (next.aiTokenDate !== today) {
    next.aiTokenDate = today;
    next.aiTokensUsedToday = 0;
  }
  next.aiTokensUsedToday = Math.max(0, Number(next.aiTokensUsedToday) || 0);
  next.aiPurchasedTokens = Math.max(0, Number(next.aiPurchasedTokens) || 0);
  next.freeTokenCooldownUntil = Math.max(0, Number(next.freeTokenCooldownUntil) || 0);
  next.freeTokenLastClaimAmount = clampTokenClaimAmount(Number(next.freeTokenLastClaimAmount) || FREE_TOKEN_SHOP.minClaim);
  return next;
}

function getFallbackAiTokenSummary() {
  const { data } = readFallbackAiTokenData();
  const normalized = normalizeFallbackAiTokenData(data);
  const freeRemaining = Math.max(0, FREE_DAILY_AI_TOKENS - normalized.aiTokensUsedToday);
  const purchased = Math.max(0, normalized.aiPurchasedTokens);
  return { available: freeRemaining + purchased, freeRemaining, purchased };
}



function getFreeTokenShopStatus() {
  const summary = getAiTokenSummary();
  const tokenState = readFallbackAiTokenData();
  const data = normalizeFallbackAiTokenData(tokenState.data);
  const now = Date.now();
  const cooldownUntil = Math.max(0, Number(data.freeTokenCooldownUntil) || 0);
  const remainingMs = Math.max(0, cooldownUntil - now);
  return {
    available: summary.available,
    cooldownUntil,
    remainingMs,
    isReady: remainingMs <= 0
  };
}

function claimFreeTokens(amountInput) {
  const rawAmount = Number(amountInput);
  if (!Number.isFinite(rawAmount)) {
    return { ok: false, reason: 'Please enter a valid number.' };
  }
  const amount = clampTokenClaimAmount(rawAmount);
  if (amount !== Math.trunc(rawAmount)) {
    return { ok: false, reason: `Please enter a whole number between ${FREE_TOKEN_SHOP.minClaim} and ${FREE_TOKEN_SHOP.maxClaim}.` };
  }
  const tokenState = readFallbackAiTokenData();
  const data = normalizeFallbackAiTokenData(tokenState.data);
  const now = Date.now();
  const cooldownUntil = Math.max(0, Number(data.freeTokenCooldownUntil) || 0);
  if (cooldownUntil > now) {
    return { ok: false, reason: `You can claim free tokens again in ${formatDuration(cooldownUntil - now)}.` };
  }
  data.aiPurchasedTokens = Math.max(0, Number(data.aiPurchasedTokens) || 0) + amount;
  data.freeTokenLastClaimAmount = amount;
  data.freeTokenCooldownUntil = now + getFreeTokenCooldownMs(amount);
  localStorage.setItem(tokenState.key || DODGE_STORAGE_KEYS[0], JSON.stringify(data));
  return { ok: true, amount, cooldownMs: getFreeTokenCooldownMs(amount) };
}

function openEarnTokensModal() {
  const status = getFreeTokenShopStatus();
  if (!status.isReady) {
    window.alert(`Free tokens are on cooldown. Time remaining: ${formatDuration(status.remainingMs)}.`);
    return;
  }
  const input = window.prompt(`Enter how many free tokens you want (${FREE_TOKEN_SHOP.minClaim}-${FREE_TOKEN_SHOP.maxClaim}). More tokens means a longer cooldown.`);
  if (input === null) return;
  const claim = claimFreeTokens(input);
  if (!claim.ok) {
    window.alert(claim.reason);
    return;
  }
  window.alert(`You earned ${claim.amount} token${claim.amount === 1 ? '' : 's'}. Next free claim available in ${formatDuration(claim.cooldownMs)}.`);
  openSettingsModal();
}

function consumeAiTokenForAssistant() {
  if (typeof window.XyrexDodge?.consumeAiToken === 'function') {
    return Boolean(window.XyrexDodge.consumeAiToken());
  }

  const tokenState = readFallbackAiTokenData();
  const data = normalizeFallbackAiTokenData(tokenState.data);
  const freeRemaining = Math.max(0, FREE_DAILY_AI_TOKENS - data.aiTokensUsedToday);
  const purchased = Math.max(0, data.aiPurchasedTokens);
  if (freeRemaining + purchased <= 0) return false;

  if (freeRemaining > 0) data.aiTokensUsedToday += 1;
  else data.aiPurchasedTokens = purchased - 1;
  localStorage.setItem(tokenState.key || DODGE_STORAGE_KEYS[0], JSON.stringify(data));
  return true;
}

function getBetaFeaturesEnabled() {
  return localStorage.getItem('xyrex_beta_features') === 'enabled';
}

function setBetaFeaturesEnabled(enabled) {
  localStorage.setItem('xyrex_beta_features', enabled ? 'enabled' : 'disabled');
  document.body.classList.toggle('beta-features-enabled', enabled);
}

function openSettingsModal() {
  const overlay = qs('#modalOverlay');
  const content = qs('#modalContent');
  setCompactModal(false);
  const tokenSummary = getAiTokenSummary();
  content.innerHTML = `
    <section class="settings-modal">
      <header class="settings-modal-head">
        <h2>Settings</h2>
        <p class="modal-headline">Manage interface preferences and review your AI token balance</p>
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
        <h3>AI Usage</h3>
        <p class="settings-token-count">Available AI tokens: <strong>${tokenSummary.available}</strong></p>
        <div class="settings-actions">
          <button id="settingsEarnTokensBtn" class="btn-primary settings-action-btn" type="button">Earn Tokens</button>
        </div>
        <p class="settings-note">Claim 1-30 free tokens. Higher amounts apply a longer cooldown.</p>
        <p class="settings-note" id="settingsCooldownNote"></p>
      </div>
      <footer class="settings-credit">Made by plutoxqq and slick012</footer>
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

  const earnTokensBtn = qs('#settingsEarnTokensBtn');
  const cooldownNote = qs('#settingsCooldownNote');
  if (cooldownNote) {
    const status = getFreeTokenShopStatus();
    cooldownNote.textContent = status.isReady ? 'Free token claim is ready now.' : `Next free claim in ${formatDuration(status.remainingMs)}.`;
  }
  earnTokensBtn?.addEventListener('click', openEarnTokensModal);

  const themeBtn = qs('#settingsThemeCustomizerBtn');
  themeBtn?.addEventListener('click', () => {
    if (!isNewUiMode || !window.XyrexNewUI?.toggleThemeCustomizer) return;
    window.XyrexNewUI.toggleThemeCustomizer();
  });

  qs('#modalCloseBtn').focus();
}

function openNoOfficialDiscordModal(scriptName = '') {
  const overlay = qs('#modalOverlay');
  const content = qs('#modalContent');
  if (!overlay || !content) return;

  setCompactModal(true);
  lastModalTrigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const safeName = stripTrailingPeriod(scriptName);
  content.innerHTML = `
    <section class="discord-unavailable-modal" aria-live="polite">
      <div class="discord-unavailable-icon" aria-hidden="true">
        ${popularScriptDiscordSvg}
        <span>!</span>
      </div>
      <h2>No Official Discord</h2>
      <p class="modal-headline">${safeName ? `<strong>${escapeHtml(safeName)}</strong> does not have an official Discord server.` : escapeHtml(NO_OFFICIAL_DISCORD_MESSAGE)}</p>
    </section>`;

  overlay.classList.remove('is-closing');
  overlay.setAttribute('aria-hidden', 'false');
  qs('#modalCloseBtn').focus();
}


function openNoAiTokensModal() {
  const overlay = qs('#modalOverlay');
  const content = qs('#modalContent');
  if (!overlay || !content) return;

  setCompactModal(true);
  lastModalTrigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  content.innerHTML = `
    <section class="discord-unavailable-modal ai-token-unavailable-modal" aria-live="polite">
      <div class="discord-unavailable-icon ai-token-unavailable-icon" aria-hidden="true">
        <span>!</span>
      </div>
      <h2>AI Tokens Unavailable</h2>
      <p class="modal-headline">${escapeHtml(NO_ASSISTANT_TOKENS_MESSAGE)}</p>
    </section>`;

  overlay.classList.remove('is-closing');
  overlay.setAttribute('aria-hidden', 'false');
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
    setCompactModal(false);
    if (lastModalTrigger && typeof lastModalTrigger.focus === 'function') lastModalTrigger.focus();
    lastModalTrigger = null;
  }, 190);
}

function detectionRiskScore(product) {
  let score = trustRiskMap[product.trustLevel] ?? 7;
  const status = String(product.status || '').toLowerCase();
  if (status.includes('detected')) score += 2;
  if (status.includes('down')) score += 2;
  if (status.includes('issue')) score += 1;
  if (status.includes('undetected')) score -= 1;
  return Math.max(1, Math.min(10, score));
}

function detectionRiskLabel(product) {
  const score = detectionRiskScore(product);
  if (score <= 3) return 'Low';
  if (score <= 6) return 'Medium';
  return 'High';
}

function estimatedPriceValue(product) {
  const joined = (product.pricingOptions || []).join(' ');
  const numbers = (joined.match(/\d+(?:\.\d+)?/g) || []).map(Number).filter(Number.isFinite);
  if (!numbers.length) return product.freeOrPaid === 'free' ? 0 : 999;
  return Math.min(...numbers);
}

function computeSmartRanking() {
  const clampScore = value => Math.max(0, Math.min(100, Math.round(value)));
  const mapValue = (value, map) => map[String(value || '').toLowerCase()] ?? 50;
  const trustScoreMap = { trusted: 96, caution: 68, risky: 36, unknown: 52 };
  const stabilityScoreLabelMap = { high: 96, medium: 72, low: 46 };

  const safetyScore = product => clampScore(
    (mapValue(product.trustLevel, trustScoreMap) * 0.52)
    + (mapValue(product.stability, stabilityScoreLabelMap) * 0.28)
    + ((10 - detectionRiskScore(product)) * 10 * 0.2)
  );
  const powerScore = product => clampScore(
    ((Number.isFinite(product.sunc) ? product.sunc : 52) * 0.65)
    + (((product.features || []).length * 7) * 0.2)
    + ((product.cheatType === 'internal' ? 92 : 72) * 0.15)
  );
  const beginnerScore = product => {
    const baseline = (safetyScore(product) * 0.36) + (mapValue(product.stability, stabilityScoreLabelMap) * 0.24);
    const freeBoost = ['free', 'both'].includes(product.freeOrPaid) ? 18 : 0;
    const keyPenalty = String(product.keySystem || '').toLowerCase() === 'key' ? -10 : 8;
    const desc = String(product.description || '').toLowerCase();
    const easeBoost = /(simple|easy|beginner|quick setup|user interface)/.test(desc) ? 12 : 0;
    return clampScore(baseline + freeBoost + keyPenalty + easeBoost);
  };
  const valueScore = product => {
    const price = estimatedPriceValue(product);
    const normalizedPrice = price <= 0 ? 100 : Math.max(18, 100 - (price * 2.4));
    return clampScore((powerScore(product) * 0.4) + (safetyScore(product) * 0.28) + (normalizedPrice * 0.32));
  };
  const mobileScore = product => {
    const platforms = (product.platform || []).map(item => String(item).toLowerCase());
    const mobileReady = platforms.some(item => item.includes('android') || item.includes('ios') || item.includes('mobile'));
    if (!mobileReady) return -1;
    return clampScore((safetyScore(product) * 0.33) + (powerScore(product) * 0.29) + (beginnerScore(product) * 0.2) + (valueScore(product) * 0.18));
  };

  const pickTop = (id, title, scoreFn, noteBuilder) => {
    const scored = products.map(product => ({ product, score: scoreFn(product) }))
      .filter(item => Number.isFinite(item.score) && item.score >= 0)
      .sort((a, b) => b.score - a.score);
    const winner = scored[0] || null;
    if (!winner) return null;
    return {
      id,
      title,
      executor: winner.product,
      score: winner.score,
      riskLevel: detectionRiskLabel(winner.product),
      reason: noteBuilder(winner.product, winner.score),
      weakness: (winner.product.cons && winner.product.cons[0]) || 'Watch status and trust updates before long sessions.',
      bestFor: winner.product.tags?.[0] || winner.product.cheatType || 'General use'
    };
  };

  const categories = [
    pickTop('bestFree', scriptsHubData.smartRankingLabels.bestFree, product => (['free', 'both'].includes(product.freeOrPaid) ? valueScore(product) : -1), (p, s) => `${p.name} leads free access value with a balanced ${s}/100 overall score.`),
    pickTop('safest', scriptsHubData.smartRankingLabels.safest, safetyScore, (p, s) => `${p.name} rates highest for safety based on trust, stability, and risk signals (${s}/100).`),
    pickTop('beginners', scriptsHubData.smartRankingLabels.beginners, beginnerScore, (p, s) => `${p.name} is easiest for new users thanks to onboarding simplicity and practical safety (${s}/100).`),
    pickTop('powerful', scriptsHubData.smartRankingLabels.powerful, powerScore, (p, s) => `${p.name} delivers the strongest execution profile right now (${s}/100).`),
    pickTop('bestValue', 'Best Value', valueScore, (p, s) => `${p.name} gives the strongest feature-to-cost balance overall (${s}/100).`),
    pickTop('bestMobile', 'Best Mobile', mobileScore, (p, s) => `${p.name} is currently the top mobile-oriented pick from platform-ready executors (${s}/100).`)
  ].filter(Boolean);

  return {
    monthLabel: new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' }),
    categories
  };
}

let smartRankingRotationTimer = 0;
let activeSmartRankingIndex = 0;

function renderSmartRankings() {
  const wrap = qs('#smartRankingSections');
  if (!wrap) return;
  const ranking = computeSmartRanking();
  if (!ranking.categories.length) {
    wrap.innerHTML = '';
    return;
  }
  const selected = ranking.categories[activeSmartRankingIndex % ranking.categories.length];

  wrap.innerHTML = `
    <article class="smart-ranking-hero">
      <p class="smart-ranking-kicker">Updated for ${escapeHtml(ranking.monthLabel)}</p>
      <h4>${escapeHtml(selected.title)}</h4>
      <p class="smart-ranking-executor">${escapeHtml(selected.executor?.name || 'Unavailable')}</p>
      <div class="smart-ranking-detail-grid">
        <div><span>Score</span><strong>${escapeHtml(String(selected.score || 0))}/100</strong></div>
        <div><span>Risk Level</span><strong>${escapeHtml(selected.riskLevel || 'Unknown')}</strong></div>
        <div><span>Best For</span><strong>${escapeHtml(selected.bestFor || 'General')}</strong></div>
      </div>
      <p><strong>Reason:</strong> ${escapeHtml(selected.reason || '')}</p>
      <p><strong>Watch-out:</strong> ${escapeHtml(selected.weakness || '')}</p>
    </article>
    <div class="smart-ranking-grid">
      ${ranking.categories.map((entry, index) => `
        <button class="smart-ranking-card ${index === (activeSmartRankingIndex % ranking.categories.length) ? 'is-active' : ''}" data-smart-ranking-index="${index}" type="button">
          <span>${escapeHtml(entry.title)}</span>
          <strong>${escapeHtml(entry.executor?.name || 'Unavailable')}</strong>
          <small>Score: ${escapeHtml(String(entry.score || 0))}/100 · Risk: ${escapeHtml(entry.riskLevel || 'Unknown')}</small>
        </button>
      `).join('')}
    </div>
  `;

  wrap.querySelectorAll('[data-smart-ranking-index]').forEach(button => {
    button.addEventListener('click', () => {
      activeSmartRankingIndex = Number(button.getAttribute('data-smart-ranking-index')) || 0;
      renderSmartRankings();
    });
  });

  if (smartRankingRotationTimer) window.clearInterval(smartRankingRotationTimer);
  smartRankingRotationTimer = window.setInterval(() => {
    const smartPanel = qs('#smartRankingsPanel');
    const scriptsPage = qs('#scriptsPage');
    if (!smartPanel || !scriptsPage || scriptsPage.hidden || smartPanel.hidden) return;
    activeSmartRankingIndex = (activeSmartRankingIndex + 1) % ranking.categories.length;
    renderSmartRankings();
  }, 9000);
}

let comparisonSelection = [];
let comparisonSearchTerm = '';
let comparisonFilter = 'all';

function renderComparisonSystem() {
  const selector = qs('#comparisonSelector');
  const tableWrap = qs('#comparisonTableWrap');
  const table = qs('#comparisonTable');
  const selectedRow = qs('#comparisonSelectedRow');
  const winnerSummary = qs('#comparisonWinnerSummary');
  const verdictsWrap = qs('#comparisonVerdicts');
  const searchInput = qs('#comparisonSearchInput');
  const filterWrap = qs('#comparisonFilterChips');
  if (!selector || !tableWrap || !table || !selectedRow || !winnerSummary || !verdictsWrap || !searchInput || !filterWrap) return;

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'windows', label: 'Windows' },
    { id: 'mobile', label: 'Mobile' },
    { id: 'free', label: 'Free' },
    { id: 'paid', label: 'Paid' },
    { id: 'keyless', label: 'Keyless' },
    { id: 'highsunc', label: 'High sUNC' }
  ];
  filterWrap.innerHTML = filters.map(filter => `<button type="button" class="comparison-filter-chip ${comparisonFilter === filter.id ? 'is-active' : ''}" data-compare-filter="${filter.id}">${escapeHtml(filter.label)}</button>`).join('');
  filterWrap.querySelectorAll('[data-compare-filter]').forEach(button => {
    button.addEventListener('click', () => {
      comparisonFilter = button.getAttribute('data-compare-filter') || 'all';
      renderComparisonSystem();
    });
  });
  if (!searchInput.dataset.bound) {
    searchInput.addEventListener('input', () => {
      comparisonSearchTerm = searchInput.value.trim().toLowerCase();
      renderComparisonSystem();
    });
    searchInput.dataset.bound = 'true';
  }
  if (searchInput.value !== comparisonSearchTerm) searchInput.value = comparisonSearchTerm;

  const filterMatch = product => {
    if (comparisonSearchTerm && !product.name.toLowerCase().includes(comparisonSearchTerm)) return false;
    if (comparisonFilter === 'windows') return (product.platform || []).some(item => String(item).toLowerCase().includes('windows'));
    if (comparisonFilter === 'mobile') return (product.platform || []).some(item => /(android|ios|mobile)/i.test(String(item)));
    if (comparisonFilter === 'free') return ['free', 'both'].includes(product.freeOrPaid);
    if (comparisonFilter === 'paid') return ['paid', 'both'].includes(product.freeOrPaid);
    if (comparisonFilter === 'keyless') return String(product.keySystem || '').toLowerCase() !== 'key';
    if (comparisonFilter === 'highsunc') return Number.isFinite(product.sunc) && product.sunc >= 90;
    return true;
  };
  const sorted = [...products].filter(filterMatch).sort((a, b) => a.name.localeCompare(b.name));
  selector.innerHTML = sorted.map(product => {
    const selected = comparisonSelection.includes(product.name);
    return `<button type="button" class="compare-pick ${selected ? 'is-active' : ''}" data-compare-name="${escapeHtml(product.name)}">${escapeHtml(product.name)}</button>`;
  }).join('');

  selector.querySelectorAll('[data-compare-name]').forEach(button => {
    button.addEventListener('click', () => {
      const name = button.getAttribute('data-compare-name');
      if (!name) return;
      if (comparisonSelection.includes(name)) {
        comparisonSelection = comparisonSelection.filter(item => item !== name);
      } else if (comparisonSelection.length < 3) {
        comparisonSelection = [...comparisonSelection, name];
      }
      renderComparisonSystem();
    });
  });
  selectedRow.innerHTML = comparisonSelection.length ? `Selected: ${comparisonSelection.map(name => `${escapeHtml(name)} ×`).join(' ').replace(/ ×$/, '')}` : 'Selected: None';

  const selectedProducts = comparisonSelection
    .map(name => products.find(item => item.name === name))
    .filter(Boolean)
    .slice(0, 3);

  if (selectedProducts.length < 2) {
    tableWrap.hidden = true;
    winnerSummary.hidden = true;
    verdictsWrap.hidden = true;
    winnerSummary.innerHTML = '';
    verdictsWrap.innerHTML = '';
    table.innerHTML = '';
    return;
  }

  const suncValues = selectedProducts.map(item => Number.isFinite(item.sunc) ? item.sunc : -1);
  const stabilityValues = selectedProducts.map(item => stabilityScoreMap[item.stability] || 0);
  const riskValues = selectedProducts.map(item => detectionRiskScore(item));
  const priceValues = selectedProducts.map(item => estimatedPriceValue(item));
  const platformValues = selectedProducts.map(item => (item.platform || []).length);

  const winnerIndexes = values => {
    const valid = values.filter(Number.isFinite);
    if (!valid.length) return [];
    const max = Math.max(...valid);
    return values.filter(value => value === max).length === 1 ? [values.findIndex(value => value === max)] : [];
  };
  const winnerIndexesMin = values => {
    const valid = values.filter(Number.isFinite);
    if (!valid.length) return [];
    const min = Math.min(...valid);
    return values.filter(value => value === min).length === 1 ? [values.findIndex(value => value === min)] : [];
  };

  const cell = (value, best) => `<td class="${best ? 'is-best' : ''}">${escapeHtml(String(value))}${best ? '<span class="best-label">Best</span>' : ''}</td>`;
  const rows = [
    { label: 'sUNC', values: selectedProducts.map(item => Number.isFinite(item.sunc) ? item.sunc : -1), display: selectedProducts.map(item => Number.isFinite(item.sunc) ? `${item.sunc}%` : 'None'), best: 'max' },
    { label: 'Stability', values: stabilityValues, display: selectedProducts.map(item => item.stability), best: 'max' },
    { label: 'Detection Risk', values: riskValues, display: selectedProducts.map((item, idx) => `${detectionRiskLabel(item)} (${riskValues[idx]}/10)`), best: 'min' },
    { label: 'Price', values: priceValues, display: selectedProducts.map(item => item.pricingOptions?.[0] || item.freeOrPaid), best: 'min' },
    { label: 'Platform', values: platformValues, display: selectedProducts.map(item => (item.platform || []).join(', ')), best: 'max' },
    { label: 'Key System', values: selectedProducts.map(item => String(item.keySystem || '').toLowerCase() === 'key' ? 0 : 1), display: selectedProducts.map(item => item.keySystem || 'Unknown'), best: 'max' },
    { label: 'Cheat Type', values: selectedProducts.map(item => item.cheatType === 'internal' ? 1 : 0), display: selectedProducts.map(item => item.cheatType || 'Unknown'), best: null },
    { label: 'Status', values: selectedProducts.map(item => String(item.status || '').toLowerCase().includes('up') ? 1 : 0), display: selectedProducts.map(item => item.status || 'Unknown'), best: null },
    { label: 'Trust Level', values: selectedProducts.map(item => ({ trusted: 3, caution: 2, unknown: 1, risky: 0 }[String(item.trustLevel || '').toLowerCase()] ?? 1)), display: selectedProducts.map(item => item.trustLevel || 'Unknown'), best: 'max' },
    { label: 'Features', values: selectedProducts.map(item => (item.features || []).length), display: selectedProducts.map(item => (item.features || []).join(', ') || 'None listed'), best: 'max' },
    { label: 'Pros', values: selectedProducts.map(() => 0), display: selectedProducts.map(item => (item.pros || []).slice(0, 3).join(', ') || 'None listed'), best: null },
    { label: 'Cons', values: selectedProducts.map(() => 0), display: selectedProducts.map(item => (item.cons || []).slice(0, 3).join(', ') || 'None listed'), best: null },
    { label: 'Best For', values: selectedProducts.map(() => 0), display: selectedProducts.map(item => item.tags?.[0] || 'General use'), best: null },
    { label: 'Avoid If', values: selectedProducts.map(() => 0), display: selectedProducts.map(item => (item.cons || [])[0] || 'You need maximum trust certainty'), best: null }
  ];

  table.innerHTML = `
    <thead>
      <tr>
        <th>Metric</th>
        ${selectedProducts.map(item => `<th>${escapeHtml(item.name)}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      ${rows.map(row => {
        const winners = row.best === 'max' ? winnerIndexes(row.values) : row.best === 'min' ? winnerIndexesMin(row.values) : [];
        return `<tr><th>${escapeHtml(row.label)}</th>${row.display.map((value, idx) => cell(value, winners.includes(idx))).join('')}</tr>`;
      }).join('')}
    </tbody>
  `;
  const recommendationTotals = selectedProducts.map(item => (Number.isFinite(item.sunc) ? item.sunc : 55) + (stabilityScoreMap[item.stability] || 0) + (100 - (detectionRiskScore(item) * 10)));
  const leadIndex = recommendationTotals.findIndex(score => score === Math.max(...recommendationTotals));
  winnerSummary.hidden = false;
  winnerSummary.innerHTML = `<strong>Winner summary:</strong> ${escapeHtml(selectedProducts[leadIndex].name)} currently leads overall for this selection mix.`;
  verdictsWrap.hidden = false;
  verdictsWrap.innerHTML = selectedProducts.map(item => `<article class="comparison-verdict-card"><h4>${escapeHtml(item.name)}</h4><p><strong>Verdict:</strong> ${escapeHtml((item.pros || [])[0] || 'Solid overall baseline.')}</p><p><strong>Watch-out:</strong> ${escapeHtml((item.cons || [])[0] || 'Review status and trust before use.')}</p></article>`).join('');

  tableWrap.hidden = false;
}

function renderPopularScripts() {
  const wrap = qs('#popularScriptsList');
  if (!wrap) return;
  const scripts = Array.isArray(scriptsHubData.popularScripts) ? scriptsHubData.popularScripts : [];
  const groupedScripts = groupScriptsByCategory(scripts);
  const categories = getPopularScriptCategories(groupedScripts);
  if (!categories.length) {
    wrap.innerHTML = '<div class="script-empty-state"><p>No scripts found.</p><p>Try a different search or category.</p></div>';
    return;
  }
  const defaultOpenCategory = null;
  wrap.classList.add('popular-script-categories');
  wrap.innerHTML = categories.map((categoryName, index) => {
    const items = groupedScripts[categoryName] || [];
    const isOpen = categoryName === defaultOpenCategory;
    return renderScriptCategory(categoryName, items, isOpen, index);
  }).join('');

  if (!wrap.dataset.popularScriptsBound) {
    wrap.addEventListener('click', async event => {
      const headerButton = event.target.closest('.script-category-header');
      if (headerButton && wrap.contains(headerButton)) {
        toggleScriptCategory(headerButton.closest('.script-category'));
        return;
      }
      const unavailableDiscordButton = event.target.closest('[data-discord-unavailable="true"]');
      if (unavailableDiscordButton && wrap.contains(unavailableDiscordButton)) {
        event.preventDefault();
        event.stopPropagation();
        openNoOfficialDiscordModal(unavailableDiscordButton.getAttribute('data-script-name') || '');
        return;
      }
      const copyButton = event.target.closest('.script-copy-btn');
      if (!copyButton || !wrap.contains(copyButton)) return;
      event.stopPropagation();
      const scriptValue = copyButton.getAttribute('data-script-copy') || '';
      if (!scriptValue) return;
      try {
        await navigator.clipboard.writeText(scriptValue);
        copyButton.classList.add('is-copied');
        window.setTimeout(() => copyButton.classList.remove('is-copied'), 900);
      } catch {
        // no-op
      }
    });
    wrap.dataset.popularScriptsBound = 'true';
  }
}

function groupScriptsByCategory(scripts) {
  return scripts.reduce((acc, script) => {
    const name = stripTrailingPeriod(script.category || script.game || 'Other') || 'Other';
    if (!acc[name]) acc[name] = [];
    acc[name].push(script);
    return acc;
  }, {});
}

function getPopularScriptCategories(groupedScripts) {
  const configuredCategories = POPULAR_SCRIPT_CATEGORIES.map(category => {
    const existingCategory = Object.keys(groupedScripts).find(name => name.toLowerCase() === category.toLowerCase());
    return existingCategory || category;
  });
  const extraCategories = Object.keys(groupedScripts).filter(category => (
    !configuredCategories.some(configuredCategory => configuredCategory.toLowerCase() === category.toLowerCase())
  ));
  return [...configuredCategories, ...extraCategories];
}

function getScriptDiscordUrl(stats = {}) {
  const discord = String(stats.discord || '').trim();
  if (!stats.discordIcon || !discord) return '';
  if (/^https?:\/\//i.test(discord)) return discord;
  if (/^(discord\.gg|discord\.com\/invite)\//i.test(discord)) return `https://${discord}`;
  return discord;
}

function getScriptBadges(script) {
  const stats = script.stats || {};
  const badges = [];
  const addBadge = (label, type) => {
    if (!label) return;
    badges.push({ label, type });
  };
  addBadge(stats.price, /free|keyless|stable|working/i.test(stats.price || '') ? 'positive' : 'info');
  addBadge(stats.keySystem, /keyless/i.test(stats.keySystem || '') ? 'positive' : /keyed/i.test(stats.keySystem || '') ? 'warning' : 'info');
  addBadge(stats.suncRequired ? `sUNC ${stats.suncRequired}` : '', 'info');
  addBadge(stats.bestExecutor ? `Best: ${stats.bestExecutor}` : '', 'info');
  addBadge(stats.stability, /stable/i.test(stats.stability || '') ? 'positive' : /unstable|buggy/i.test(stats.stability || '') ? 'warning' : 'info');
  if (typeof stats.buggy === 'boolean') addBadge(stats.buggy ? 'Buggy' : 'Not Buggy', stats.buggy ? 'warning' : 'positive');
  addBadge(stats.status, /working/i.test(stats.status || '') ? 'positive' : /patched|down/i.test(stats.status || '') ? 'warning' : 'info');
  if (Array.isArray(stats.platform)) stats.platform.forEach(platform => addBadge(platform, 'info'));
  return badges.filter(badge => badge.label && !/unknown/i.test(badge.label));
}

function renderScriptCard(script) {
  const badges = getScriptBadges(script);
  const stats = script.stats || {};
  const discordUrl = getScriptDiscordUrl(stats);
  const discordButton = discordUrl
    ? `<a class="script-discord-btn" href="${escapeHtml(discordUrl)}" target="_blank" rel="noopener noreferrer" title="Open Discord" aria-label="Open Discord for ${escapeHtml(script.name)}">${popularScriptDiscordSvg}</a>`
    : stats.discordIcon === false
      ? `<button class="script-discord-btn script-discord-btn-unavailable" type="button" data-discord-unavailable="true" data-script-name="${escapeHtml(script.name)}" title="No official Discord" aria-label="No official Discord for ${escapeHtml(script.name)}">${popularScriptDiscordSvg}<span class="script-discord-alert" aria-hidden="true">!</span></button>`
      : '';
  return `
    <article class="script-card">
      <div class="script-card-head">
        <h4 class="script-card-title">${escapeHtml(script.name)}</h4>
        <div class="script-card-meta">
          ${discordButton}
          <button class="script-copy-btn" type="button" data-script-copy="${escapeHtml(script.script)}" title="Copy script" aria-label="Copy script">
            <span class="script-file-icon">${popularScriptFileSvg}</span>
          </button>
        </div>
      </div>
      <p>${escapeHtml(stripTrailingPeriod(script.description))}</p>
      ${badges.length ? `<div class="script-stat-badges">${badges.map(badge => `<span class="script-stat-badge ${badge.type}">${escapeHtml(badge.label)}</span>`).join('')}</div>` : ''}
      <div class="script-code-wrap">
        <pre>${escapeHtml(script.script)}</pre>
      </div>
    </article>`;
}

function renderScriptCategory(categoryName, scripts, isOpen, index) {
  return `
    <section class="script-category" data-category-name="${escapeHtml(categoryName)}">
      <button class="script-category-header" type="button" aria-expanded="${isOpen ? 'true' : 'false'}" aria-controls="script-category-body-${index}">
        <span class="script-category-title">${escapeHtml(categoryName)}</span>
        <span class="script-category-meta">
          <span class="script-category-count">${scripts.length}</span>
          <span class="script-category-arrow" aria-hidden="true">▼</span>
        </span>
      </button>
      <div id="script-category-body-${index}" class="script-category-body ${isOpen ? 'open' : ''}">
        ${scripts.length ? scripts.map(renderScriptCard).join('') : '<div class="script-empty-state"><p>No scripts added yet.</p><p>Add entries with this category to show them here.</p></div>'}
      </div>
    </section>`;
}

function toggleScriptCategory(categoryElement) {
  if (!categoryElement) return;
  const header = categoryElement.querySelector('.script-category-header');
  const body = categoryElement.querySelector('.script-category-body');
  if (!header || !body || body.dataset.animating === 'true') return;

  const shouldOpen = !body.classList.contains('open');
  body.dataset.animating = 'true';

  if (shouldOpen) {
    body.classList.add('open');
    const targetHeight = body.scrollHeight;
    body.style.maxHeight = '0px';
    requestAnimationFrame(() => {
      body.style.maxHeight = `${targetHeight}px`;
    });
  } else {
    const currentHeight = body.scrollHeight;
    body.style.maxHeight = `${currentHeight}px`;
    requestAnimationFrame(() => {
      body.classList.remove('open');
      body.style.maxHeight = '0px';
    });
  }

  header.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');

  const onTransitionEnd = event => {
    if (event.propertyName !== 'max-height') return;
    body.removeEventListener('transitionend', onTransitionEnd);
    if (shouldOpen) body.style.maxHeight = 'none';
    body.dataset.animating = 'false';
  };
  body.addEventListener('transitionend', onTransitionEnd);
}

function renderRecentChanges() {
  const wrap = qs('#recentChangesList');
  if (!wrap) return;
  wrap.innerHTML = scriptsHubData.recentChanges.map(entry => `<li>${escapeHtml(entry)}</li>`).join('');
}

function getAssistantKnowledgeText(product) {
  const platforms = Array.isArray(product.platform) && product.platform.length ? product.platform.join(', ') : 'Unknown';
  const features = Array.isArray(product.features) && product.features.length ? product.features.join(', ') : 'None listed';
  const price = Array.isArray(product.pricingOptions) && product.pricingOptions.length
    ? product.pricingOptions.join(', ')
    : product.freeOrPaid;
  const site = product.officialSite ? ` Official site: ${product.officialSite}.` : ' Official site: Not listed.';
  return `${product.name}: ${product.description} Platforms: ${platforms}. Features: ${features}. sUNC: ${Number.isFinite(product.sunc) ? `${product.sunc}%` : 'None'}. Stability: ${product.stability}. Risk: ${detectionRiskLabel(product)} (${detectionRiskScore(product)}/10). Price: ${price}.${site}`;
}

const assistantIntents = { COMPARE:'compare', RECOMMEND:'recommend', SAFETY:'safety', PRICE:'price', PLATFORM:'platform', SUNC:'sunc', BEGINNER:'beginner', DETAILS:'details', FILTER_SHOW:'filter_show', UNKNOWN:'unknown' };
const assistantLoadingSteps = ['Reading Xyrex executor data...','Checking platform, price, and key system...','Comparing sUNC, trust, and stability...','Building a clear recommendation...'];
let assistantContext = { lastIntent:null, lastExecutors:[], lastFilters:{}, lastQuestion:'', lastRecommendation:null };

function detectAssistantIntent(message) {
  const raw = String(message || '').trim();
  const input = raw.toLowerCase();
  const entities = products.filter(item => input.includes(item.name.toLowerCase())).map(item => item.name);
  const wantsFilterAction = /(show|filter|display|only show|hide everything except|show me|list only)/i.test(input);
  const filters = { platform: [], price: null, keySystem: null, cheatType: null, safety: null, suncMinimum: null };
  if (/(windows|pc)/i.test(input)) filters.platform.push('Windows');
  if (/(mac|macos)/i.test(input)) filters.platform.push('macOS');
  if (/(android|mobile)/i.test(input)) filters.platform.push('Android');
  if (/(ios|iphone|ipad|mobile)/i.test(input)) filters.platform.push('iOS');
  if (/\bfree\b/i.test(input)) filters.price = 'free'; else if (/\bpaid|cost\b/i.test(input)) filters.price = 'paid';
  if (/keyless/i.test(input)) filters.keySystem = 'keyless'; else if (/keyed|key system/i.test(input)) filters.keySystem = 'keyed';
  if (/internal/i.test(input)) filters.cheatType = 'internal'; else if (/external/i.test(input)) filters.cheatType = 'external';
  if (/(safe|safest|trusted|risk|detected|undetected)/i.test(input)) filters.safety = 'safe';
  if (/(high sunc|highest sunc|highest unc|top sunc)/i.test(input)) filters.suncMinimum = 70;
  const beginner = /(beginner|new|easy|simple|first executor)/i.test(input);
  let intent = assistantIntents.UNKNOWN;
  if (wantsFilterAction) intent = assistantIntents.FILTER_SHOW;
  else if (/(compare|\bvs\b|versus|better than|which is better)/i.test(input)) intent = assistantIntents.COMPARE;
  else if (/(best|recommend|what should i use|which one should i use)/i.test(input)) intent = assistantIntents.RECOMMEND;
  else if (/(safe|safest|trusted|risk|detected|undetected)/i.test(input)) intent = assistantIntents.SAFETY;
  else if (/(free|paid|cost|keyless|keyed)/i.test(input)) intent = assistantIntents.PRICE;
  else if (/(windows|mac|android|ios|mobile|pc)/i.test(input)) intent = assistantIntents.PLATFORM;
  else if (/(sunc|score|percentage|highest unc|highest sunc)/i.test(input)) intent = assistantIntents.SUNC;
  else if (beginner) intent = assistantIntents.BEGINNER;
  else if (entities.length) intent = assistantIntents.DETAILS;
  return { intent, entities, filters, beginner, wantsFilterAction };
}

function recommendationScore(product, userIntent = {}) {
  let score = Number.isFinite(product.sunc) ? product.sunc * 0.55 : 0;
  const trust = String(product.trustLevel || '').toLowerCase();
  score += trust.includes('high') ? 24 : trust.includes('medium') ? 12 : trust.includes('low') ? 2 : 5;
  const stable = String(product.stability || '').toLowerCase();
  if (stable.includes('stable')) score += 12;
  if (/(unstable|unknown)/i.test(stable)) score -= 8;
  const status = String(product.status || '').toLowerCase();
  if (/(down|broken|patched|discontinued|risky|issue|detected)/i.test(status)) score -= 35;
  if (/active|working|online|updated/i.test(status)) score += 9;
  if (userIntent.filters?.price === 'free') score += product.freeOrPaid === 'free' ? 12 : -8;
  if (userIntent.filters?.price === 'paid') score += product.freeOrPaid === 'paid' ? 6 : -4;
  if (userIntent.beginner) score += (product.keySystem === 'keyless' ? 8 : -2) + (product.freeOrPaid === 'free' ? 6 : 0) + (stable.includes('stable') ? 5 : -4);
  if (userIntent.intent === assistantIntents.SAFETY) score += (trust.includes('high') ? 12 : 0) + (/(detected|risky|down)/i.test(status) ? -20 : 4);
  if (userIntent.filters?.platform?.length) score += userIntent.filters.platform.some(p => (product.platform || []).includes(p)) ? 15 : -30;
  if (userIntent.filters?.keySystem) score += product.keySystem === userIntent.filters.keySystem ? 6 : -6;
  return score;
}
function getRankedExecutors(intentData) { return products.map(p => ({ product: p, score: recommendationScore(p, intentData) })).sort((a, b) => b.score - a.score); }
function getAssistantConfidence(items) { const list = Array.isArray(items) ? items : [items]; const v = list.filter(Boolean).map(p => [p.officialSite, Number.isFinite(p.sunc), p.trustLevel !== 'Unknown', p.stability !== 'Unknown', p.status !== 'Unknown', (p.pros || []).length + (p.cons || []).length >= 2].filter(Boolean).length); const avg = v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0; return avg >= 5 ? 'High' : avg >= 3 ? 'Medium' : 'Low'; }
function applyAssistantFilters(filters) {
  qsa('.filter-checkbox, .price-checkbox').forEach(cb => { cb.checked = false; });
  (filters.platform || []).forEach(platform => { const el = qsa('.filter-checkbox').find(i => i.getAttribute('data-filter-group') === 'platform' && i.value === platform); if (el) el.checked = true; });
  if (filters.keySystem) { const el = qsa('.filter-checkbox').find(i => i.getAttribute('data-filter-group') === 'keySystem' && i.value === filters.keySystem); if (el) el.checked = true; }
  if (filters.cheatType) { const el = qsa('.filter-checkbox').find(i => i.getAttribute('data-filter-group') === 'cheatType' && i.value === filters.cheatType); if (el) el.checked = true; }
  if (filters.price === 'free') qs('#priceFree').checked = true; else if (filters.price === 'paid') qs('#pricePaid').checked = true; else if (filters.price === 'both') qs('#priceBoth').checked = true;
  applyAllFilters();
  const grid = qs('#productGrid'); if (grid) { grid.classList.add('assistant-filter-pulse'); setTimeout(() => grid.classList.remove('assistant-filter-pulse'), 800); }
}

function getLocalAssistantFallback(prompt) {
  const input = String(prompt || '').toLowerCase();
  const mentioned = products.filter(item => input.includes(item.name.toLowerCase()));
  if (mentioned.length) {
    return `Research API is currently unavailable, so I am relying only on local Xyrex data.\n\n${mentioned.map(getAssistantKnowledgeText).join('\n\n')}`;
  }

  if (input.includes('android')) {
    const android = products.filter(item => Array.isArray(item.platform) && item.platform.includes('Android'));
    const ranked = android.sort((a, b) => detectionRiskScore(a) - detectionRiskScore(b) || (Number.isFinite(b.sunc) ? b.sunc : -1) - (Number.isFinite(a.sunc) ? a.sunc : -1));
    return `Research API is currently unavailable, so I am relying only on local Xyrex data.\n\nTop Android options by visible local metrics:\n${ranked.slice(0, 3).map(item => `• ${item.name} — ${detectionRiskLabel(item)} risk, ${item.stability} stability, sUNC ${Number.isFinite(item.sunc) ? `${item.sunc}%` : 'None'}, status ${item.status}`).join('\n')}`;
  }

  if (input.includes('free')) {
    const free = products
      .filter(item => String(item.freeOrPaid).toLowerCase() === 'free')
      .sort((a, b) => detectionRiskScore(a) - detectionRiskScore(b) || (Number.isFinite(b.sunc) ? b.sunc : -1) - (Number.isFinite(a.sunc) ? a.sunc : -1));
    return `Research API is currently unavailable, so I am relying only on local Xyrex data.\n\nFree executors with the lowest visible risk:\n${free.slice(0, 5).map(item => `• ${item.name} — ${detectionRiskLabel(item)} risk (${detectionRiskScore(item)}/10), ${item.stability} stability, sUNC ${Number.isFinite(item.sunc) ? `${item.sunc}%` : 'None'}`).join('\n') || '• None listed'}`;
  }

  if (input.includes('safe') || input.includes('safest') || input.includes('risk') || input.includes('beginner') || input.includes('trust')) {
    const safest = [...products]
      .sort((a, b) => detectionRiskScore(a) - detectionRiskScore(b) || (Number.isFinite(b.sunc) ? b.sunc : -1) - (Number.isFinite(a.sunc) ? a.sunc : -1));
    return `Research API is currently unavailable, so I am relying only on local Xyrex data.\n\nLower-risk beginner-friendly options from visible trust, stability, status, and sUNC data:\n${safest.slice(0, 4).map(item => `• ${item.name} — ${detectionRiskLabel(item)} risk, trust ${item.trustLevel}, stability ${item.stability}, status ${item.status}, sUNC ${Number.isFinite(item.sunc) ? `${item.sunc}%` : 'None'}`).join('\n')}`;
  }

  return `Research API is currently unavailable, so I am relying only on local Xyrex data.\n\nI can still help with safety, platforms, pricing, sUNC, and stability for the executors listed on this page.`;
}


function renderAssistantMarkdown(markdownText) {
  const rawText = String(markdownText || '');

  if (!window.marked || !window.DOMPurify) {
    const fallback = document.createElement('div');
    fallback.textContent = rawText;
    return fallback;
  }

  marked.setOptions({
    breaks: false,
    gfm: true
  });

  const normalizedText = rawText.replace(/\n{3,}/g, '\n\n');
  const unsafeHtml = marked.parse(normalizedText);

  const safeHtml = DOMPurify.sanitize(unsafeHtml, {
    USE_PROFILES: { html: true }
  });

  const wrapper = document.createElement('div');
  wrapper.className = 'assistant-markdown';
  wrapper.innerHTML = safeHtml;


  wrapper.querySelectorAll('table').forEach(table => {
    const scrollWrap = document.createElement('div');
    scrollWrap.className = 'assistant-table-wrap';
    table.parentNode?.insertBefore(scrollWrap, table);
    scrollWrap.appendChild(table);
  });

  wrapper.querySelectorAll('a').forEach(link => {
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  });

  return wrapper;
}

function setAssistantMessageMarkdown(messageElement, markdownText) {
  if (!messageElement) return;

  messageElement.textContent = '';
  messageElement.appendChild(renderAssistantMarkdown(markdownText));
}


function buildLocalRecommendationReply(intentData) {
  const ranked = getRankedExecutors(intentData || {}).map(item => item.product);
  const best = ranked[0];
  if (!best) return getLocalAssistantFallback('');
  return `### Recommended pick: ${best.name}

Why:
- Strong overall score from local trust, stability, status, and sUNC fields
- Better aligned with your request filters and intent

Based on Xyrex data:
- Executor: ${best.name}
- Platform: ${(best.platform || []).join(', ') || 'Unknown'}
- Price: ${best.freeOrPaid}
- Key System: ${best.keySystem}
- sUNC: ${Number.isFinite(best.sunc) ? `${best.sunc}%` : 'None'}
- Trust: ${best.trustLevel}
- Stability: ${best.stability}
- Status: ${best.status}

Confidence: ${getAssistantConfidence(best)} — Based on current local Xyrex data and may change over time.`;
}

function isLikelyCannedAssistantReply(replyText) {
  const normalized = String(replyText || '').toLowerCase().replace(/\s+/g, ' ').trim();
  if (!normalized) return true;
  const cannedIndicators = [
    'recommended pick: milkers',
    'based on current xyrex-local metrics',
    'confidence: high — based on the current xyrex data'
  ];
  return cannedIndicators.filter(token => normalized.includes(token)).length >= 2;
}

async function askExploitAssistant(message) {
  const response = await fetch(EXPLOIT_ASSISTANT_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      executors: products
    })
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`Exploit Assistant API request failed (${response.status} ${response.statusText})${errorText ? `: ${errorText.slice(0, 240)}` : ''}`);
  }

  return response.json();
}

function initExploitAssistant() {
  const form = qs('#assistantForm');
  const input = qs('#assistantInput');
  const sendBtn = qs('#assistantSendBtn');
  const messages = qs('#assistantMessages');
  if (!form || !input || !sendBtn || !messages) return;
  if (form.dataset.apiIntegrated === 'true') return;
  form.dataset.apiIntegrated = 'true';

  let loadingInterval = null;
  const appendMessage = (role, text, badges = []) => {
    const bubble = document.createElement('article');
    bubble.className = `assistant-message ${role === 'user' ? 'assistant-user' : 'assistant-bot'}`;
    const visibleBadges = role === 'bot' && Array.isArray(badges) ? badges.filter(badge => badge !== 'Local Data') : [];
    if (visibleBadges.length) {
      const badgeWrap = document.createElement('div'); badgeWrap.className = 'assistant-badges';
      visibleBadges.forEach(badge => { const el = document.createElement('span'); el.className = 'assistant-badge'; el.textContent = badge; badgeWrap.appendChild(el); });
      bubble.appendChild(badgeWrap);
    }
    const content = document.createElement('div'); content.textContent = text; bubble.appendChild(content);
    messages.appendChild(bubble);
    messages.scrollTop = messages.scrollHeight;
    return bubble;
  };

  if (!messages.children.length) appendMessage('bot', 'Hello. I am your Exploit Assistant. Ask me about any active executor listed on this page.', ['Local Data']);

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const userMessage = input.value.trim();
    if (!userMessage) return;

    if (!consumeAiTokenForAssistant()) {
      appendMessage('bot', NO_ASSISTANT_TOKENS_MESSAGE, ['AI Tokens']);
      openNoAiTokensModal();
      return;
    }

    appendMessage('user', userMessage);
    input.value = '';
    input.disabled = true;
    sendBtn.disabled = true;
    const intentData = detectAssistantIntent(userMessage);
    const loadingMessage = appendMessage('bot', intentData.wantsFilterAction ? 'Reading your filter request...' : assistantLoadingSteps[0], [intentData.wantsFilterAction ? 'Filter Mode' : 'Local Data']);
    let loadIndex = 0;
    if (loadingInterval) clearInterval(loadingInterval);
    loadingInterval = setInterval(() => { loadIndex = (loadIndex + 1) % assistantLoadingSteps.length; loadingMessage.lastChild.textContent = intentData.wantsFilterAction ? ['Reading your filter request...','Updating executor filters...','Refreshing visible executors...'][loadIndex % 3] : assistantLoadingSteps[loadIndex]; }, 750);

    try {
      let replyText = '';
      if (intentData.wantsFilterAction) {
        applyAssistantFilters(intentData.filters);
        const matchCount = qs('#productGrid')?.children?.length || 0;
        const filterLabel = [intentData.filters.price, ...(intentData.filters.platform || []), intentData.filters.keySystem].filter(Boolean).join(' + ') || 'requested filters';
        replyText = `### Filter Mode\nI filtered the page to show: ${filterLabel}\n\nMatching executors: ${matchCount}\n\n${matchCount ? 'Done — I filtered the page based on your request.' : 'I applied the filter, but no matching executors were found in the current Xyrex data.'}`;
      } else if (intentData.intent === assistantIntents.COMPARE && intentData.entities.length >= 2) {
        const pair = intentData.entities.slice(0, 2).map(n => products.find(p => p.name === n)).filter(Boolean);
        replyText = `### ${pair[0].name} vs ${pair[1].name}\n\nCategory comparison:\n- Price: ${pair[0].freeOrPaid} vs ${pair[1].freeOrPaid}\n- Platform: ${(pair[0].platform || []).join(', ')} vs ${(pair[1].platform || []).join(', ')}\n- Key System: ${pair[0].keySystem} vs ${pair[1].keySystem}\n- sUNC: ${pair[0].sunc ?? 'None'} vs ${pair[1].sunc ?? 'None'}\n- Trust: ${pair[0].trustLevel} vs ${pair[1].trustLevel}\n- Stability: ${pair[0].stability} vs ${pair[1].stability}\n- Status: ${pair[0].status} vs ${pair[1].status}\n\nVerdict:\nBased on Xyrex data, ${recommendationScore(pair[0], intentData) >= recommendationScore(pair[1], intentData) ? pair[0].name : pair[1].name} currently looks stronger overall.\n\nConfidence:\n${getAssistantConfidence(pair)} — This comparison is based on local Xyrex fields and may change over time.`;
      } else {
        const apiPayload = await askExploitAssistant(userMessage);
        const apiReply = String(apiPayload?.reply || apiPayload?.message || '').trim();
        if (!apiReply) throw new Error('Exploit Assistant API returned an empty reply.');
        replyText = isLikelyCannedAssistantReply(apiReply) ? buildLocalRecommendationReply(intentData) : apiReply;
      }
      setAssistantMessageMarkdown(loadingMessage, replyText);
      if (intentData.wantsFilterAction) {
        const clearBtn = document.createElement('button'); clearBtn.type = 'button'; clearBtn.className = 'assistant-clear-filters'; clearBtn.textContent = 'Clear filters';
        clearBtn.addEventListener('click', () => { qsa('.filter-checkbox, .price-checkbox').forEach(cb => { cb.checked = false; }); applyAllFilters(); });
        loadingMessage.appendChild(clearBtn);
      }
      assistantContext = { lastIntent: intentData.intent, lastExecutors: intentData.entities, lastFilters: intentData.filters, lastQuestion: userMessage, lastRecommendation: intentData.entities[0] || null };
    } catch {
      setAssistantMessageMarkdown(loadingMessage, 'Local Data mode is active because live research is currently unavailable. I’ll answer using Xyrex’s stored executor data.\n\n' + getLocalAssistantFallback(userMessage));
    } finally {
      if (loadingInterval) { clearInterval(loadingInterval); loadingInterval = null; }
      input.disabled = false;
      sendBtn.disabled = false;
      input.focus();
    }
  });
}

const savedScriptsStorageKey = 'xyrex_saved_scripts_v1';
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
let activeSubtabId = 'smartRankingsPanel';
let suppressRouteSync = false;

const subtabPathSlugMap = {
  smartRankingsPanel: 'rankings',
  comparisonPanel: 'comparison',
  popularScriptsPanel: 'popularscripts',
  assistantPanel: 'assistant',
  savedScriptsPanel: 'savedscripts',
  recentChangesPanel: 'recentchanges'
};

const subtabPathToIdMap = Object.fromEntries(
  Object.entries(subtabPathSlugMap).map(([key, value]) => [value, key])
);
const SEO_DEFAULT_TITLE = 'Xyrex.lol | Roblox Executor Directory, sUNC Comparisons, and Script Hub';
const SEO_DEFAULT_DESCRIPTION = 'Xyrex.lol is a Roblox executor and script hub featuring executor comparisons, sUNC scores, platform filters, trusted reviews, popular scripts, and real-time updates.';
const SEO_DEFAULT_IMAGE = 'https://xyrex.lol/otherscripts/logo.png';
const SEO_PATH_META = {
  '/': {
    title: SEO_DEFAULT_TITLE,
    description: SEO_DEFAULT_DESCRIPTION
  },
  '/scripthub': {
    title: 'Xyrex Script Hub | Rankings, Comparisons, and Script Discovery',
    description: 'Explore the Xyrex Script Hub for executor rankings, trusted comparisons, popular scripts, saved scripts, and real-time Roblox script discovery updates.'
  },
  '/scripthub/comparison': {
    title: 'Executor Comparison | Xyrex Script Hub',
    description: 'Compare Roblox executors side by side with pricing, stability, trust level, and platform support in the Xyrex Script Hub.'
  },
  '/scripthub/popularscripts': {
    title: 'Popular Roblox Scripts | Xyrex Script Hub',
    description: 'Browse trending and popular Roblox scripts on Xyrex with clean discovery tools and organized script insights.'
  },
  '/scripthub/assistant': {
    title: 'Exploit Assistant | Xyrex Script Hub',
    description: 'Use the Xyrex Exploit Assistant to quickly find Roblox executor and script details from current hub data.'
  },
  '/scripthub/savedscripts': {
    title: 'Saved Scripts Manager | Xyrex Script Hub',
    description: 'Store, manage, and revisit your Roblox scripts with the Xyrex saved scripts manager in the Script Hub.'
  },
  '/scripthub/recentchanges': {
    title: 'Recent Updates | Xyrex Script Hub',
    description: 'Track real-time executor and script hub updates, changes, and improvements on Xyrex.'
  }
};

function updateSeoMetadata() {
  const currentPath = normalisePath(window.location.pathname).replace(/^\/newui/, '') || '/';
  const pageSeo = SEO_PATH_META[currentPath] || SEO_PATH_META['/'];
  const canonicalUrl = `https://xyrex.lol${currentPath === '/' ? '/' : currentPath}`;
  document.title = pageSeo.title;

  const upsertMeta = (selector, attrName, value) => {
    const element = document.querySelector(selector);
    if (!element) return;
    element.setAttribute(attrName, value);
  };

  upsertMeta('meta[name="description"]', 'content', pageSeo.description);
  upsertMeta('meta[property="og:title"]', 'content', pageSeo.title);
  upsertMeta('meta[property="og:description"]', 'content', pageSeo.description);
  upsertMeta('meta[property="og:url"]', 'content', canonicalUrl);
  upsertMeta('meta[name="twitter:title"]', 'content', pageSeo.title);
  upsertMeta('meta[name="twitter:description"]', 'content', pageSeo.description);
  upsertMeta('meta[name="twitter:image"]', 'content', SEO_DEFAULT_IMAGE);
  upsertMeta('meta[property="og:image"]', 'content', SEO_DEFAULT_IMAGE);

  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) canonical.setAttribute('href', canonicalUrl);
}

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
  let subtabId = 'smartRankingsPanel';

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
    if (subtabSegment && activeSubtabId !== 'smartRankingsPanel') return `${base}/scripthub/${subtabSegment}`;
    return `${base}/scripthub`;
  }


  return base || '/';
}

function syncRouteWithState(replace = false) {
  if (suppressRouteSync) return;
  const nextPath = buildPathFromState();
  if (normalisePath(window.location.pathname) === normalisePath(nextPath)) return;
  const method = replace ? 'replaceState' : 'pushState';
  window.history[method]({}, '', nextPath);
  updateSeoMetadata();
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
  updateSeoMetadata();
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

function shouldReduceMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
}

let activeSubtabTransitionToken = 0;


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
  qs('#sidebar').hidden = onScriptsPage;
  qs('#searchInput').disabled = onScriptsPage;
  qs('#clearSearchBtn').disabled = onScriptsPage;
  qs('.page-layout').classList.toggle('scripts-mode', onScriptsPage);
  document.body.classList.remove('easter-game-mode');

  syncRouteWithState();
}

function focusFirstElementInPanel(panel) {
  if (!panel) return;
  const focusable = panel.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  if (focusable) {
    focusable.focus();
    return;
  }
  panel.setAttribute('tabindex', '-1');
  panel.focus();
}

function setActiveSubtab(targetSubtabId, options = {}) {
  const { moveFocus = false } = options;
  if (targetSubtabId === activeSubtabId) {
    if (moveFocus) focusFirstElementInPanel(qs(`#${targetSubtabId}`));
    return;
  }

  const nextPanel = qs(`#${targetSubtabId}`);
  const previousPanel = qs(`#${activeSubtabId}`);
  if (!nextPanel) return;

  const wrapper = nextPanel.parentElement;
  const transitionToken = ++activeSubtabTransitionToken;
  const reduceMotion = shouldReduceMotion();

  if (!previousPanel || reduceMotion) {
    qsa('.subtab-panel').forEach(panel => {
      panel.hidden = panel.id !== targetSubtabId;
      panel.classList.remove('is-transitioning-out', 'is-transitioning-in', 'is-current');
      if (panel.id === targetSubtabId) panel.classList.add('is-current');
    });
    if (moveFocus) focusFirstElementInPanel(nextPanel);
  } else {
    const wrapperHeight = Math.max(previousPanel.offsetHeight, nextPanel.offsetHeight);
    wrapper.style.minHeight = `${wrapperHeight}px`;

    previousPanel.hidden = false;
    nextPanel.hidden = false;

    previousPanel.classList.remove('is-current', 'is-transitioning-in');
    previousPanel.classList.add('is-transitioning-out');

    nextPanel.classList.remove('is-transitioning-out');
    nextPanel.classList.add('is-transitioning-in', 'is-current');

    window.setTimeout(() => {
      if (transitionToken !== activeSubtabTransitionToken) return;
      previousPanel.hidden = true;
      previousPanel.classList.remove('is-transitioning-out');
      nextPanel.classList.remove('is-transitioning-in');
      wrapper.style.minHeight = '';
      if (moveFocus) focusFirstElementInPanel(nextPanel);
    }, 210);
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
  renderSmartRankings();
  renderComparisonSystem();
  renderPopularScripts();
  renderRecentChanges();
  renderSavedScriptsList();
  initExploitAssistant();

  const subtabButtons = qsa('.subtab-btn');
  subtabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-subtab-target');
      syncSubtabButtons(target);
      setActiveSubtab(target, { moveFocus: true });
    });

    btn.addEventListener('keydown', event => {
      const key = event.key;
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(key)) return;
      event.preventDefault();
      const currentIndex = subtabButtons.indexOf(btn);
      let nextIndex = currentIndex;
      if (key === 'ArrowLeft' || key === 'ArrowUp') nextIndex = (currentIndex - 1 + subtabButtons.length) % subtabButtons.length;
      if (key === 'ArrowRight' || key === 'ArrowDown') nextIndex = (currentIndex + 1) % subtabButtons.length;
      if (key === 'Home') nextIndex = 0;
      if (key === 'End') nextIndex = subtabButtons.length - 1;
      const nextButton = subtabButtons[nextIndex];
      if (!nextButton) return;
      nextButton.focus();
      const target = nextButton.getAttribute('data-subtab-target');
      syncSubtabButtons(target);
      setActiveSubtab(target, { moveFocus: true });
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


function hideInitialLoadingOverlay() {
  const overlay = qs('#appLoadingOverlay');
  if (!overlay) return;
  overlay.classList.add('is-hidden');
  window.setTimeout(() => {
    overlay.remove();
  }, 260);
}

function init() {
  setBetaFeaturesEnabled(getBetaFeaturesEnabled());
  syncNavigationLayoutMetrics();
  renderProducts(products);
  initScriptsHub();
  injectLegendIcons();

  qs('#searchInput').addEventListener('input', applyAllFilters);
  qs('#searchInput').addEventListener('keydown', e => {
    const searchInput = qs('#searchInput');
    const searchValue = searchInput.value.trim().toLowerCase();
    if (e.key !== 'Enter') return;

    e.preventDefault();
    applyAllFilters();

    searchInput.blur();
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

  applyRoute(getInitialRoutePath(), true).finally(() => {
    window.setTimeout(hideInitialLoadingOverlay, 1000);
  });
}

document.addEventListener('DOMContentLoaded', init);
