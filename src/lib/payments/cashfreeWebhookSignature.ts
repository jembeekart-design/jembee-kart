import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Cashfree signs the exact concatenation of x-webhook-timestamp and raw body.
 * Timestamp freshness is intentionally not inferred here; apply a freshness
 * policy only after confirming the provider's delivery/retry guarantees.
 */
export function verifyCashfreeWebhookSignature(
  rawBody: string,
  timestamp: string,
  signature: string,
  secret: string,
): boolean {
  if (!timestamp || timestamp.length > 64 || !signature || signature.length > 512 || !secret) return false;
  const expected = createHmac("sha256", secret).update(timestamp, "utf8").update(rawBody, "utf8").digest("base64");
  const expectedBytes = Buffer.from(expected, "utf8");
  const receivedBytes = Buffer.from(signature, "utf8");
  return expectedBytes.length === receivedBytes.length && timingSafeEqual(expectedBytes, receivedBytes);
}
