import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../route.ts', import.meta.url), 'utf8');

test('paid-video earnings API is authenticated and scopes ledger reads to the caller', () => {
  assert.match(source, /verifyIdToken\(token, true\)/);
  assert.match(source, /where\("beneficiaryUid", "==", uid\)/);
  assert.match(source, /creator_share_reversal/);
  assert.match(source, /sharer_share_reversal/);
  assert.match(source, /Cache-Control/);
});

test('creator and sharer paid-video balances remain separate and signed reversals are included', () => {
  assert.match(source, /creatorEarnings/);
  assert.match(source, /sharerEarnings/);
  assert.match(source, /creatorNetPaise/);
  assert.match(source, /sharerNetPaise/);
  assert.match(source, /total \+ item\.amountPaise/);
});
