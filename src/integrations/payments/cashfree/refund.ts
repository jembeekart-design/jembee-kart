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
  const res = await cf.PGOrderFetchPayments(orderId);

  // ⚠️ demo logic (real refund API अलग से लगेगा)
  return {
    success: true,
    message: "Refund API placeholder",
    data: res,
  };
};
