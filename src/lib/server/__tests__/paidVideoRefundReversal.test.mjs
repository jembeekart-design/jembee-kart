import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatePaidVideoRefundReversal } from '../paidVideoRefundReversal.mjs';

test('full refund reverses the exact original 30/20/50 allocation', () => {
  assert.deepEqual(calculatePaidVideoRefundReversal({ originalPaise: 100000, newlyConfirmedRefundPaise: 100000 }), {
    creatorPaise: 30000, sharerPaise: 20000, platformPaise: 50000,
    totalPaise: 100000, cumulativeRefundPaise: 100000, remainingRefundablePaise: 0,
  });
});

test('multiple partial refunds reverse only the incremental allocation', () => {
  const first = calculatePaidVideoRefundReversal({ originalPaise: 100000, newlyConfirmedRefundPaise: 33333 });
  const second = calculatePaidVideoRefundReversal({ originalPaise: 100000, previouslyRefundedPaise: 33333, newlyConfirmedRefundPaise: 16667 });
  assert.equal(first.totalPaise + second.totalPaise, 50000);
  assert.equal(first.creatorPaise + second.creatorPaise, 15000);
  assert.equal(first.sharerPaise + second.sharerPaise, 10000);
  assert.equal(first.platformPaise + second.platformPaise, 25000);
});

test('platform receives rounding remainder and allocations exactly equal refund', () => {
  const result = calculatePaidVideoRefundReversal({ originalPaise: 101, newlyConfirmedRefundPaise: 37 });
  assert.equal(result.creatorPaise + result.sharerPaise + result.platformPaise, 37);
});

test('rejects zero, fractional, negative and over-refund values', () => {
  for (const input of [
    { originalPaise: 100, newlyConfirmedRefundPaise: 0 },
    { originalPaise: 100, newlyConfirmedRefundPaise: 1.5 },
    { originalPaise: 100, newlyConfirmedRefundPaise: -1 },
    { originalPaise: 100, previouslyRefundedPaise: 80, newlyConfirmedRefundPaise: 21 },
  ]) assert.throws(() => calculatePaidVideoRefundReversal(input));
});
