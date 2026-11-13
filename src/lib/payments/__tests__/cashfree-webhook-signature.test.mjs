import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { verifyCashfreeWebhookSignature } from "../cashfreeWebhookSignature.ts";

const secret = "phase37-test-secret";
const timestamp = "1794595200000";
const rawBody = '{"type":"PAYMENT_SUCCESS","data":{"payment":{"cf_payment_id":123}}}';
const sign = (ts, body) => createHmac("sha256", secret).update(ts, "utf8").update(body, "utf8").digest("base64");

test("Cashfree signature follows timestamp concatenated with the exact raw body", () => {
  assert.equal(verifyCashfreeWebhookSignature(rawBody, timestamp, sign(timestamp, rawBody), secret), true);
});

test("Cashfree signature rejects payload changes and timestamp changes", () => {
  const signature = sign(timestamp, rawBody);
  assert.equal(verifyCashfreeWebhookSignature(`${rawBody} `, timestamp, signature, secret), false);
  assert.equal(verifyCashfreeWebhookSignature(rawBody, `${timestamp}1`, signature, secret), false);
});

test("Cashfree signature rejects missing timestamp or signature", () => {
  const signature = sign(timestamp, rawBody);
  assert.equal(verifyCashfreeWebhookSignature(rawBody, "", signature, secret), false);
  assert.equal(verifyCashfreeWebhookSignature(rawBody, timestamp, "", secret), false);
});

test("Cashfree signature rejects oversized timestamp and signature headers", () => {
  assert.equal(verifyCashfreeWebhookSignature(rawBody, "1".repeat(65), sign(timestamp, rawBody), secret), false);
  assert.equal(verifyCashfreeWebhookSignature(rawBody, timestamp, "A".repeat(513), secret), false);
});
