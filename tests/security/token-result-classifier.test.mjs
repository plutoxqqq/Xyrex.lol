import assert from 'node:assert/strict';
import test from 'node:test';

const RESULT_TYPES = Object.freeze({
  ACCEPTED_BY_APP: 'ACCEPTED BY APP',
  STORAGE_MUTATED_ONLY: 'STORAGE MUTATED ONLY',
  BLOCKED_NORMALIZED: 'BLOCKED / NORMALIZED',
  ERROR: 'ERROR'
});

function classifyTokenSecurityResult(result) {
  if (result?.appAcceptedFakeUsage === true) return RESULT_TYPES.ACCEPTED_BY_APP;
  if (result?.storageMutated === true && result?.appAcceptedFakeUsage !== true) return RESULT_TYPES.STORAGE_MUTATED_ONLY;
  if (result?.blocked === true || result?.normalized === true) return RESULT_TYPES.BLOCKED_NORMALIZED;

  const message = String(result?.error?.message || result?.error || '');
  if (/accessor properties are not allowed/i.test(message)) return RESULT_TYPES.BLOCKED_NORMALIZED;
  if (/blocked|denied|read only|not extensible|non-configurable|non-writable/i.test(message)) return RESULT_TYPES.BLOCKED_NORMALIZED;

  return RESULT_TYPES.ERROR;
}

test('browser-level accessor rejection is classified as blocked rather than error', () => {
  assert.equal(
    classifyTokenSecurityResult({ error: new TypeError('Accessor properties are not allowed.') }),
    RESULT_TYPES.BLOCKED_NORMALIZED
  );
});

test('accepted fake usage is the only accepted-by-app classification', () => {
  assert.equal(
    classifyTokenSecurityResult({ appAcceptedFakeUsage: true, storageMutated: true }),
    RESULT_TYPES.ACCEPTED_BY_APP
  );
});

test('localStorage-only mutation is not accepted by the app', () => {
  assert.equal(
    classifyTokenSecurityResult({ storageMutated: true, appAcceptedFakeUsage: false }),
    RESULT_TYPES.STORAGE_MUTATED_ONLY
  );
});

export { RESULT_TYPES, classifyTokenSecurityResult };
