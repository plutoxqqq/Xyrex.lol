export const runtime = 'edge';

const DAILY_FREE_TOKEN_LIMIT = 5;
const MAX_PURCHASED_TOKENS = 200;
const FREE_TOKEN_COOLDOWN_MS = Math.ceil((24 * 60 * 60 * 1000) / DAILY_FREE_TOKEN_LIMIT);
const TOKEN_STATE_VERSION = 1;

const memoryDatabase = globalThis.__xyrexAiTokenDatabase || new Map();
globalThis.__xyrexAiTokenDatabase = memoryDatabase;

const ALLOWED_ORIGINS = new Set([
  'https://xyrex.lol',
  'https://www.xyrex.lol',
  'https://plutoxqqq.github.io'
]);
const DEFAULT_ORIGIN = 'https://xyrex.lol';

function clampInteger(value, min, max) {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, Math.trunc(value)));
}

function utcDateKey(serverNow) {
  return new Date(serverNow).toISOString().slice(0, 10);
}

function getCookie(request, name) {
  const cookie = request.headers.get('cookie') || '';
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = cookie.match(new RegExp(`(?:^|;\\s*)${escaped}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : '';
}

function safeAuthIdentifier(request) {
  const authorization = request.headers.get('authorization') || '';
  const bearer = authorization.match(/^Bearer\s+(.+)$/i)?.[1] || '';
  const explicitSession = request.headers.get('x-xyrex-session') || request.headers.get('x-session-id') || '';
  const cookieSession = getCookie(request, 'xyrex_session') || getCookie(request, 'sb-access-token') || getCookie(request, 'supabase-auth-token') || '';
  const raw = bearer || explicitSession || cookieSession;
  return String(raw).trim().slice(0, 256);
}

async function sha256(input) {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function getAuthenticatedUserId(request) {
  const identifier = safeAuthIdentifier(request);
  if (!identifier) return null;
  return `user_${await sha256(identifier)}`;
}

function defaultTokenState(userId, serverNow) {
  return {
    version: TOKEN_STATE_VERSION,
    userId,
    purchasedTokens: 0,
    freeTokensUsedToday: 0,
    freeTokenCooldownUntil: 0,
    tokenDate: utcDateKey(serverNow),
    lastTokenConsumeAt: 0,
    updatedAt: serverNow
  };
}

export function normalizeStoredTokenState(state, userId, serverNow) {
  const base = defaultTokenState(userId, serverNow);
  const input = state && typeof state === 'object' ? state : {};
  const tokenDate = typeof input.tokenDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input.tokenDate)
    ? input.tokenDate
    : base.tokenDate;
  const isToday = tokenDate === utcDateKey(serverNow);
  return {
    ...base,
    purchasedTokens: clampInteger(Number(input.purchasedTokens), 0, MAX_PURCHASED_TOKENS),
    freeTokensUsedToday: isToday ? clampInteger(Number(input.freeTokensUsedToday), 0, DAILY_FREE_TOKEN_LIMIT) : 0,
    freeTokenCooldownUntil: clampInteger(Number(input.freeTokenCooldownUntil), 0, serverNow + 30 * 24 * 60 * 60 * 1000),
    tokenDate: isToday ? tokenDate : utcDateKey(serverNow),
    lastTokenConsumeAt: clampInteger(Number(input.lastTokenConsumeAt), 0, serverNow),
    updatedAt: clampInteger(Number(input.updatedAt), 0, serverNow)
  };
}


function getRedisConfig() {
  const env = globalThis.process?.env || {};
  const url = env.KV_REST_API_URL || env.UPSTASH_REDIS_REST_URL || '';
  const token = env.KV_REST_API_TOKEN || env.UPSTASH_REDIS_REST_TOKEN || '';
  return url && token ? { url: url.replace(/\/$/, ''), token } : null;
}

async function readDatabaseRecord(userId) {
  const config = getRedisConfig();
  if (!config) return memoryDatabase.get(userId);
  const response = await fetch(`${config.url}/get/xyrex_ai_token_state:${encodeURIComponent(userId)}`, {
    headers: { Authorization: `Bearer ${config.token}` },
    cache: 'no-store'
  });
  if (!response.ok) throw new Error(`Token database read failed (${response.status})`);
  const payload = await response.json();
  if (!payload?.result) return null;
  return typeof payload.result === 'string' ? JSON.parse(payload.result) : payload.result;
}

async function writeDatabaseRecord(userId, state) {
  const config = getRedisConfig();
  memoryDatabase.set(userId, state);
  if (!config) return;
  const encoded = encodeURIComponent(JSON.stringify(state));
  const response = await fetch(`${config.url}/set/xyrex_ai_token_state:${encodeURIComponent(userId)}/${encoded}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${config.token}` },
    cache: 'no-store'
  });
  if (!response.ok) throw new Error(`Token database write failed (${response.status})`);
}

export async function loadTokenState(request, serverNow = Date.now()) {
  const userId = await getAuthenticatedUserId(request);
  if (!userId) return { userId: null, state: null };
  const stored = await readDatabaseRecord(userId);
  const current = normalizeStoredTokenState(stored, userId, serverNow);
  await writeDatabaseRecord(userId, current);
  return { userId, state: current };
}

export async function saveTokenState(userId, state, serverNow = Date.now()) {
  const normalized = normalizeStoredTokenState({ ...state, updatedAt: serverNow }, userId, serverNow);
  await writeDatabaseRecord(userId, normalized);
  return normalized;
}

export function buildSafeSummary(state, serverNow = Date.now()) {
  const normalized = normalizeStoredTokenState(state, state.userId, serverNow);
  const cooldownRemainingMs = Math.max(0, normalized.freeTokenCooldownUntil - serverNow);
  const dailyFreeRemaining = Math.max(0, DAILY_FREE_TOKEN_LIMIT - normalized.freeTokensUsedToday);
  const freeAvailable = dailyFreeRemaining > 0 && cooldownRemainingMs <= 0;
  return {
    purchasedTokens: normalized.purchasedTokens,
    freeTokensUsedToday: normalized.freeTokensUsedToday,
    freeTokenCooldownUntil: normalized.freeTokenCooldownUntil,
    tokenDate: normalized.tokenDate,
    lastTokenConsumeAt: normalized.lastTokenConsumeAt,
    updatedAt: normalized.updatedAt,
    serverNow,
    dailyFreeTokenLimit: DAILY_FREE_TOKEN_LIMIT,
    dailyFreeRemaining,
    cooldownRemainingMs,
    freeAvailable,
    availableTokens: normalized.purchasedTokens + (freeAvailable ? 1 : 0)
  };
}

export function consumeTokenFromState(state, serverNow = Date.now()) {
  const normalized = normalizeStoredTokenState(state, state.userId, serverNow);
  if (normalized.purchasedTokens > 0) {
    normalized.purchasedTokens -= 1;
    normalized.lastTokenConsumeAt = serverNow;
    normalized.updatedAt = serverNow;
    return { ok: true, source: 'purchased', state: normalized };
  }

  const summary = buildSafeSummary(normalized, serverNow);
  if (summary.freeAvailable) {
    normalized.freeTokensUsedToday += 1;
    normalized.freeTokenCooldownUntil = serverNow + FREE_TOKEN_COOLDOWN_MS;
    normalized.lastTokenConsumeAt = serverNow;
    normalized.updatedAt = serverNow;
    return { ok: true, source: 'free', state: normalized };
  }

  return { ok: false, source: null, state: normalized };
}

export function jsonResponse(request, body, status = 200) {
  const origin = request.headers.get('origin');
  const allowOrigin = origin && ALLOWED_ORIGINS.has(origin) ? origin : DEFAULT_ORIGIN;
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'access-control-allow-origin': allowOrigin,
      'access-control-allow-methods': 'GET,POST,OPTIONS',
      'access-control-allow-headers': 'content-type,authorization,x-xyrex-session,x-session-id',
      vary: 'Origin'
    }
  });
}

export function optionsResponse(request) {
  return jsonResponse(request, { ok: true });
}
