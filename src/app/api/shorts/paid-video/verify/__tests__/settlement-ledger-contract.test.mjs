import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../route.ts', import.meta.url), 'utf8');
const rules = await readFile(new URL('../../../../../../../firestore.rules', import.meta.url), 'utf8');

test('settlement entries are created only in the provider-verified payment transaction', () => {
  assert.ok(source.includes('cashfreeRequest<Payment[]>'));
  assert.ok(source.includes('db.runTransaction'));
  assert.ok(source.includes('cashfree_verified_paid_video'));
  assert.ok(source.includes('tx.create(ledgerRefs[0]'));
  assert.ok(source.includes('tx.create(ledgerRefs[1]'));
  assert.ok(source.includes('tx.create(ledgerRefs[2]'));
});

test('ledger entries are idempotent and do not directly credit wallets', () => {
  assert.ok(source.includes('if (!creatorLedger.exists)'));
  assert.ok(source.includes('if (!sharerLedger.exists)'));
  assert.ok(source.includes('if (!platformLedger.exists)'));
  assert.ok(source.includes('status: "pending_settlement"'));
  assert.ok(!/wallets?\.doc\([^)]*\).*\.update/s.test(source));
});

test('unverified sharer allocation remains unallocated', () => {
  assert.ok(source.includes('sharer_share_unallocated'));
  assert.ok(source.includes('attributionVerified: Boolean(sharerUid)'));
});

test('client Firestore writes remain denied by the default deny rule', () => {
  assert.match(rules, /match \/\{document=\*\*\} \{\s*allow read, write: if false;/);
});
