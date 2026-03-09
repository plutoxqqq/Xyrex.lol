(() => {
  const DB_NAME = 'xyrex_auth_db_v1';
  const STORE_NAME = 'accounts';
  const ACCOUNT_SCOPE = window.XyrexAccountScope;
  if (!ACCOUNT_SCOPE) return;

  const toBase64 = bytes => btoa(String.fromCharCode(...bytes));
  const fromBase64 = value => Uint8Array.from(atob(value), c => c.charCodeAt(0));

  function normalizeUsername(value) {
    return String(value || '').trim().toLowerCase().replace(/\s+/g, '');
  }

  function openDb() {
    return new Promise((resolve, reject) => {
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

  async function getAccount(username) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(username);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error || new Error('Failed to read account'));
    });
  }

  async function putAccount(record) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error || new Error('Failed to write account'));
      tx.objectStore(STORE_NAME).put(record);
    });
  }

  async function signUp(usernameRaw, passwordRaw) {
    const username = normalizeUsername(usernameRaw);
    const password = String(passwordRaw || '');

    if (!/^[a-z0-9_\-]{3,24}$/.test(username)) {
      throw new Error('Username must be 3 to 24 characters and use letters, numbers, underscores, or hyphens');
    }
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    const existing = await getAccount(username);
    if (existing) throw new Error('That username is already registered');

    const salt = crypto.getRandomValues(new Uint8Array(16));
    const hash = await deriveHash(password, salt);

    await putAccount({
      username,
      salt: toBase64(salt),
      hash: toBase64(hash),
      createdAt: Date.now()
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
          <input id="xyAuthPass" class="xy-auth-input" type="password" autocomplete="current-password" placeholder="At least 8 characters" />
          <p id="xyAuthStatus" class="xy-auth-status" hidden></p>
          <div class="xy-auth-actions">
            <button type="button" id="xyAuthSubmit" class="btn-primary">Continue</button>
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
    modal.querySelector('#xyAuthUser').focus();
  }

  window.XyrexAuth = {
    openAuthModal,
    getCurrentAccount() {
      return ACCOUNT_SCOPE.getAccount();
    }
  };
})();
