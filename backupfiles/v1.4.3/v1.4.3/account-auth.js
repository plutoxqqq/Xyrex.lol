(() => {
  const DB_NAME = 'xyrex_auth_db_v1';
  const STORE_NAME = 'accounts';
  const LEGACY_LOCAL_KEY = '__xyrex_auth_accounts_local_v1';
  const ACCOUNT_SCOPE = window.XyrexAccountScope;
  if (!ACCOUNT_SCOPE) return;

  const toBase64 = bytes => btoa(String.fromCharCode(...bytes));
  const fromBase64 = value => Uint8Array.from(atob(value), c => c.charCodeAt(0));

  const remoteAuthEndpoint = typeof window.XYREX_AUTH_API_URL === 'string' ? window.XYREX_AUTH_API_URL.trim().replace(/\/+$/, '') : '';

  function normalizeUsername(value) {
    return String(value || '').trim().toLowerCase();
  }

  function validateUsername(username) {
    if (!/^[a-z0-9._]{3,24}$/.test(username)) {
      throw new Error('Username must be 3 to 24 characters and only include letters, numbers, underscores, or periods');
    }
  }

  function validatePassword(passwordRaw) {
    const password = String(passwordRaw || '');
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      throw new Error('Password must include at least one uppercase letter');
    }
    if (!/\d/.test(password)) {
      throw new Error('Password must include at least one number');
    }
    return password;
  }

  function openDb() {
    return new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) {
        reject(new Error('IndexedDB is not available'));
        return;
      }
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'username' });
          store.createIndex('username', 'username', { unique: true });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('Failed to open auth database'));
    });
  }

  function getLegacyLocalMap() {
    try {
      const raw = localStorage.getItem(LEGACY_LOCAL_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }

  function setLegacyLocalMap(map) {
    localStorage.setItem(LEGACY_LOCAL_KEY, JSON.stringify(map));
  }

  async function deriveHash(password, saltBytes) {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      enc.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );
    const bits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: saltBytes,
        iterations: 120000,
        hash: 'SHA-256'
      },
      keyMaterial,
      256
    );
    return new Uint8Array(bits);
  }

  async function remoteGetAccount(username) {
    if (!remoteAuthEndpoint) return null;
    const response = await fetch(`${remoteAuthEndpoint}/account/${encodeURIComponent(username)}`, {
      method: 'GET',
      headers: { Accept: 'application/json' }
    });

    if (response.status === 404) return null;
    if (!response.ok) throw new Error('Remote authentication service is unavailable');
    const payload = await response.json();
    return payload && typeof payload === 'object' ? payload : null;
  }

  async function remotePutAccount(record) {
    if (!remoteAuthEndpoint) return false;
    const response = await fetch(`${remoteAuthEndpoint}/account/${encodeURIComponent(record.username)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    });
    if (!response.ok) throw new Error('Unable to save account to remote authentication service');
    return true;
  }

  async function getAccount(username) {
    try {
      const remoteAccount = await remoteGetAccount(username);
      if (remoteAccount) return remoteAccount;
    } catch {
      // Continue to local fallback
    }

    try {
      const db = await openDb();
      return await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.get(username);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error || new Error('Failed to read account'));
      });
    } catch {
      const map = getLegacyLocalMap();
      return map[username] || null;
    }
  }

  async function putAccount(record) {
    let wroteRemote = false;
    try {
      wroteRemote = await remotePutAccount(record);
    } catch {
      wroteRemote = false;
    }

    try {
      const db = await openDb();
      await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error || new Error('Failed to write account'));
        tx.objectStore(STORE_NAME).put(record);
      });
      return true;
    } catch {
      const map = getLegacyLocalMap();
      map[record.username] = record;
      setLegacyLocalMap(map);
      return wroteRemote || true;
    }
  }

  async function signUp(usernameRaw, passwordRaw) {
    const username = normalizeUsername(usernameRaw);
    const password = validatePassword(passwordRaw);

    validateUsername(username);

    const existing = await getAccount(username);
    if (existing) throw new Error('That username is already registered');

    const salt = crypto.getRandomValues(new Uint8Array(16));
    const hash = await deriveHash(password, salt);

    await putAccount({
      username,
      salt: toBase64(salt),
      hash: toBase64(hash),
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    ACCOUNT_SCOPE.setAccount(username);
    return username;
  }

  async function login(usernameRaw, passwordRaw) {
    const username = normalizeUsername(usernameRaw);
    const password = String(passwordRaw || '');

    if (!username || !password) throw new Error('Please provide both username and password');

    const account = await getAccount(username);
    if (!account) throw new Error('Account not found');

    const salt = fromBase64(account.salt);
    const hash = await deriveHash(password, salt);
    const expected = toBase64(hash);
    if (expected !== account.hash) throw new Error('Invalid password');

    ACCOUNT_SCOPE.setAccount(username);
    return username;
  }

  async function resetPasswordPrompt() {
    const username = normalizeUsername(window.prompt('Enter your username to reset the password:') || '');
    if (!username) return;
    validateUsername(username);

    const account = await getAccount(username);
    if (!account) throw new Error('Account not found');

    const nextPassword = window.prompt('Enter your new password (8+ chars, 1 uppercase letter, 1 number):') || '';
    const validPassword = validatePassword(nextPassword);

    const salt = crypto.getRandomValues(new Uint8Array(16));
    const hash = await deriveHash(validPassword, salt);
    await putAccount({
      ...account,
      salt: toBase64(salt),
      hash: toBase64(hash),
      updatedAt: Date.now()
    });

    return username;
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
          <label class="xy-auth-label" for="xyAuthPass">Password</label>
          <input id="xyAuthPass" class="xy-auth-input" type="password" autocomplete="current-password" placeholder="8+ chars, uppercase, number" />
          <p class="xy-auth-note">Username: letters, numbers, underscores, and periods only.</p>
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

  function openAuthModal(mode = 'login') {
    const currentAccount = ACCOUNT_SCOPE.getAccount?.() || 'guest';
    if (mode === 'login' && currentAccount !== 'guest') {
      window.alert('You are already logged into an account. Please log out first if you want to switch accounts.');
      return;
    }

    ensureModal();
    const modal = document.getElementById('xyAuthModal');
    if (!modal) return;

    const status = modal.querySelector('#xyAuthStatus');
    const title = modal.querySelector('#xyAuthTitle');
    const submit = modal.querySelector('#xyAuthSubmit');
    const passInput = modal.querySelector('#xyAuthPass');
    const resetBtn = modal.querySelector('#xyAuthReset');

    const isSignUp = mode === 'signup';
    title.textContent = isSignUp ? 'Create Account' : 'Login';
    submit.textContent = isSignUp ? 'Create Account' : 'Login';
    passInput.setAttribute('autocomplete', isSignUp ? 'new-password' : 'current-password');

    modal.setAttribute('aria-hidden', 'false');
    status.hidden = true;
    status.textContent = '';

    const onSubmit = async () => {
      const username = modal.querySelector('#xyAuthUser').value;
      const password = passInput.value;
      submit.disabled = true;
      status.hidden = true;
      try {
        const account = isSignUp ? await signUp(username, password) : await login(username, password);
        status.hidden = false;
        status.textContent = `Authenticated as ${account}`;
        status.className = 'xy-auth-status success';
        window.setTimeout(() => window.location.reload(), 450);
      } catch (error) {
        status.hidden = false;
        status.textContent = error?.message || 'Authentication failed';
        status.className = 'xy-auth-status error';
      } finally {
        submit.disabled = false;
      }
    };

    submit.onclick = onSubmit;
    resetBtn.onclick = async () => {
      status.hidden = true;
      try {
        const account = await resetPasswordPrompt();
        if (!account) return;
        status.hidden = false;
        status.textContent = `Password reset for ${account}`;
        status.className = 'xy-auth-status success';
      } catch (error) {
        status.hidden = false;
        status.textContent = error?.message || 'Failed to reset password';
        status.className = 'xy-auth-status error';
      }
    };
    modal.querySelector('#xyAuthUser').focus();
  }

  window.XyrexAuth = {
    openAuthModal,
    async resetPassword() {
      return resetPasswordPrompt();
    },
    getCurrentAccount() {
      return ACCOUNT_SCOPE.getAccount();
    },
    hasRemoteSync() {
      return Boolean(remoteAuthEndpoint);
    }
  };
})();
