import { buildSafeSummary, consumeTokenFromState, jsonResponse, loadTokenState, optionsResponse, saveTokenState } from '../_shared/token-store.js';

export const runtime = 'edge';

export async function OPTIONS(request) {
  return optionsResponse(request);
}

export async function POST(request) {
  const serverNow = Date.now();
  const { userId, state } = await loadTokenState(request, serverNow);
  if (!userId || !state) {
    return jsonResponse(request, { ok: false, error: 'Authentication is required to consume AI tokens.', summary: { serverNow } }, 401);
  }

  const result = consumeTokenFromState(state, serverNow);
  const saved = await saveTokenState(userId, result.state, serverNow);
  const summary = buildSafeSummary(saved, serverNow);

  if (!result.ok) {
    return jsonResponse(request, { ok: false, error: 'No AI token is available yet.', summary }, 429);
  }

  return jsonResponse(request, { ok: true, source: result.source, summary });
}
