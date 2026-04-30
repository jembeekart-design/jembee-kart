// src/integrations/payments/cashfree/webhook.ts

import crypto from "crypto";

/**
 * Cashfree sends headers:
 *  x-webhook-signature
 *  x-webhook-timestamp
 */
const verifySignature = (
  body: string,
  signature: string,
  timestamp: string
) => {
  const secret = process.env.CASHFREE_WEBHOOK_SECRET!;
  const signedPayload = timestamp + body;

  const computed = crypto
    .createHmac("sha256", secret)
    .update(signedPayload)
    .digest("base64");

  return computed === signature;
};

export type CFWebhookEvent = {
  type: string;
  data: any;
};

export const handleCFWebhook = async (
  rawBody: string,
  headers: Headers
) => {
  const sig = headers.get("x-webhook-signature") || "";
  const ts = headers.get("x-webhook-timestamp") || "";

  if (!verifySignature(rawBody, sig, ts)) {
    throw new Error("Invalid webhook signature");
  }

  const payload = JSON.parse(rawBody) as CFWebhookEvent;

  const orderId = payload?.data?.order?.order_id;
  const paymentStatus = payload?.data?.payment?.payment_status; // SUCCESS | FAILED

  // 👉 यहाँ अपने order/payment DB update करो
  // e.g. markOrderPaid(orderId)

  return {
    orderId,
    paymentStatus,
    ok: true,
  };
};