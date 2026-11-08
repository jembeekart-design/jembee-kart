import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../route.ts", import.meta.url), "utf8");

test("refund reconciliation is admin authenticated", () => {
  assert.match(source, /verifyIdToken\(auth\.slice\(7\)\.trim\(\), true\)/);
  assert.match(source, /role !== "admin" && role !== "super_admin"/);
});

test("only verified paid-video orders are reconciled", () => {
  assert.match(source, /watchVideoPaymentOrders/);
  assert.match(source, /order\.status !== "paid"/);
  assert.match(source, /order\.cfPaymentId/);
  assert.match(source, /watchVideoPurchases/);
});

test("Cashfree SUCCESS refunds alone affect the reversal total", () => {
  assert.match(source, /status !== "SUCCESS"/);
  assert.match(source, /manual review required/);
  assert.match(source, /refunds exceed original payment/);
});

test("reversal entries are deterministic and transactionally committed", () => {
  assert.match(source, /runTransaction/);
  assert.match(source, /paidvideo_refund_\$\{orderId\}_\$\{suffix\}_creator/);
  assert.match(source, /pending_settlement_reversal/);
});

test("full refund revokes the purchase entitlement", () => {
  assert.match(source, /confirmedPaise === originalPaise/);
  assert.match(source, /accessRevoked: true/);
  assert.match(source, /status: "refunded"/);
});

test("refund reconciliation never credits a wallet or initiates a payout", () => {
  assert.doesNotMatch(source, /wallets?\.doc|payouts?\.doc|transfer\(/i);
});
