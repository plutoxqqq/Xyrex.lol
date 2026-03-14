(function () {
  const existing = window.__XYREX_SUPABASE_CONFIG && typeof window.__XYREX_SUPABASE_CONFIG === 'object'
    ? window.__XYREX_SUPABASE_CONFIG
    : {};

  const configured = {
    url: (existing.url || existing.supabaseUrl || '').trim(),
    anonKey: (existing.anonKey || existing.publishableKey || existing.supabaseAnonKey || existing.supabasePublishableKey || '').trim()
  };

  window.__XYREX_SUPABASE_CONFIG = configured;
})();
