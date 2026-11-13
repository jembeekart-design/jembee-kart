import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const read = (rel) => fs.readFileSync(path.resolve(process.cwd(), rel), "utf8");
const verify = read("src/app/api/shorts/paid-video/verify/route.ts");
const webhook = read("src/app/api/payments/cashfree/webhook/route.ts");
const refund = read("src/app/api/admin/shorts/paid-video-refunds/reconcile/route.ts");

test("authenticated owner verification provides a provider-backed webhook recovery path", () => {
  assert.match(verify, /verifyIdToken\(header\.slice\(7\)\.trim\(\), true\)/);
  assert.match(verify, /orderSnap\.data\(\)\?\.userId !== uid/);
  assert.match(verify, /\/orders\/\$\{encodeURIComponent\(providerOrderId\)\}\/payments/);
  assert.match(verify, /payment_status\?\.toUpperCase\(\) === "SUCCESS"/);
  assert.match(verify, /payment\.order_id === providerOrderId/);
  assert.match(verify, /payment\.payment_currency\?\.toUpperCase\(\) === "INR"/);
});

test("recovery refuses ambiguous multiple successful provider payment attempts", () => {
  assert.match(verify, /successful\.length === 0/);
  assert.match(verify, /successful\.length > 1/);
  assert.match(verify, /MULTIPLE_SUCCESSFUL_PAYMENTS_REVIEW_REQUIRED/);
});

test("recovery commits purchase, order, payment event and ledger in one Firestore transaction", () => {
  assert.match(verify, /db\.runTransaction\(async \(tx\)/);
  assert.match(verify, /watchVideoPaymentEvents/);
  assert.match(verify, /if \(!paymentEvent\.exists\) tx\.create\(paymentEventRef/);
  assert.match(verify, /if \(!creatorLedger\.exists\) tx\.create/);
  assert.match(verify, /if \(!sharerLedger\.exists\) tx\.create/);
  assert.match(verify, /if \(!platformLedger\.exists\) tx\.create/);
});

test("webhook event identity is cf_payment_id and cross-order reuse is rejected", () => {
  assert.match(webhook, /watchVideoPaymentEvents"\)\.doc\(paymentId\)/);
  assert.match(webhook, /eventSnap\.data\(\)\?\.orderId !== orderId/);
  assert.match(webhook, /SHORTS_PAYMENT_ID_REUSED/);
});

test("refund reconciliation rechecks order and cumulative refund watermark transactionally", () => {
  assert.match(refund, /current\.cfPaymentId !== order\.cfPaymentId/);
  assert.match(refund, /confirmedPaise < previous/);
  assert.match(refund, /confirmedPaise === previous/);
  assert.match(refund, /shortsRefundedPaise: confirmedPaise/);
});
