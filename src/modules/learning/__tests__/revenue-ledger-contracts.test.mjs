import { test } from "node:test";
import assert from "node:assert/strict";
import {
  allocateEligibleAdRevenue, calculateTeacherReferralMinor, canAppendLedgerEntry,
  canCreateReversal, isPayoutReady,
} from "../revenue-ledger-contracts.ts";

const ad = { entryId: "ad_1", source: "eligible_ad_revenue", currency: "INR", grossMinor: 10000, refundsMinor: 500, chargebacksMinor: 500, providerFeesMinor: 1000, verified: true, reconciled: true, status: "eligible" };

test("allocates reconciled eligible ad revenue 30/20/50 after deductions", () => {
  assert.deepEqual(allocateEligibleAdRevenue(ad), { ok: true, value: { creatorMinor: 2400, sharerMinor: 1600, platformMinor: 4000, distributableMinor: 8000 } });
});
test("rejects unverified, unreconciled, pending and wrong-source revenue", () => {
  for (const patch of [{ verified: false }, { reconciled: false }, { status: "pending" }, { source: "paid_course_net_revenue" }])
    assert.equal(allocateEligibleAdRevenue({ ...ad, ...patch }).ok, false);
});
test("rejects invalid money, currency and deductions exceeding gross", () => {
  assert.equal(allocateEligibleAdRevenue({ ...ad, grossMinor: -1 }).ok, false);
  assert.equal(allocateEligibleAdRevenue({ ...ad, currency: "INR!" }).ok, false);
  assert.equal(allocateEligibleAdRevenue({ ...ad, providerFeesMinor: 10001 }).ok, false);
  assert.equal(allocateEligibleAdRevenue({ ...ad, grossMinor: 1.5 }).ok, false);
});
test("teacher referral is 2 percent of verified reconciled eligible paid-course platform net profit", () => {
  const input = { eligiblePaidCourse: true, revenueVerified: true, reconciled: true, platformNetProfitMinor: 12345, currency: "INR" };
  assert.deepEqual(calculateTeacherReferralMinor(input), { ok: true, value: 246 });
  assert.equal(calculateTeacherReferralMinor({ ...input, eligiblePaidCourse: false }).ok, false);
  assert.equal(calculateTeacherReferralMinor({ ...input, revenueVerified: false }).ok, false);
  assert.equal(calculateTeacherReferralMinor({ ...input, reconciled: false }).ok, false);
});
test("teacher referral rejects negative or non-integer net profit", () => {
  const base = { eligiblePaidCourse: true, revenueVerified: true, reconciled: true, platformNetProfitMinor: 1000, currency: "INR" };
  assert.equal(calculateTeacherReferralMinor({ ...base, platformNetProfitMinor: -1 }).ok, false);
  assert.equal(calculateTeacherReferralMinor({ ...base, platformNetProfitMinor: 10.25 }).ok, false);
});
test("ledger append is idempotent and requires verified reconciled entry", () => {
  assert.equal(canAppendLedgerEntry({ entryId: "e1", existingEntryIds: [], verified: true, reconciled: true }), true);
  assert.equal(canAppendLedgerEntry({ entryId: "e1", existingEntryIds: ["e1"], verified: true, reconciled: true }), false);
  assert.equal(canAppendLedgerEntry({ entryId: "e2", existingEntryIds: [], verified: false, reconciled: true }), false);
});
test("reversals require existing unreversed original and distinct safe identity", () => {
  const base = { originalEntryId: "e1", reversalEntryId: "rev1", originalExists: true, alreadyReversed: false };
  assert.equal(canCreateReversal(base), true);
  assert.equal(canCreateReversal({ ...base, alreadyReversed: true }), false);
  assert.equal(canCreateReversal({ ...base, reversalEntryId: "e1" }), false);
});
test("payout readiness fails closed unless every independent gate passes", () => {
  const all = { ledgerReconciled: true, recipientVerified: true, taxAndComplianceCleared: true, payoutProviderConfigured: true, explicitAdminApproval: true, livePayoutsEnabled: true };
  assert.equal(isPayoutReady(all), true);
  for (const key of Object.keys(all)) assert.equal(isPayoutReady({ ...all, [key]: false }), false);
});
