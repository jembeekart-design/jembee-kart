import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateTeacherReferralCommission } from '../teacherReferralCommission.mjs';

const base = {
  adminNetProfitPaise: 20000,
  referralVerified: true,
  teacherUid: 'teacher-1',
  sharerUid: 'sharer-1',
  creatorUid: 'creator-1',
  buyerUid: 'buyer-1',
  sourceOrderId: 'order-123',
};

test('calculates 2% of verified admin net profit, not gross price', () => {
  const result = calculateTeacherReferralCommission(base);
  assert.equal(result.commissionPaise, 400);
  assert.equal(result.basis, 'verified_refund_adjusted_admin_net_profit');
});

test('unverified referral earns no commission', () => {
  const result = calculateTeacherReferralCommission({ ...base, referralVerified: false });
  assert.equal(result.eligible, false);
  assert.equal(result.commissionPaise, 0);
});

test('rejects invalid or negative profit', () => {
  assert.throws(() => calculateTeacherReferralCommission({ ...base, adminNetProfitPaise: -1 }), /INVALID_ADMIN_NET_PROFIT/);
  assert.throws(() => calculateTeacherReferralCommission({ ...base, adminNetProfitPaise: 1.2 }), /INVALID_ADMIN_NET_PROFIT/);
});

test('prevents self or conflicted referral attribution', () => {
  const result = calculateTeacherReferralCommission({ ...base, teacherUid: 'creator-1' });
  assert.equal(result.eligible, false);
  assert.equal(result.reason, 'SELF_OR_CONFLICTED_REFERRAL');
});

test('rounds down to whole paise', () => {
  const result = calculateTeacherReferralCommission({ ...base, adminNetProfitPaise: 199 });
  assert.equal(result.commissionPaise, 3);
});

test('does not pay a zero-profit referral', () => {
  const result = calculateTeacherReferralCommission({ ...base, adminNetProfitPaise: 0 });
  assert.equal(result.commissionPaise, 0);
  assert.equal(result.eligible, false);
});
