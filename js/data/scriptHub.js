export const XYREX_OFFICIAL_DISCORD_URL = 'https://discord.gg/4Vykhpvh';
export const discordWordmarkSvg = '<svg viewBox="0 0 127.14 96.36" aria-hidden="true" focusable="false"><path fill="currentColor" d="M107.7 8.07A105.15 105.15 0 0081.47 0a72.06 72.06 0 00-3.36 6.83 97.68 97.68 0 00-29.94 0A72.37 72.37 0 0044.8 0 105.89 105.89 0 0018.57 8.08C1.03 34.37-3.72 60 1.39 85.28A105.73 105.73 0 0033.32 96a77.7 77.7 0 006.84-11.16 68.42 68.42 0 01-10.78-5.15c.91-.67 1.8-1.37 2.66-2.09a75.57 75.57 0 0063.48 0c.87.72 1.76 1.42 2.67 2.09a68.68 68.68 0 01-10.8 5.16A77.53 77.53 0 0094.24 96a105.25 105.25 0 0031.91-10.72c6-29.3-1-54.68-18.45-77.21zM42.45 65.69c-6.23 0-11.33-5.69-11.33-12.69s5-12.7 11.33-12.7S53.78 46 53.78 53s-5.03 12.69-11.33 12.69zm42.24 0c-6.23 0-11.33-5.69-11.33-12.69s5-12.7 11.33-12.7S96.02 46 96.02 53s-5.03 12.69-11.33 12.69z"/></svg>';
export const scriptsHubData = {
  tierListPaid: [
    { tier: 'S', executor: 'Pluton', notes: 'Top paid pick for balanced performance, consistency, and support coverage' },
    { tier: 'A', executor: 'Potassium', notes: 'Strong feature depth with excellent sUNC support, but trust concerns remain' },
    { tier: 'A', executor: 'Seliware', notes: 'Smooth execution and polished UX, with occasional detection instability' },
    { tier: 'B', executor: 'Volcano', notes: 'Stable long-term option with reliable execution, but comparatively expensive' }
  ],
  tierListFree: [
    { tier: 'S', executor: 'Pluton', notes: 'Best free overall package right now with broad platform support' },
    { tier: 'A', executor: 'Velocity', notes: 'Fast keyless free option with modern tooling and customization' },
    { tier: 'A', executor: 'Solara', notes: 'Reliable free Windows option with steady day-to-day stability' },
    { tier: 'B', executor: 'JJSploit', notes: 'Beginner-friendly choice with a simplified workflow' }
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
