export function getStoredJson(key, fallback = null) {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; }
}
export function setStoredJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
