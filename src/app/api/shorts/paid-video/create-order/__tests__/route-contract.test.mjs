import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../route.ts", import.meta.url), "utf8");

test("paid-video checkout authenticates buyer and validates server-owned video state", () => {
  assert.match(source, /verifyIdToken\(authHeader\.slice\(7\)\.trim\(\), true\)/);
  assert.match(source, /watchEarnVideos/);
  assert.match(source, /video\.status !== "approved"/);
  assert.match(source, /video\.moderation !== "safe"/);
  assert.match(source, /video\.paidCheckoutEnabled !== true/);
  assert.match(source, /video\.creatorId === uid/);
});

test("checkout price is read from Firestore and bounded in integer paise", () => {
  assert.match(source, /amountPaise\(video\.videoPrice\)/);
  assert.match(source, /pricePaise < 100 \|\| pricePaise > 10_000_000/);
  assert.match(source, /order_amount: pricePaise \/ 100/);
  assert.doesNotMatch(source, /body\.price|body\.amount/);
});

test("Cashfree order creation is idempotent and persists attribution server-side", () => {
  assert.match(source, /cashfreeRequest<CashfreeOrder>/);
  assert.match(source, /deterministicUuid/);
  assert.match(source, /teacherReferralAttributions/);
  assert.match(source, /monetagShareClaims/);
  assert.match(source, /sharerAttributionVerified: Boolean\(sharerId\)/);
  assert.match(source, /tx\.create\(orderRef/);
});

test("existing paid purchase bypasses a second payment order", () => {
  assert.match(source, /alreadyPurchased: true/);
  assert.match(source, /watchVideoPurchases/);
});
