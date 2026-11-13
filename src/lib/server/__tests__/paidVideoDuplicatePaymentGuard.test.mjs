import test from "node:test";
import assert from "node:assert/strict";
import { isPaidOrderDuplicatePayment } from "../paidVideoDuplicatePaymentGuard.mjs";

test("same payment identity is an idempotent paid-order replay", () => {
  assert.equal(isPaidOrderDuplicatePayment("paid", "cf_123", "cf_123"), false);
});

test("different payment identity on a paid order requires manual review", () => {
  assert.equal(isPaidOrderDuplicatePayment("paid", "cf_123", "cf_456"), true);
});

test("paid order without a recorded payment identity fails closed for review", () => {
  assert.equal(isPaidOrderDuplicatePayment("paid", undefined, "cf_456"), true);
});

test("pending orders are not classified as duplicate paid payments", () => {
  assert.equal(isPaidOrderDuplicatePayment("pending", undefined, "cf_456"), false);
});

test("empty incoming identity is not treated as a verified second payment", () => {
  assert.equal(isPaidOrderDuplicatePayment("paid", "cf_123", "  "), false);
});
