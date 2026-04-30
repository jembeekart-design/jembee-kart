// src/integrations/payments/cashfree/createOrder.ts

import { Cashfree } from "cashfree-pg";

const cf = new Cashfree({
  appId: process.env.CASHFREE_APP_ID!,
  secretKey: process.env.CASHFREE_SECRET_KEY!,
  // optional: env switch
  // environment: process.env.CASHFREE_ENV === "PROD" ? "PRODUCTION" : "TEST",
});

export type CreateCFOrderInput = {
  orderId: string;          // your internal order id
  amount: number;           // INR
  userId: string;
  email: string;
  phone: string;
  returnUrl?: string;       // where user lands after payment
};

export const createCFOrder = async (input: CreateCFOrderInput) => {
  const req = {
    order_id: input.orderId,
    order_amount: input.amount,
    order_currency: "INR",
    customer_details: {
      customer_id: input.userId,
      customer_email: input.email,
      customer_phone: input.phone,
    },
    order_meta: {
      return_url:
        input.returnUrl ||
        `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?order_id={order_id}`,
    },
  };

  const res = await cf.PGCreateOrder(req);

  return {
    orderId: input.orderId,
    paymentLink: res.data.payment_link,
    cfOrderId: res.data.order_id,
    status: res.data.order_status,
  };
};