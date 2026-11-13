import { test } from "node:test";
import assert from "node:assert/strict";
import {
  getObservedSettlementEntryPolicy, validateObservedSettlementEntry,
  planSettlementLedgerCreates, canMutateObservedSettlementEntry,
  makePaidVideoLedgerDocumentIds,
} from "../settlement-ledger-repository-contracts.ts";

const row = (patch = {}) => ({
  orderId: "order_1", videoId: "video_1", entryType: "creator_share",
  beneficiaryUid: "creator_1", amountPaise: 7000, currency: "INR",
  source: "cashfree_verified_paid_video", status: "pending_settlement", ...patch,
});

test("supports only the entry types observed in current settlement routes", () => {
  for (const type of ["creator_share","sharer_share","sharer_share_unallocated","platform_share",
    "creator_share_reversal","sharer_share_reversal","platform_share_reversal",
    "teacher_referral_commission","teacher_referral_commission_adjustment","admin_net_profit"])
    assert.ok(getObservedSettlementEntryPolicy(type));
  assert.equal(getObservedSettlementEntryPolicy("generic_earning"), null);
});
test("validates existing INR paise row shape and rejects unsafe values", () => {
  assert.equal(validateObservedSettlementEntry(row()).ok, true);
  for (const patch of [{ amountPaise: 1.25 }, { amountPaise: Number.MAX_SAFE_INTEGER + 1 },
    { currency: "USD" }, { orderId: "../order" }, { entryType: "unknown" }])
    assert.equal(validateObservedSettlementEntry(row(patch)).ok, false);
});
test("reversal rows must be non-positive and adjustments may be signed", () => {
  assert.equal(validateObservedSettlementEntry(row({ entryType: "creator_share_reversal", amountPaise: -100 })).ok, true);
  assert.equal(validateObservedSettlementEntry(row({ entryType: "creator_share_reversal", amountPaise: 100 })).ok, false);
  assert.equal(validateObservedSettlementEntry(row({ entryType: "teacher_referral_commission_adjustment", amountPaise: -50 })).ok, true);
  assert.equal(validateObservedSettlementEntry(row({ entryType: "teacher_referral_commission_adjustment", amountPaise: 50 })).ok, true);
});
test("enforces unallocated sharer and platform admin beneficiary semantics", () => {
  assert.equal(validateObservedSettlementEntry(row({ entryType: "sharer_share_unallocated", beneficiaryUid: null })).ok, true);
  assert.equal(validateObservedSettlementEntry(row({ entryType: "sharer_share_unallocated", beneficiaryUid: "u1" })).ok, false);
  assert.equal(validateObservedSettlementEntry(row({ entryType: "admin_net_profit", beneficiaryUid: "platform_admin" })).ok, true);
  assert.equal(validateObservedSettlementEntry(row({ entryType: "admin_net_profit", beneficiaryUid: "u1" })).ok, false);
});
test("create plan skips existing deterministic IDs and preserves fields", () => {
  const data = row();
  const result = planSettlementLedgerCreates([{ documentId: "paidvideo_order_1_creator", data }], ["paidvideo_order_1_creator"]);
  assert.equal(result.ok, true);
  assert.deepEqual(result.creates, []);
  assert.deepEqual(result.skips, ["paidvideo_order_1_creator"]);
  assert.equal(result.readBeforeWriteRequired, true);
});
test("create plan rejects duplicate IDs and invalid rows before any write", () => {
  const item = { documentId: "ledger_1", data: row() };
  assert.equal(planSettlementLedgerCreates([item, item]).reason, "DUPLICATE_DOCUMENT_ID_IN_BATCH");
  assert.equal(planSettlementLedgerCreates([{ ...item, data: row({ amountPaise: -1 }) }]).ok, false);
});
test("ledger entries are read-only; correction requires compensating append", () => {
  assert.equal(canMutateObservedSettlementEntry("update", "creator_share"), false);
  assert.equal(canMutateObservedSettlementEntry("delete", "creator_share"), false);
  assert.equal(canMutateObservedSettlementEntry("append_compensation", "creator_share"), true);
  assert.equal(canMutateObservedSettlementEntry("read", "creator_share"), true);
});
test("generates only known paid-video document IDs and rejects unsafe order IDs", () => {
  assert.deepEqual(makePaidVideoLedgerDocumentIds("o1"), {
    creator: "paidvideo_o1_creator", sharer: "paidvideo_o1_sharer",
    platform: "paidvideo_o1_platform", adminNetProfit: "paidvideo_o1_admin_net_profit",
    teacherReferral: "paidvideo_o1_teacher_referral",
  });
  assert.equal(makePaidVideoLedgerDocumentIds("../bad"), null);
});
