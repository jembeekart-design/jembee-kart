// src/integrations/payments/cashfree/verifyPayment.ts

import { Cashfree } from "cashfree-pg";

const cf = new Cashfree({
  appId: process.env.CASHFREE_APP_ID!,
  secretKey: process.env.CASHFREE_SECRET_KEY!,
});

export const verifyCFOrder = async (orderId: string) => {
  const res = await cf.PGFetchOrder(orderId);

  const status = res.data.order_status; // PAID | ACTIVE | EXPIRED | FAILED

  return {
    orderId,
    status,
    isPaid: status === "PAID",
    raw: res.data,
  };
};