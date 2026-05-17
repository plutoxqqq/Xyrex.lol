export function initSupabaseConfig() {
  const existing = window.__XYREX_SUPABASE_CONFIG && typeof window.__XYREX_SUPABASE_CONFIG === 'object'
    ? window.__XYREX_SUPABASE_CONFIG
    : {};

  const fromMeta = name => document.querySelector(`meta[name="${name}"]`)?.content || '';
  const pick = (...values) => {
    for (const value of values) {
      const normalized = typeof value === 'string' ? value.trim() : '';
      if (normalized) return normalized;
    }
    return '';
  };

  const configured = {
    url: pick(
      window.XYREX_SUPABASE_URL,
      window.SUPABASE_URL,
      existing.url,
      existing.supabaseUrl,
      fromMeta('xyrex-supabase-url')
    ).replace(/\/+$/, ''),
    anonKey: pick(
      window.XYREX_SUPABASE_ANON_KEY,
      window.XYREX_SUPABASE_PUBLISHABLE_KEY,
      window.SUPABASE_ANON_KEY,
      window.SUPABASE_PUBLISHABLE_KEY,
      existing.anonKey,
      existing.publishableKey,
      existing.supabaseAnonKey,
      existing.supabasePublishableKey,
      fromMeta('xyrex-supabase-anon-key')
    )
  };

  window.__XYREX_SUPABASE_CONFIG = Object.freeze(configured);
}
