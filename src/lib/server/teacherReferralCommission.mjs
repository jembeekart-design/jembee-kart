/**
 * Teacher referral commission is 2% of verified, refund-adjusted ADMIN NET PROFIT.
 * Platform revenue share is not a substitute for net profit. Callers must supply
 * an independently reconciled net-profit amount in integer paise.
 */
export function calculateTeacherReferralCommission({
  adminNetProfitPaise,
  referralVerified,
  teacherUid,
  sharerUid,
  creatorUid,
  buyerUid,
  sourceOrderId,
}) {
  if (!Number.isSafeInteger(adminNetProfitPaise) || adminNetProfitPaise < 0) {
    throw new Error('INVALID_ADMIN_NET_PROFIT');
  }
  if (referralVerified !== true) return { eligible: false, commissionPaise: 0, reason: 'REFERRAL_NOT_VERIFIED' };
  for (const [key, value] of Object.entries({ teacherUid, sharerUid, creatorUid, buyerUid, sourceOrderId })) {
    if (typeof value !== 'string' || value.trim() === '') throw new Error(`INVALID_${key.replace(/[A-Z]/g, (m) => `_${m}`).toUpperCase()}`);
  }
  if (sharerUid === teacherUid || teacherUid === creatorUid || teacherUid === buyerUid) {
    return { eligible: false, commissionPaise: 0, reason: 'SELF_OR_CONFLICTED_REFERRAL' };
  }
  // Round down so commissions can never exceed the verified profit base.
  const commissionPaise = Math.floor(adminNetProfitPaise * 2 / 100);
  return {
    eligible: commissionPaise > 0,
    commissionPaise,
    reason: commissionPaise > 0 ? 'ELIGIBLE' : 'NO_POSITIVE_COMMISSION',
    teacherUid,
    sourceOrderId,
    basis: 'verified_refund_adjusted_admin_net_profit',
  };
}
