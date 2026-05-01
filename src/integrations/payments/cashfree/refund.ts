import { Cashfree, CFEnvironment } from "cashfree-pg";

const cf = new Cashfree(
  CFEnvironment.SANDBOX,
  process.env.CASHFREE_APP_ID!,
  process.env.CASHFREE_SECRET_KEY!
);

export const refundOrder = async (
  orderId: string,
  refundAmount: number
) => {
  const res = await cf.PGRefundOrder({
    order_id: orderId,
    refund_amount: refundAmount,
    refund_id: `refund_${Date.now()}`,
  });

  return res;
};
