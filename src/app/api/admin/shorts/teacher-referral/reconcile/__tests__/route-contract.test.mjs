import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../route.ts', import.meta.url), 'utf8');
test('reconciliation is admin-authenticated and reads verified paid-video orders', () => {
  assert.match(source, /verifyIdToken\(header\.slice\(7\)\.trim\(\), true\)/);
  assert.match(source, /role !== "admin" && user\?\.role !== "super_admin"/);
  assert.match(source, /watchVideoPaymentOrders/);
  assert.match(source, /order\.status !== "paid"/);
});
test('net profit subtracts only verified INR expenses from platform ledger after refunds', () => {
  assert.match(source, /shortsSettlementLedger/);
  assert.match(source, /platform_share_reversal/);
  assert.match(source, /shortsVerifiedExpenses/);
  assert.match(source, /expense\.status !== "verified"/);
  assert.match(source, /platformNetBeforeCosts - verifiedCosts/);
});
test('teacher commission uses the existing 2 percent net-profit calculator', () => {
  assert.match(source, /calculateTeacherReferralCommission/);
  assert.match(source, /adminNetProfitPaise/);
  assert.match(source, /teacherReferralAttributions/);
  assert.match(source, /TEACHER_ATTRIBUTION_ORDER_MISMATCH/);
  assert.match(source, /teacher_referral_commission/);
});
test('reconciliation is idempotent and does not issue wallet credits or payouts', () => {
  assert.match(source, /paidvideo_\$\{orderId\}_admin_net_profit/);
  assert.match(source, /paidvideo_\$\{orderId\}_teacher_referral/);
  assert.match(source, /alreadyReconciled/);
  assert.match(source, /PARTIAL_RECONCILIATION_REQUIRES_MANUAL_REVIEW/);
  assert.doesNotMatch(source, /wallets?\.doc|payouts?\.doc|transfer/);
});
