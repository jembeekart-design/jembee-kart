import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const read = (rel) => fs.readFileSync(path.resolve(process.cwd(), rel), "utf8");
const verify = read("src/app/api/shorts/paid-video/verify/route.ts");
const webhook = read("src/app/api/payments/cashfree/webhook/route.ts");
const create = read("src/app/api/shorts/paid-video/create-order/route.ts");

test("checkout creates a pending order and reuses only a still-valid pending session", () => {
  assert.match(create, /status === "pending"/);
  assert.match(create, /tx\.create\(orderRef, \{/);
  assert.match(create, /status: "pending", paymentProvider: "cashfree"/);
});

test("webhook rejects cancelled and expired orders before granting access", () => {
  assert.match(webhook, /\["cancelled", "expired"\]\.includes\(String\(current\.status\)\)/);
});

test("webhook marks a second distinct successful payment for manual review", () => {
  assert.match(webhook, /current\.status === "paid" && current\.cfPaymentId !== paymentId/);
  assert.match(webhook, /duplicatePaymentReviewRequired: true/);
  assert.match(webhook, /duplicatePaymentId: paymentId/);
  assert.ok(webhook.indexOf("duplicatePaymentReviewRequired: true") < webhook.indexOf("tx.set(purchaseRef"));
});

test("buyer recovery commits duplicate-payment review without granting another purchase or ledger", () => {
  assert.match(verify, /isPaidOrderDuplicatePayment\(freshOrderData\?\.status, freshOrderData\?\.cfPaymentId, paymentId\)/);
  assert.match(verify, /duplicatePaymentReviewRequired: true/);
  assert.match(verify, /duplicatePaymentId: paymentId/);
  assert.match(verify, /return \{ status: "duplicate_payment_review" as const \}/);
  assert.match(verify, /if \(transactionResult\.status === "duplicate_payment_review"\)/);
  assert.match(verify, /DUPLICATE_PAYMENT_REVIEW_REQUIRED/);
  const marker = verify.indexOf("duplicatePaymentReviewRequired: true");
  const purchaseWrite = verify.indexOf("tx.set(purchaseRef");
  const paymentEventWrite = verify.indexOf("tx.create(paymentEventRef");
  const ledgerWrite = verify.indexOf("tx.create(ledgerRefs[0]");
  assert.ok(marker >= 0 && marker < purchaseWrite && marker < paymentEventWrite && marker < ledgerWrite);
});

test("duplicate-payment review marker has no admin resolution route or UI reference", () => {
  const adminRoot = path.resolve(process.cwd(), "src/app/admin");
  const apiRoot = path.resolve(process.cwd(), "src/app/api/admin");
  const matches = [];
  for (const base of [adminRoot, apiRoot]) {
    if (!fs.existsSync(base)) continue;
    const walk = (dir) => {
      for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, ent.name);
        if (ent.isDirectory()) walk(full);
        else if (/\.(ts|tsx|js|mjs)$/.test(ent.name) && !full.includes(`${path.sep}__tests__${path.sep}`)) {
          const text = fs.readFileSync(full, "utf8");
          if (/duplicatePaymentReviewRequired|duplicatePaymentId/.test(text)) matches.push(path.relative(process.cwd(), full));
        }
      }
    };
    walk(base);
  }
  assert.deepEqual(matches, []);
});

test("refund reconciliation is separate and only reconciles provider-confirmed refunds for the recorded payment", () => {
  const refund = read("src/app/api/admin/shorts/paid-video-refunds/reconcile/route.ts");
  assert.match(refund, /current\.cfPaymentId !== order\.cfPaymentId/);
  assert.match(refund, /refund_status/);
  assert.match(refund, /status !== "SUCCESS"/);
  assert.match(refund, /createdByAdminUid: actorUid/);
});
