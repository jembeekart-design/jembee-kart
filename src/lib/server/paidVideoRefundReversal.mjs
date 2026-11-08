import { splitPaidVideoRevenue } from './paidVideoRevenueSplit.mjs';

/**
 * Calculate the incremental ledger reversal for a confirmed partial/full INR
 * refund. Inputs and outputs are integer paise. `previouslyRefundedPaise` is
 * the sum of provider-confirmed refunds already reversed for this payment.
 * This is a calculator only; callers must verify Cashfree SUCCESS and commit
 * deterministic reversal entries transactionally.
 */
export function calculatePaidVideoRefundReversal({
  originalPaise,
  previouslyRefundedPaise = 0,
  newlyConfirmedRefundPaise,
}) {
  for (const [name, value] of Object.entries({
    originalPaise,
    previouslyRefundedPaise,
    newlyConfirmedRefundPaise,
  })) {
    if (!Number.isSafeInteger(value) || value < 0) throw new Error(`INVALID_${name.toUpperCase()}`);
  }
  if (originalPaise <= 0) throw new Error('INVALID_ORIGINAL_AMOUNT');
  if (previouslyRefundedPaise > originalPaise) throw new Error('REFUND_EXCEEDS_ORIGINAL');
  if (newlyConfirmedRefundPaise <= 0) throw new Error('INVALID_NEW_REFUND');
  const cumulativeRefundPaise = previouslyRefundedPaise + newlyConfirmedRefundPaise;
  if (!Number.isSafeInteger(cumulativeRefundPaise) || cumulativeRefundPaise > originalPaise) {
    throw new Error('REFUND_EXCEEDS_ORIGINAL');
  }

  const before = previouslyRefundedPaise === 0
    ? { creatorPaise: 0, sharerPaise: 0, platformPaise: 0 }
    : splitPaidVideoRevenue(previouslyRefundedPaise);
  const after = splitPaidVideoRevenue(cumulativeRefundPaise);
  const reversal = {
    creatorPaise: after.creatorPaise - before.creatorPaise,
    sharerPaise: after.sharerPaise - before.sharerPaise,
    platformPaise: after.platformPaise - before.platformPaise,
    totalPaise: newlyConfirmedRefundPaise,
    cumulativeRefundPaise,
    remainingRefundablePaise: originalPaise - cumulativeRefundPaise,
  };
  if (reversal.creatorPaise + reversal.sharerPaise + reversal.platformPaise !== newlyConfirmedRefundPaise) {
    throw new Error('REVERSAL_ALLOCATION_MISMATCH');
  }
  return reversal;
}
