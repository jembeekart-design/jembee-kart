import test from 'node:test';
import assert from 'node:assert/strict';
import { splitPaidVideoRevenue, resolvePaidVideoSharer } from '../paidVideoRevenueSplit.mjs';

test('allocates 30/20/50 and balances odd paise exactly', () => {
  const split = splitPaidVideoRevenue(10001);
  assert.deepEqual(split, { creatorPaise: 3000, sharerPaise: 2000, platformPaise: 5001, totalPaise: 10001 });
  assert.equal(split.creatorPaise + split.sharerPaise + split.platformPaise, split.totalPaise);
});

test('rejects invalid monetary amounts', () => {
  for (const value of [0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1, NaN]) assert.throws(() => splitPaidVideoRevenue(value));
});

test('only accepts explicitly verified sharer attribution', () => {
  assert.equal(resolvePaidVideoSharer({ sharerId: 'share-1', sharerAttributionVerified: true }, 'buyer', 'creator'), 'share-1');
  assert.equal(resolvePaidVideoSharer({ sharerId: 'share-1' }, 'buyer', 'creator'), null);
  assert.equal(resolvePaidVideoSharer({ sharerId: 'buyer', sharerAttributionVerified: true }, 'buyer', 'creator'), null);
  assert.equal(resolvePaidVideoSharer({ sharerId: 'creator', sharerAttributionVerified: true }, 'buyer', 'creator'), null);
});
