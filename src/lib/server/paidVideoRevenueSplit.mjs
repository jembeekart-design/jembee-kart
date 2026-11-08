/** Split a verified INR payment amount (in paise) without floating-point money math. */
export function splitPaidVideoRevenue(totalPaise) {
  if (!Number.isSafeInteger(totalPaise) || totalPaise <= 0) throw new Error('INVALID_REVENUE_AMOUNT');
  const creatorPaise = Math.floor((totalPaise * 30) / 100);
  const sharerPaise = Math.floor((totalPaise * 20) / 100);
  // Platform receives the remainder so all allocations sum to the exact payment.
  const platformPaise = totalPaise - creatorPaise - sharerPaise;
  return { creatorPaise, sharerPaise, platformPaise, totalPaise };
}

export function resolvePaidVideoSharer(order, buyerUid, creatorUid) {
  const sharerUid = typeof order?.sharerId === 'string' ? order.sharerId.trim() : '';
  if (order?.sharerAttributionVerified !== true || !sharerUid || sharerUid === buyerUid || sharerUid === creatorUid) return null;
  return sharerUid;
}
