import { buildSafeSummary, jsonResponse, loadTokenState, optionsResponse } from '../_shared/token-store.js';

export const runtime = 'edge';

export async function OPTIONS(request) {
  return optionsResponse(request);
}

export async function GET(request) {
  const serverNow = Date.now();
  const { userId, state } = await loadTokenState(request, serverNow);
  if (!userId || !state) {
    return jsonResponse(request, { ok: false, error: 'Authentication is required to view AI token state.', summary: { serverNow } }, 401);
  }

  return jsonResponse(request, { ok: true, summary: buildSafeSummary(state, serverNow) });
}
