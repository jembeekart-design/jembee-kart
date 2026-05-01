import { Cashfree, CFEnvironment } from "cashfree-pg";

const cf = new Cashfree(
  CFEnvironment.SANDBOX, // change to PRODUCTION later
  process.env.CASHFREE_APP_ID!,
  process.env.CASHFREE_SECRET_KEY!
);

export const createCashfreeOrder = async (orderData: any) => {
  return await cf.PGCreateOrder({
    order_id: orderData.orderId,
    order_amount: orderData.amount,
    order_currency: "INR",
    customer_details: {
      customer_id: orderData.customerId,
      customer_email: orderData.email,
      customer_phone: orderData.phone,
    },
  });
};
