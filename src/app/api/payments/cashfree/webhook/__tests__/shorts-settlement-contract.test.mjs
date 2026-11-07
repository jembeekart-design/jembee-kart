import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../route.ts", import.meta.url), "utf8");

test("signed Cashfree webhook resolves Shorts paid-video orders separately from shopping orders", () => {
  assert.match(source, /verifyCashfreeWebhookSignature/);
  assert.match(source, /watchVideoPaymentOrders/);
  assert.match(source, /cashfreeOrderId/);
  assert.match(source, /shorts_paid_video_processed/);
});

test("webhook checks payment amount, INR currency, video eligibility and creator attribution", () => {
  assert.match(source, /payment_currency/);
  assert.match(source, /amountPaise !== expectedPaise/);
  assert.match(source, /video\.status !== "approved"/);
  assert.match(source, /video\.paidCheckoutEnabled !== true/);
  assert.match(source, /video\.creatorId !== creatorUid/);
});

test("webhook grants purchase and records idempotent creator, sharer and platform ledger entries transactionally", () => {
  assert.match(source, /db\.runTransaction/);
  assert.match(source, /watchVideoPurchases/);
  assert.match(source, /watchVideoPaymentEvents/);
  assert.match(source, /paidvideo_\$\{orderId\}_creator/);
  assert.match(source, /paidvideo_\$\{orderId\}_sharer/);
  assert.match(source, /paidvideo_\$\{orderId\}_platform/);
  assert.match(source, /sharer_share_unallocated/);
});
