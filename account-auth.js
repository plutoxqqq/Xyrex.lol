(() => {
  const ACCOUNT_SCOPE = window.XyrexAccountScope;
  if (!ACCOUNT_SCOPE) return;

  const GLOBAL_PREFIX = '__xyrex_global__';
  const PROFILE_CACHE_KEY = `${GLOBAL_PREFIX}profile_cache_v3`;
  const REDIRECT_URL = `${window.location.origin}${window.location.pathname}`;
  const PROFILE_TABLE = 'xyrex_profiles';
  const USERNAME_REGEX = /^[a-z0-9._]{3,24}$/;
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const AUTH_TIMEOUT_MS = 15000;

  let supabaseClientPromise = null;
  let supabaseClient = null;
  let supabaseFactoryPromise = null;
  let activeProfile = null;
  let activeModalMode = 'login';
  let isAuthBusy = false;
  let authInitialized = false;
  let authStateSubscription = null;
  let lastNotifiedAccount = null;

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

  function normalizeUsername(value) {
    return String(value || '').trim().toLowerCase();
  }

  function validateUsername(usernameRaw) {
    const username = normalizeUsername(usernameRaw);
    if (!USERNAME_REGEX.test(username)) {
      throw new Error('Username must be 3 to 24 characters and only include letters, numbers, underscores, or periods.');
    }
    return username;
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

  function withTimeout(promise, ms, message) {
    return Promise.race([
      promise,
      new Promise((_, reject) => {
        window.setTimeout(() => reject(new Error(message)), ms);
      })
    ]);
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

  function setCurrentAccount(username) {
    ACCOUNT_SCOPE.setAccount(username || 'guest');
  }

  function notifyAccountChange() {
    const account = ACCOUNT_SCOPE.getAccount?.() || 'guest';
    if (account === lastNotifiedAccount) return;
    lastNotifiedAccount = account;

    window.dispatchEvent(new CustomEvent('xyrex:account-changed', {
      detail: {
        username: account,
        configured: authConfigured,
        profileReady: Boolean(activeProfile)
      }
    }));
  }

  function emitAuthConfigEvent() {
    window.dispatchEvent(new CustomEvent('xyrex:auth-config', {
      detail: {
        configured: authConfigured,
        url: resolvedConfig.url || ''
      }
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
          // Try next source
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
          // Try next source
        }
      }

      throw new Error('Unable to load the Supabase client library.');
    })();

    return supabaseFactoryPromise;
  }

  async function getSupabaseClient() {
    if (supabaseClient) return supabaseClient;
    if (supabaseClientPromise) return supabaseClientPromise;

    supabaseClientPromise = (async () => {
      resolvedConfig = resolveSupabaseConfig();
      authConfigured = Boolean(resolvedConfig.url && resolvedConfig.anonKey);
      emitAuthConfigEvent();

      if (!authConfigured) return null;

      try {
        const createClient = await withTimeout(getSupabaseFactory(), AUTH_TIMEOUT_MS, 'Loading auth provider timed out.');
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
      if (!authConfigured) throw new Error('Account auth is not configured for this deployment yet.');
      throw new Error('Account auth could not be initialized. Please try again shortly.');
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

  async function checkUsernameExists(client, username) {
    try {
      const { data, error } = await client.rpc('xyrex_username_exists', { input_username: username });
      if (error) return false;
      return Boolean(data);
    } catch {
      return false;
    }
  }

  async function lookupLoginEmailByUsername(client, username) {
    try {
      const { data, error } = await client.rpc('xyrex_lookup_login_email', { input_username: username });
      if (error) return '';
      return String(data || '').trim().toLowerCase();
    } catch {
      return '';
    }
  }

  function getCandidateUsernames(user, fallbackUsername = '') {
    const candidates = [
      fallbackUsername,
      user?.user_metadata?.username,
      user?.email?.split('@')[0],
      `user_${String(user?.id || '').slice(0, 8)}`
    ];

    const unique = [];
    for (const raw of candidates) {
      const normalized = normalizeUsername(raw);
      if (!normalized) continue;
      if (!unique.includes(normalized)) unique.push(normalized);
    }
    return unique;
  }

  async function insertProfile(client, user, username) {
    const payload = {
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
    };

    const { error } = await client
      .from(PROFILE_TABLE)
      .upsert(payload, { onConflict: 'user_id', ignoreDuplicates: false });

    if (error) throw error;
  }

  async function ensureProfileForUser(client, user, fallbackUsername = '') {
    if (!user?.id) throw new Error('Missing authenticated user.');

    let profile = await getProfileByUserId(client, user.id);
    if (profile) {
      setProfile(profile);
      setCurrentAccount(profile.username || 'guest');
      return profile;
    }

    const candidates = getCandidateUsernames(user, fallbackUsername);
    let lastInsertError = null;

    for (const candidate of candidates) {
      try {
        const username = validateUsername(candidate);
        await insertProfile(client, user, username);
        profile = await getProfileByUserId(client, user.id);
        if (profile) {
          setProfile(profile);
          setCurrentAccount(profile.username || 'guest');
          return profile;
        }
      } catch (error) {
        lastInsertError = error;
      }
    }

    throw new Error(lastInsertError?.message || 'Unable to initialize account profile.');
  }

  async function signUp(usernameRaw, emailRaw, passwordRaw) {
    const client = await requireClient();
    const username = validateUsername(usernameRaw);
    const email = validateEmail(emailRaw);
    const password = validatePassword(passwordRaw);

    const usernameExists = await checkUsernameExists(client, username);
    if (usernameExists) throw new Error('That username is already registered.');

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

    if (data.session?.user) {
      await ensureProfileForUser(client, data.user, username);
      return { username, pendingVerification: false };
    }

    return { username, pendingVerification: true };
  }

  async function resolveLoginEmail(client, identifierRaw) {
    const identifier = String(identifierRaw || '').trim().toLowerCase();
    if (!identifier) throw new Error('Please provide your username or email address.');
    if (EMAIL_REGEX.test(identifier)) return identifier;

    const username = validateUsername(identifier);
    const rpcEmail = await lookupLoginEmailByUsername(client, username);
    if (rpcEmail) return rpcEmail;

    const profile = await getProfileByUsername(client, username);
    if (profile?.email) return String(profile.email).toLowerCase();

    throw new Error('Account not found. You can also log in directly with your email address.');
  }

  async function login(identifierRaw, passwordRaw) {
    const client = await requireClient();
    const email = await resolveLoginEmail(client, identifierRaw);

    const password = String(passwordRaw || '');
    if (!password) throw new Error('Please provide your password.');

    const { data, error } = await client.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw new Error(error.message || 'Login failed.');
    if (!data?.user) throw new Error('Login failed.');

    const profile = await ensureProfileForUser(client, data.user);
    return profile?.username || data.user.email || 'account';
  }

  async function sendResetEmail(identifierRaw) {
    const client = await requireClient();
    const email = await resolveLoginEmail(client, identifierRaw);

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
    setCurrentAccount('guest');
  }

  async function restoreSession() {
    const client = await getSupabaseClient();
    if (!client) {
      setProfile(getCachedProfile());
      if (!activeProfile) setCurrentAccount('guest');
      else setCurrentAccount(activeProfile.username || 'guest');
      return;
    }

    try {
      const { data } = await withTimeout(client.auth.getSession(), AUTH_TIMEOUT_MS, 'Session restore timed out.');
      const user = data?.session?.user || null;
      if (!user) {
        setProfile(null);
        setCurrentAccount('guest');
        return;
      }
      await ensureProfileForUser(client, user);
    } catch {
      setProfile(null);
      setCurrentAccount('guest');
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
      if (!profile) {
        await ensureProfileForUser(client, data.session.user);
        return null;
      }

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
      if (data) {
        setProfile(data);
        setCurrentAccount(data.username || 'guest');
      }
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
          <label class="xy-auth-label" for="xyAuthUser">Username or email</label>
          <input id="xyAuthUser" class="xy-auth-input" type="text" autocomplete="username" placeholder="your_username or you@example.com" />

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
      if (isAuthBusy) return;
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
    isAuthBusy = busy;
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
    if (!authConfigured) {
      window.dispatchEvent(new CustomEvent('xyrex:auth-feedback', {
        detail: { message: 'Account auth is not configured on this deployment.' }
      }));
      return;
    }

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
      if (isAuthBusy) return;

      const identifier = modal.querySelector('#xyAuthUser').value;
      const email = modal.querySelector('#xyAuthEmail').value;
      const password = modal.querySelector('#xyAuthPass').value;
      const newPassword = modal.querySelector('#xyAuthNewPass').value;

      setBusy(modal, true);
      try {
        if (activeModalMode === 'signup') {
          const result = await withTimeout(signUp(identifier, email, password), AUTH_TIMEOUT_MS, 'Sign up request timed out.');
          if (result.pendingVerification) {
            showStatus(modal, 'Account created. Check your email to verify your account, then log in.', 'success');
          } else {
            showStatus(modal, `Signed in as ${result.username}.`, 'success');
          }
        } else if (activeModalMode === 'recovery') {
          await withTimeout(updateRecoveredPassword(newPassword), AUTH_TIMEOUT_MS, 'Password update timed out.');
          showStatus(modal, 'Password updated. You can now log in with your new password.', 'success');
          activeModalMode = 'login';
          syncModalUi(modal);
        } else {
          const account = await withTimeout(login(identifier, password), AUTH_TIMEOUT_MS, 'Login request timed out.');
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
      if (isAuthBusy) return;

      const identifier = modal.querySelector('#xyAuthUser').value || modal.querySelector('#xyAuthEmail').value;
      setBusy(modal, true);
      try {
        await withTimeout(sendResetEmail(identifier), AUTH_TIMEOUT_MS, 'Password reset request timed out.');
        showStatus(modal, 'Password reset email sent. Please check your inbox.', 'success');
      } catch (error) {
        showStatus(modal, error?.message || 'Failed to send reset email.', 'error');
      } finally {
        setBusy(modal, false);
      }
    };

    modal.querySelector('#xyAuthUser').focus();
  }

  function isRecoverySession() {
    const hash = window.location.hash || '';
    return hash.includes('type=recovery') && hash.includes('access_token=');
  }

  function clearRecoveryHash() {
    if (!window.location.hash) return;
    if (!window.history?.replaceState) return;
    const cleanUrl = `${window.location.pathname}${window.location.search}`;
    window.history.replaceState({}, document.title, cleanUrl);
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
    async resetPassword(identifier = '') {
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
    isReady() {
      return authInitialized;
    },
    loadAccountProgress,
    saveAccountProgress,
    async initialize() {
      if (authInitialized) return;
      authInitialized = true;

      const client = await getSupabaseClient();

      if (client && !authStateSubscription) {
        const { data } = client.auth.onAuthStateChange(async (_event, session) => {
          const user = session?.user || null;
          if (!user) {
            setProfile(null);
            setCurrentAccount('guest');
            notifyAccountChange();
            return;
          }

          try {
            await ensureProfileForUser(client, user);
          } catch {
            setCurrentAccount('guest');
          }

          notifyAccountChange();
        });
        authStateSubscription = data?.subscription || null;
      }

      await restoreSession();
      notifyAccountChange();
      window.dispatchEvent(new CustomEvent('xyrex:auth-ready', {
        detail: {
          configured: authConfigured,
          account: ACCOUNT_SCOPE.getAccount?.() || 'guest'
        }
      }));

      if (isRecoverySession()) {
        openAuthModal('recovery');
        clearRecoveryHash();
      }
    }
  };

  emitAuthConfigEvent();
  window.XyrexAuth.initialize();
})();
