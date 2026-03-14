(() => {
  const GLOBAL_PREFIX = '__xyrex_global__';
  const SESSION_KEY = `${GLOBAL_PREFIX}auth_session_v2`;
  const PROFILE_CACHE_KEY = `${GLOBAL_PREFIX}profile_cache_v2`;
  const ACCOUNT_SCOPE = window.XyrexAccountScope;
  if (!ACCOUNT_SCOPE) return;

  const SUPABASE_URL = typeof window.XYREX_SUPABASE_URL === 'string' ? window.XYREX_SUPABASE_URL.trim().replace(/\/+$/, '') : '';
  const SUPABASE_ANON_KEY = typeof window.XYREX_SUPABASE_ANON_KEY === 'string' ? window.XYREX_SUPABASE_ANON_KEY.trim() : '';
  const AUTH_READY = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

  const USERNAME_REGEX = /^[a-z0-9._]{3,24}$/;
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const PROFILE_TABLE = 'xyrex_profiles';
  const REDIRECT_URL = `${window.location.origin}${window.location.pathname}`;

  let activeSession = null;
  let activeProfile = null;
  let activeModalMode = 'login';

  const readGlobalStorage = key => {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  };

  const writeGlobalStorage = (key, value) => {
    if (value == null) {
      window.localStorage.removeItem(key);
      return;
    }
    window.localStorage.setItem(key, value);
  };

  function normalizeUsername(value) {
    return String(value || '').trim().toLowerCase();
  }

  function validateUsername(username) {
    if (!USERNAME_REGEX.test(username)) {
      throw new Error('Username must be 3 to 24 characters and only include letters, numbers, underscores, or periods.');
    }
  }

  function validateEmail(emailRaw) {
    const email = String(emailRaw || '').trim().toLowerCase();
    if (!EMAIL_REGEX.test(email)) {
      throw new Error('Please enter a valid email address.');
    }
    return email;
  }

  function validatePassword(passwordRaw) {
    const password = String(passwordRaw || '');
    if (password.length < 8) throw new Error('Password must be at least 8 characters long.');
    if (!/[A-Z]/.test(password)) throw new Error('Password must include at least one uppercase letter.');
    if (!/\d/.test(password)) throw new Error('Password must include at least one number.');
    return password;
  }

  async function request(path, options = {}, accessToken = '') {
    const headers = {
      apikey: SUPABASE_ANON_KEY,
      ...(options.headers || {})
    };
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

    const response = await fetch(`${SUPABASE_URL}${path}`, {
      ...options,
      headers
    });

    let payload = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    if (!response.ok) {
      const message = payload?.msg || payload?.error_description || payload?.message || 'Authentication request failed.';
      throw new Error(message);
    }

    return payload;
  }

  function setSession(session) {
    activeSession = session && typeof session === 'object' ? session : null;
    if (!activeSession) {
      writeGlobalStorage(SESSION_KEY, null);
      return;
    }
    writeGlobalStorage(SESSION_KEY, JSON.stringify(activeSession));
  }

  function setProfile(profile) {
    activeProfile = profile && typeof profile === 'object' ? profile : null;
    if (activeProfile) {
      writeGlobalStorage(PROFILE_CACHE_KEY, JSON.stringify(activeProfile));
    } else {
      writeGlobalStorage(PROFILE_CACHE_KEY, null);
    }
  }

  function getCachedProfile() {
    try {
      const parsed = JSON.parse(readGlobalStorage(PROFILE_CACHE_KEY) || 'null');
      return parsed && typeof parsed === 'object' ? parsed : null;
    } catch {
      return null;
    }
  }

  async function getProfileByUsername(username) {
    const rows = await request(
      `/rest/v1/${PROFILE_TABLE}?select=*&username=eq.${encodeURIComponent(username)}&limit=1`,
      { headers: { Accept: 'application/json' } }
    );
    return Array.isArray(rows) && rows[0] ? rows[0] : null;
  }

  async function getProfileByUserId(userId, accessToken) {
    const rows = await request(
      `/rest/v1/${PROFILE_TABLE}?select=*&user_id=eq.${encodeURIComponent(userId)}&limit=1`,
      { headers: { Accept: 'application/json' } },
      accessToken
    );
    return Array.isArray(rows) && rows[0] ? rows[0] : null;
  }

  async function ensureProfileForUser(user, accessToken, fallbackUsername = '') {
    const userId = user?.id;
    if (!userId) throw new Error('Missing authenticated user.');

    let profile = await getProfileByUserId(userId, accessToken);
    if (profile) {
      setProfile(profile);
      ACCOUNT_SCOPE.setAccount(profile.username || 'guest');
      return profile;
    }

    const username = normalizeUsername(fallbackUsername || user?.user_metadata?.username || user?.email?.split('@')[0] || 'guest');
    validateUsername(username);

    const insertPayload = {
      user_id: userId,
      username,
      email: String(user?.email || '').toLowerCase(),
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

    await request(`/rest/v1/${PROFILE_TABLE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Prefer: 'return=representation'
      },
      body: JSON.stringify(insertPayload)
    }, accessToken);

    profile = await getProfileByUserId(userId, accessToken);
    if (!profile) throw new Error('Unable to initialize profile data.');
    setProfile(profile);
    ACCOUNT_SCOPE.setAccount(profile.username || 'guest');
    return profile;
  }

  async function refreshSessionIfNeeded() {
    if (!activeSession?.refresh_token) return null;
    const expiresAt = Number(activeSession?.expires_at || 0);
    if (expiresAt > Math.floor(Date.now() / 1000) + 30) return activeSession;

    const refreshed = await request('/auth/v1/token?grant_type=refresh_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: activeSession.refresh_token })
    });

    setSession(refreshed);
    return refreshed;
  }

  async function hydrateFromStoredSession() {
    if (!AUTH_READY) {
      setProfile(getCachedProfile());
      return;
    }

    try {
      const storedSession = JSON.parse(readGlobalStorage(SESSION_KEY) || 'null');
      if (!storedSession?.access_token) return;
      setSession(storedSession);
      await refreshSessionIfNeeded();
      const userPayload = await request('/auth/v1/user', { headers: { Accept: 'application/json' } }, activeSession.access_token);
      await ensureProfileForUser(userPayload, activeSession.access_token);
    } catch {
      setSession(null);
      setProfile(null);
      ACCOUNT_SCOPE.clearAccount();
    }
  }

  async function signUp(usernameRaw, emailRaw, passwordRaw) {
    if (!AUTH_READY) throw new Error('Supabase auth is not configured for this deployment yet.');
    const username = normalizeUsername(usernameRaw);
    validateUsername(username);
    const email = validateEmail(emailRaw);
    const password = validatePassword(passwordRaw);

    const existing = await getProfileByUsername(username);
    if (existing) throw new Error('That username is already registered.');

    const authPayload = await request('/auth/v1/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        data: { username },
        options: { emailRedirectTo: REDIRECT_URL }
      })
    });

    if (!authPayload?.session || !authPayload?.user) {
      throw new Error('Sign up succeeded. Please verify your email address before signing in.');
    }

    setSession(authPayload.session);
    const profile = await ensureProfileForUser(authPayload.user, authPayload.session.access_token, username);
    return profile.username;
  }

  async function login(usernameRaw, passwordRaw) {
    if (!AUTH_READY) throw new Error('Supabase auth is not configured for this deployment yet.');
    const username = normalizeUsername(usernameRaw);
    validateUsername(username);
    const password = String(passwordRaw || '');
    if (!password) throw new Error('Please provide your password.');

    const profile = await getProfileByUsername(username);
    if (!profile?.email) throw new Error('Account not found.');

    const authPayload = await request('/auth/v1/token?grant_type=password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: profile.email, password })
    });

    setSession(authPayload);
    const userPayload = await request('/auth/v1/user', { headers: { Accept: 'application/json' } }, authPayload.access_token);
    const ensuredProfile = await ensureProfileForUser(userPayload, authPayload.access_token, username);
    return ensuredProfile.username;
  }

  async function sendResetEmail(identifierRaw) {
    if (!AUTH_READY) throw new Error('Supabase auth is not configured for this deployment yet.');
    const normalized = String(identifierRaw || '').trim().toLowerCase();
    if (!normalized) throw new Error('Please enter your username or email address.');

    let email = normalized;
    if (!EMAIL_REGEX.test(normalized)) {
      const profile = await getProfileByUsername(normalized);
      if (!profile?.email) throw new Error('Account not found.');
      email = profile.email;
    }

    await request('/auth/v1/recover', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, options: { emailRedirectTo: REDIRECT_URL } })
    });
  }

  async function updatePassword(passwordRaw) {
    if (!activeSession?.access_token) throw new Error('No recovery session found.');
    const password = validatePassword(passwordRaw);

    await request('/auth/v1/user', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    }, activeSession.access_token);
  }

  async function logout() {
    if (AUTH_READY && activeSession?.access_token) {
      try {
        await request('/auth/v1/logout', { method: 'POST' }, activeSession.access_token);
      } catch {
        // ignore logout transport errors
      }
    }
    setSession(null);
    setProfile(null);
    ACCOUNT_SCOPE.clearAccount();
  }

  async function loadAccountProgress(scope = 'dodge') {
    if (!AUTH_READY || !activeSession?.access_token || !activeProfile?.user_id) return null;
    await refreshSessionIfNeeded();
    const profile = await getProfileByUserId(activeProfile.user_id, activeSession.access_token);
    if (!profile) return null;
    setProfile(profile);
    const progress = profile.progress && typeof profile.progress === 'object' ? profile.progress : {};
    return progress[scope] && typeof progress[scope] === 'object' ? progress[scope] : null;
  }

  async function saveAccountProgress(scope = 'dodge', payload = {}) {
    if (!AUTH_READY || !activeSession?.access_token || !activeProfile?.user_id) return false;
    await refreshSessionIfNeeded();
    const progress = activeProfile.progress && typeof activeProfile.progress === 'object' ? { ...activeProfile.progress } : {};
    progress[scope] = { ...(payload || {}) };

    const rows = await request(
      `/rest/v1/${PROFILE_TABLE}?user_id=eq.${encodeURIComponent(activeProfile.user_id)}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Prefer: 'return=representation'
        },
        body: JSON.stringify({ progress, updated_at: new Date().toISOString() })
      },
      activeSession.access_token
    );

    if (Array.isArray(rows) && rows[0]) {
      setProfile(rows[0]);
      return true;
    }

    return false;
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
    modal.querySelectorAll('input, button').forEach(el => {
      if (el.classList.contains('xy-auth-close')) return;
      el.disabled = busy;
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
    modal.querySelector('#xyAuthUser').disabled = isRecovery;
    modal.querySelector('#xyAuthEmail').disabled = !isSignUp;
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
    const resetBtn = modal.querySelector('#xyAuthReset');

    submit.onclick = async () => {
      const username = modal.querySelector('#xyAuthUser').value;
      const email = modal.querySelector('#xyAuthEmail').value;
      const password = modal.querySelector('#xyAuthPass').value;
      const newPassword = modal.querySelector('#xyAuthNewPass').value;

      setBusy(modal, true);
      try {
        let resolvedName = 'guest';
        if (activeModalMode === 'signup') {
          resolvedName = await signUp(username, email, password);
          showStatus(modal, `Signed in as ${resolvedName}.`, 'success');
        } else if (activeModalMode === 'recovery') {
          await updatePassword(newPassword);
          showStatus(modal, 'Password updated. You can now log in with your new password.', 'success');
          activeModalMode = 'login';
          syncModalUi(modal);
        } else {
          resolvedName = await login(username, password);
          showStatus(modal, `Signed in as ${resolvedName}.`, 'success');
        }

        window.dispatchEvent(new CustomEvent('xyrex:account-changed', { detail: { username: ACCOUNT_SCOPE.getAccount() } }));
      } catch (error) {
        showStatus(modal, error?.message || 'Authentication failed.', 'error');
      } finally {
        setBusy(modal, false);
      }
    };

    resetBtn.onclick = async () => {
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

  function handleRecoveryFromUrl() {
    const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : '';
    const params = new URLSearchParams(hash);
    if (params.get('type') !== 'recovery') return;

    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    const expiresIn = Number(params.get('expires_in') || 3600);
    if (!accessToken || !refreshToken) return;

    setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_at: Math.floor(Date.now() / 1000) + expiresIn
    });

    window.history.replaceState(null, '', REDIRECT_URL + window.location.search);
    openAuthModal('recovery');
  }

  window.XyrexAuth = {
    openAuthModal,
    async resetPassword() {
      return sendResetEmail(window.prompt('Enter your username or email:') || '');
    },
    async logout() {
      await logout();
      window.dispatchEvent(new CustomEvent('xyrex:account-changed', { detail: { username: 'guest' } }));
    },
    getCurrentAccount() {
      return ACCOUNT_SCOPE.getAccount();
    },
    getProfile() {
      return activeProfile;
    },
    hasRemoteSync() {
      return AUTH_READY;
    },
    loadAccountProgress,
    saveAccountProgress,
    async initialize() {
      handleRecoveryFromUrl();
      await hydrateFromStoredSession();
      window.dispatchEvent(new CustomEvent('xyrex:account-changed', { detail: { username: ACCOUNT_SCOPE.getAccount() } }));
    }
  };

  window.XyrexAuth.initialize();
})();
