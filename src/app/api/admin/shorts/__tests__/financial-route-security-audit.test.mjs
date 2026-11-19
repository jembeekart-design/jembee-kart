import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const read = (rel) => fs.readFileSync(path.resolve(process.cwd(), rel), "utf8");
const webhook = read("src/app/api/payments/cashfree/webhook/route.ts");
const verify = read("src/app/api/shorts/paid-video/verify/route.ts");
const refund = read("src/app/api/admin/shorts/paid-video-refunds/reconcile/route.ts");
const referral = read("src/app/api/admin/shorts/teacher-referral/reconcile/route.ts");
const create = read("src/app/api/shorts/paid-video/create-order/route.ts");
const playback = read("src/app/api/shorts/paid-video/playback-session/route.ts");

test("Cashfree webhook validates signature before parsing or touching order data", () => {
  const signature = webhook.indexOf("verifyCashfreeWebhookSignature");
  const parse = webhook.indexOf("JSON.parse(rawBody)");
  const query = webhook.indexOf('collection("watchVideoPaymentOrders")');
  assert.ok(signature >= 0 && signature < parse && signature < query);
  assert.match(webhook, /x-webhook-signature/);
  assert.match(webhook, /x-webhook-timestamp/);
  assert.match(webhook, /readBoundedRawBody\(req, 128 \* 1024\)/);
});
test("Cashfree webhook reconciles exact INR amount and payment identity", () => {
  assert.match(webhook, /payment_status[\s\S]{0,100}SUCCESS/);
  assert.match(webhook, /payment_currency[\s\S]{0,100}INR/);
  assert.match(webhook, /amountPaise !== expectedPaise/);
  assert.match(webhook, /payment\.order_id !== providerOrderId/);
  assert.match(webhook, /SHORTS_PAYMENT_ID_REUSED/);
  assert.match(webhook, /duplicatePaymentReviewRequired: true/);
});
test("paid-video verify requires a revocation-checked Firebase ID token and bounded JSON", () => {
  assert.match(verify, /verifyIdToken\(header\.slice\(7\)\.trim\(\), true\)/);
  assert.match(verify, /readBoundedJson\(req, 4 \* 1024\)/);
  assert.match(verify, /freshOrderData\?\.userId !== uid/);
  assert.match(verify, /MULTIPLE_SUCCESSFUL_PAYMENTS_REVIEW_REQUIRED/);
  assert.match(verify, /Cache-Control[\s\S]{0,30}no-store/);
});
test("refund reconciliation requires revocation-checked token and admin role", () => {
  assert.match(refund, /verifyIdToken\(auth\.slice\(7\)\.trim\(\), true\)/);
  assert.match(refund, /role !== "admin" && role !== "super_admin"/);
  assert.match(webhook, /readBoundedRawBody\(req, 128 \* 1024\)/);
  assert.match(refund, /cashfreeRequest[\s\S]{0,160}\/orders\/[\s\S]{0,100}\/refunds/);
  assert.match(refund, /PROVIDER_TOTAL_REGRESSED/);
  assert.match(refund, /pending_settlement_reversal/);
});
test("teacher referral reconciliation requires admin role and verified paid order", () => {
  assert.match(referral, /verifyIdToken\(header\.slice\(7\)\.trim\(\), true\)/);
  assert.match(referral, /role !== "admin" && user\?\.role !== "super_admin"/);
  assert.match(referral, /order\.status !== "paid"/);
  assert.match(referral, /referral\.status === "verified"/);
  assert.match(referral, /amountPaise: commissionPaise/);
  assert.match(referral, /amountPaise: commissionDeltaPaise/);
});
test("paid-video order creation checks buyer, eligibility, price and server-side attribution", () => {
  assert.match(create, /verifyIdToken\(authHeader\.slice\(7\)\.trim\(\), true\)/);
  assert.match(create, /video\.paidCheckoutEnabled !== true/);
  assert.match(create, /video\.creatorId === uid/);
  assert.match(create, /pricePaise < 100 \|\| pricePaise > 10_000_000/);
  assert.match(create, /claim\.status === "claimed"/);
  assert.match(create, /tx\.create\(orderRef/);
});
test("paid playback requires an owned verified purchase and short-lived secure cookie", () => {
  assert.match(playback, /verifyIdToken\(authorization\.slice\(7\)\.trim\(\), true\)/);
  assert.match(playback, /purchase\.userId !== decoded\.uid/);
  assert.match(playback, /purchase\.accessRevoked === true/);
  assert.match(playback, /HttpOnly; Secure; SameSite=Lax; Max-Age=900/);
  assert.match(playback, /Cache-Control": "no-store"/);
});
test("financial route success responses prevent shared caching", () => {
  for (const [name, source] of [["webhook",webhook],["verify",verify],["refund",refund],["referral",referral],["create-order",create],["playback",playback]]) {
    assert.match(source, /Cache-Control/ , `${name} must set cache policy`);
    assert.match(source, /no-store/, `${name} must disable shared caching`);
  }
});
