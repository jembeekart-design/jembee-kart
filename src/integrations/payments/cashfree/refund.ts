// src/integrations/payments/cashfree/refund.ts

import { Cashfree } from "cashfree-pg";

const cf = new Cashfree({
  appId: process.env.CASHFREE_APP_ID!,
  secretKey: process.env.CASHFREE_SECRET_KEY!,
});

export const refundCFPayment = async (args: {
  orderId: string;
  refundAmount: number;
  refundId?: string;
  refundNote?: string;
}) => {
  const refund_id = args.refundId || `refund_${Date.now()}`;

  const req = {
    order_id: args.orderId,
    refund_id,
    refund_amount: args.refundAmount,
    refund_note: args.refundNote || "Customer return/refund",
  };

  const res = await cf.PGOrderRefunds(req);

  return {
    orderId: args.orderId,
    refundId: refund_id,
    status: res.data?.refund_status || "PENDING",
    raw: res.data,
  };
};