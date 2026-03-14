(() => {
  const ACCOUNT_SCOPE = window.XyrexAccountScope;
  if (!ACCOUNT_SCOPE) return;

  const GLOBAL_PREFIX = '__xyrex_global__';
  const PROFILE_CACHE_KEY = `${GLOBAL_PREFIX}profile_cache_v2`;
  const REDIRECT_URL = `${window.location.origin}${window.location.pathname}`;
  const PROFILE_TABLE = 'xyrex_profiles';
  const USERNAME_REGEX = /^[a-z0-9._]{3,24}$/;
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  let supabaseClientPromise = null;
  let supabaseClient = null;
  let supabaseFactoryPromise = null;
  let activeProfile = null;
  let activeModalMode = 'login';

  function getConfigValue(candidates) {
    for (const item of candidates) {
      const value = typeof item === 'string' ? item.trim() : '';
      if (value) return value;
    }
    return '';
  }

  function resolveSupabaseConfig() {
    const globalConfig = window.__XYREX_SUPABASE_CONFIG && typeof window.__XYREX_SUPABASE_CONFIG === 'object'
      ? window.__XYREX_SUPABASE_CONFIG
      : {};

    const urlMeta = document.querySelector('meta[name="xyrex-supabase-url"]')?.content || '';
    const anonMeta = document.querySelector('meta[name="xyrex-supabase-anon-key"]')?.content || '';

    const url = getConfigValue([
      window.XYREX_SUPABASE_URL,
      window.SUPABASE_URL,
      globalConfig.url,
      globalConfig.supabaseUrl,
      urlMeta
    ]).replace(/\/+$/, '');

    const anonKey = getConfigValue([
      window.XYREX_SUPABASE_ANON_KEY,
      window.XYREX_SUPABASE_PUBLISHABLE_KEY,
      window.SUPABASE_ANON_KEY,
      window.SUPABASE_PUBLISHABLE_KEY,
      globalConfig.anonKey,
      globalConfig.publishableKey,
      globalConfig.supabaseAnonKey,
      globalConfig.supabasePublishableKey,
      anonMeta
    ]);

    return { url, anonKey };
  }

  let resolvedConfig = resolveSupabaseConfig();
  let authConfigured = Boolean(resolvedConfig.url && resolvedConfig.anonKey);
  const redactKey = key => {
    const value = String(key || '');
    if (!value) return '(missing)';
    if (value.length <= 8) return `${value.slice(0, 2)}***`;
    return `${value.slice(0, 4)}***${value.slice(-4)}`;
  };

  console.info('[XyrexAuth] Supabase config detection:', {
    configured: authConfigured,
    url: resolvedConfig.url || '(missing)',
    anonKey: redactKey(resolvedConfig.anonKey)
  });

  function normalizeUsername(value) {
    return String(value || '').trim().toLowerCase();
  }

  function validateUsername(username) {
    if (!USERNAME_REGEX.test(username)) {
      throw new Error('Username must be 3 to 24 characters and only include letters, numbers, underscores, or periods.');
    }
    return email;
  }

  function validateEmail(value) {
    const email = String(value || '').trim().toLowerCase();
    if (!EMAIL_REGEX.test(email)) throw new Error('Please enter a valid email address.');
    return email;
  }

  function validatePassword(value) {
    const password = String(value || '');
    if (password.length < 8) throw new Error('Password must be at least 8 characters long.');
    if (!/[A-Z]/.test(password)) throw new Error('Password must include at least one uppercase letter.');
    if (!/\d/.test(password)) throw new Error('Password must include at least one number.');
    return password;
  }

  function readStorage(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  function writeStorage(key, value) {
    try {
      if (value == null) localStorage.removeItem(key);
      else localStorage.setItem(key, value);
    } catch {
      // Ignore storage failures
    }
  }

  function getCachedProfile() {
    try {
      const parsed = JSON.parse(readStorage(PROFILE_CACHE_KEY) || 'null');
      return parsed && typeof parsed === 'object' ? parsed : null;
    } catch {
      return null;
    }
  }

  function setProfile(profile) {
    activeProfile = profile && typeof profile === 'object' ? profile : null;
    if (activeProfile) writeStorage(PROFILE_CACHE_KEY, JSON.stringify(activeProfile));
    else writeStorage(PROFILE_CACHE_KEY, null);
  }

  function notifyAccountChange() {
    window.dispatchEvent(new CustomEvent('xyrex:account-changed', {
      detail: { username: ACCOUNT_SCOPE.getAccount?.() || 'guest' }
    }));
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[data-xyrex-supabase-src="${src}"]`);
      if (existing && existing.getAttribute('data-loaded') === 'true') {
        resolve(true);
        return;
      }
      const script = existing || document.createElement('script');
      script.async = true;
      script.src = src;
      script.dataset.xyrexSupabaseSrc = src;
      script.onload = () => {
        script.setAttribute('data-loaded', 'true');
        resolve(true);
      };
      script.onerror = () => reject(new Error(`Failed to load Supabase script: ${src}`));
      if (!existing) document.head.appendChild(script);
    });
  }

  async function getSupabaseFactory() {
    if (window.supabase?.createClient) return window.supabase.createClient;
    if (supabaseFactoryPromise) return supabaseFactoryPromise;

    supabaseFactoryPromise = (async () => {
      const importCandidates = [
        'https://esm.sh/@supabase/supabase-js@2',
        'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'
      ];

      for (const source of importCandidates) {
        try {
          const module = await import(source);
          if (typeof module?.createClient === 'function') return module.createClient;
        } catch {
          // Try the next source
        }
      }

      const scriptCandidates = [
        'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js',
        'https://unpkg.com/@supabase/supabase-js@2/dist/umd/supabase.min.js'
      ];

      for (const source of scriptCandidates) {
        try {
          await loadScript(source);
          if (window.supabase?.createClient) return window.supabase.createClient;
        } catch {
          // Try the next source
        }
      }

      throw new Error('Unable to load Supabase client library.');
    })();

    return supabaseFactoryPromise;
  }

  async function getSupabaseClient() {
    if (supabaseClient) return supabaseClient;
    if (supabaseClientPromise) return supabaseClientPromise;

    supabaseClientPromise = (async () => {
      resolvedConfig = resolveSupabaseConfig();
      authConfigured = Boolean(resolvedConfig.url && resolvedConfig.anonKey);
      if (!authConfigured) return null;

      try {
        const createClient = await getSupabaseFactory();
        const client = createClient(resolvedConfig.url, resolvedConfig.anonKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
          }
        });
        supabaseClient = client;
        return client;
      } catch {
        return null;
      }
    })();

    return supabaseClientPromise;
  }

  async function requireClient() {
    const client = await getSupabaseClient();
    if (!client) {
      if (!authConfigured) throw new Error('Supabase auth is not configured for this deployment yet.');
      throw new Error('Supabase auth client could not be initialized. Please try again shortly.');
    }
    return client;
  }

  async function getProfileByUsername(client, username) {
    const { data, error } = await client
      .from(PROFILE_TABLE)
      .select('*')
      .eq('username', username)
      .limit(1)
      .maybeSingle();

    if (error) throw new Error(error.message || 'Unable to fetch account profile.');
    return data || null;
  }

  async function getProfileByUserId(client, userId) {
    const { data, error } = await client
      .from(PROFILE_TABLE)
      .select('*')
      .eq('user_id', userId)
      .limit(1)
      .maybeSingle();

    if (error) throw new Error(error.message || 'Unable to fetch account profile.');
    return data || null;
  }

  async function ensureProfileForUser(client, user, fallbackUsername = '') {
    if (!user?.id) throw new Error('Missing authenticated user.');

    let profile = await getProfileByUserId(client, user.id);
    if (profile) {
      setProfile(profile);
      ACCOUNT_SCOPE.setAccount(profile.username || 'guest');
      return profile;
    }

    const username = normalizeUsername(fallbackUsername || user?.user_metadata?.username || user?.email?.split('@')[0] || 'guest');
    validateUsername(username);

    const { error: insertError } = await client
      .from(PROFILE_TABLE)
      .insert({
        user_id: user.id,
        username,
        email: String(user.email || '').toLowerCase(),
        progress: {
          dodge: {
            coins: 0,
            bestScore: 0,
            ownedModifiers: ['Balanced'],
            selectedModifier: 'Balanced',
            ownedPowerups: [],
            selectedPowerup: 'None',
            aiTokenDate: '',
            aiTokensUsedToday: 0,
            aiPurchasedTokens: 0,
            activeCheats: []
          }
        }
      });

    if (insertError) throw new Error(insertError.message || 'Unable to initialize account profile.');

    profile = await getProfileByUserId(client, user.id);
    if (!profile) throw new Error('Unable to initialize account profile.');

    setProfile(profile);
    ACCOUNT_SCOPE.setAccount(profile.username || 'guest');
    return profile;
  }

  async function signUp(usernameRaw, emailRaw, passwordRaw) {
    const client = await requireClient();
    const username = normalizeUsername(usernameRaw);
    validateUsername(username);
    const email = validateEmail(emailRaw);
    const password = validatePassword(passwordRaw);

    const existing = await getProfileByUsername(client, username);
    if (existing) throw new Error('That username is already registered.');

    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        data: { username },
        emailRedirectTo: REDIRECT_URL
      }
    });

    if (error) throw new Error(error.message || 'Unable to complete sign up.');
    if (!data?.user) throw new Error('Unable to complete sign up.');
    if (!data?.session) throw new Error('Sign up succeeded. Please verify your email address before signing in.');

    await ensureProfileForUser(client, data.user, username);
    return username;
  }

  async function login(usernameRaw, passwordRaw) {
    const client = await requireClient();
    const username = normalizeUsername(usernameRaw);
    validateUsername(username);

    const password = String(passwordRaw || '');
    if (!password) throw new Error('Please provide your password.');

    const profile = await getProfileByUsername(client, username);
    if (!profile?.email) throw new Error('Account not found.');

    const { data, error } = await client.auth.signInWithPassword({
      email: profile.email,
      password
    });

    if (error) throw new Error(error.message || 'Login failed.');
    if (!data?.user) throw new Error('Login failed.');

    await ensureProfileForUser(client, data.user, username);
    return username;
  }

  async function sendResetEmail(identifierRaw) {
    const client = await requireClient();
    const identifier = String(identifierRaw || '').trim().toLowerCase();
    if (!identifier) throw new Error('Please enter your username or email address.');

    let email = identifier;
    if (!EMAIL_REGEX.test(identifier)) {
      const profile = await getProfileByUsername(client, identifier);
      if (!profile?.email) throw new Error('Account not found.');
      email = profile.email;
    }

    const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo: REDIRECT_URL });
    if (error) throw new Error(error.message || 'Failed to send reset email.');
  }

  async function updateRecoveredPassword(passwordRaw) {
    const client = await requireClient();
    const password = validatePassword(passwordRaw);
    const { error } = await client.auth.updateUser({ password });
    if (error) throw new Error(error.message || 'Failed to update password.');
  }

  async function logout() {
    const client = await getSupabaseClient();
    if (client) {
      try {
        await client.auth.signOut();
      } catch {
        // Ignore transient signout errors
      }
    }

    setProfile(null);
    ACCOUNT_SCOPE.setAccount('guest');
  }

  async function restoreSession() {
    const client = await getSupabaseClient();
    if (!client) {
      setProfile(getCachedProfile());
      return;
    }

    try {
      const { data } = await client.auth.getSession();
      const user = data?.session?.user || null;
      if (!user) {
        setProfile(null);
        ACCOUNT_SCOPE.setAccount('guest');
        return;
      }
      await ensureProfileForUser(client, user);
    } catch {
      setProfile(null);
      ACCOUNT_SCOPE.setAccount('guest');
    }
  }

  async function loadAccountProgress(scope = 'dodge') {
    const client = await getSupabaseClient();
    if (!client) return null;

    try {
      const { data } = await client.auth.getSession();
      const userId = data?.session?.user?.id;
      if (!userId) return null;

      const profile = await getProfileByUserId(client, userId);
      if (!profile) return null;
      setProfile(profile);

      const progress = profile.progress && typeof profile.progress === 'object' ? profile.progress : {};
      return progress[scope] && typeof progress[scope] === 'object' ? progress[scope] : null;
    } catch {
      return null;
    }
  }

  async function saveAccountProgress(scope = 'dodge', payload = {}) {
    const client = await getSupabaseClient();
    if (!client || !activeProfile?.user_id) return false;

    try {
      const progress = activeProfile.progress && typeof activeProfile.progress === 'object' ? { ...activeProfile.progress } : {};
      progress[scope] = { ...(payload || {}) };

      const { data, error } = await client
        .from(PROFILE_TABLE)
        .update({ progress, updated_at: new Date().toISOString() })
        .eq('user_id', activeProfile.user_id)
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) return false;
      if (data) setProfile(data);
      return true;
    } catch {
      return false;
    }
  }

  function ensureModal() {
    if (document.getElementById('xyAuthModal')) return;

    const modal = document.createElement('div');
    modal.id = 'xyAuthModal';
    modal.className = 'xy-auth-modal';
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = `
      <section class="xy-auth-panel" role="dialog" aria-modal="true" aria-label="Account authentication">
        <header class="xy-auth-head">
          <h3 id="xyAuthTitle">Account</h3>
          <button type="button" class="xy-auth-close" aria-label="Close authentication">✕</button>
        </header>
        <div class="xy-auth-body">
          <label class="xy-auth-label" for="xyAuthUser">Username</label>
          <input id="xyAuthUser" class="xy-auth-input" type="text" autocomplete="username" placeholder="your_username" />

          <div id="xyAuthEmailWrap" hidden>
            <label class="xy-auth-label" for="xyAuthEmail">Email</label>
            <input id="xyAuthEmail" class="xy-auth-input" type="email" autocomplete="email" placeholder="you@example.com" />
          </div>

          <div id="xyAuthPassWrap">
            <label class="xy-auth-label" for="xyAuthPass">Password</label>
            <input id="xyAuthPass" class="xy-auth-input" type="password" autocomplete="current-password" placeholder="8+ chars, uppercase, number" />
          </div>

          <div id="xyAuthNewPassWrap" hidden>
            <label class="xy-auth-label" for="xyAuthNewPass">New password</label>
            <input id="xyAuthNewPass" class="xy-auth-input" type="password" autocomplete="new-password" placeholder="8+ chars, uppercase, number" />
          </div>

          <p class="xy-auth-note">Usernames support letters, numbers, underscores, and periods.</p>
          <p id="xyAuthStatus" class="xy-auth-status" hidden></p>

          <div class="xy-auth-actions">
            <button type="button" id="xyAuthSubmit" class="btn-primary">Continue</button>
            <button type="button" id="xyAuthReset" class="btn-primary settings-action-btn">Reset Password</button>
          </div>
        </div>
      </section>
    `;

    document.body.appendChild(modal);

    const close = () => {
      modal.setAttribute('aria-hidden', 'true');
      const status = modal.querySelector('#xyAuthStatus');
      status.hidden = true;
      status.textContent = '';
    };

    modal.querySelector('.xy-auth-close').addEventListener('click', close);
    modal.addEventListener('click', event => {
      if (event.target === modal) close();
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') close();
    });
  }

  function setBusy(modal, busy) {
    modal.querySelectorAll('input, button').forEach(element => {
      if (element.classList.contains('xy-auth-close')) return;
      element.disabled = busy;
    });
  }

  function showStatus(modal, message, mode = 'error') {
    const status = modal.querySelector('#xyAuthStatus');
    status.hidden = false;
    status.textContent = message;
    status.className = `xy-auth-status ${mode}`;
  }

  function syncModalUi(modal) {
    const isSignUp = activeModalMode === 'signup';
    const isRecovery = activeModalMode === 'recovery';

    modal.querySelector('#xyAuthTitle').textContent = isRecovery ? 'Set New Password' : isSignUp ? 'Create Account' : 'Login';
    modal.querySelector('#xyAuthSubmit').textContent = isRecovery ? 'Update Password' : isSignUp ? 'Create Account' : 'Login';
    modal.querySelector('#xyAuthPassWrap').hidden = isRecovery;
    modal.querySelector('#xyAuthEmailWrap').hidden = !isSignUp;
    modal.querySelector('#xyAuthReset').hidden = isRecovery;
    modal.querySelector('#xyAuthNewPassWrap').hidden = !isRecovery;
  }

  function openAuthModal(mode = 'login') {
    activeModalMode = mode;
    ensureModal();

    const modal = document.getElementById('xyAuthModal');
    if (!modal) return;

    syncModalUi(modal);
    modal.setAttribute('aria-hidden', 'false');
    modal.querySelector('#xyAuthStatus').hidden = true;
    modal.querySelector('#xyAuthStatus').textContent = '';

    const submit = modal.querySelector('#xyAuthSubmit');
    const reset = modal.querySelector('#xyAuthReset');

    submit.onclick = async () => {
      const username = modal.querySelector('#xyAuthUser').value;
      const email = modal.querySelector('#xyAuthEmail').value;
      const password = modal.querySelector('#xyAuthPass').value;
      const newPassword = modal.querySelector('#xyAuthNewPass').value;

      setBusy(modal, true);
      try {
        if (activeModalMode === 'signup') {
          const account = await signUp(username, email, password);
          showStatus(modal, `Signed in as ${account}.`, 'success');
        } else if (activeModalMode === 'recovery') {
          await updateRecoveredPassword(newPassword);
          showStatus(modal, 'Password updated. You can now log in with your new password.', 'success');
          activeModalMode = 'login';
          syncModalUi(modal);
        } else {
          const account = await login(username, password);
          showStatus(modal, `Signed in as ${account}.`, 'success');
        }

        notifyAccountChange();
      } catch (error) {
        showStatus(modal, error?.message || 'Authentication failed.', 'error');
      } finally {
        setBusy(modal, false);
      }
    };

    reset.onclick = async () => {
      const identifier = modal.querySelector('#xyAuthUser').value || modal.querySelector('#xyAuthEmail').value;
      setBusy(modal, true);
      try {
        await sendResetEmail(identifier);
        showStatus(modal, 'Password reset email sent. Please check your inbox.', 'success');
      } catch (error) {
        showStatus(modal, error?.message || 'Failed to send reset email.', 'error');
      } finally {
        setBusy(modal, false);
      }
    };

    modal.querySelector('#xyAuthUser').focus();
  }

  const originalClearAccount = typeof ACCOUNT_SCOPE.clearAccount === 'function'
    ? ACCOUNT_SCOPE.clearAccount.bind(ACCOUNT_SCOPE)
    : null;

  ACCOUNT_SCOPE.clearAccount = async () => {
    await logout();
    if (originalClearAccount) originalClearAccount();
    notifyAccountChange();
  };

  window.XyrexAuth = {
    openAuthModal,
    async resetPassword() {
      const identifier = window.prompt('Enter your username or email:') || '';
      await sendResetEmail(identifier);
      return true;
    },
    async logout() {
      await logout();
      notifyAccountChange();
    },
    getCurrentAccount() {
      return ACCOUNT_SCOPE.getAccount?.() || 'guest';
    },
    getProfile() {
      return activeProfile;
    },
    hasRemoteSync() {
      resolvedConfig = resolveSupabaseConfig();
      authConfigured = Boolean(resolvedConfig.url && resolvedConfig.anonKey);
      return authConfigured;
    },
    loadAccountProgress,
    saveAccountProgress,
    async initialize() {
      const client = await getSupabaseClient();

      if (client) {
        client.auth.onAuthStateChange(async (_event, session) => {
          const user = session?.user || null;
          if (!user) {
            setProfile(null);
            ACCOUNT_SCOPE.setAccount('guest');
            notifyAccountChange();
            return;
          }

          try {
            await ensureProfileForUser(client, user);
          } catch {
            ACCOUNT_SCOPE.setAccount('guest');
          }

          notifyAccountChange();
        });
      }

      await restoreSession();
      notifyAccountChange();
    }
  };

  window.XyrexAuth.initialize();
})();
