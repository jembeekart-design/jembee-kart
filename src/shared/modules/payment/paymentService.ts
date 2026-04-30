import { validatePayment } from "./paymentSchema";
import { initiateRefund } from "./refundService";

let payments: any[] = [];

// 🧾 Create Payment
export const createPayment = (data: any) => {
  validatePayment(data);

  const payment = {
    id: "pay_" + Date.now(),
    ...data,
    status: "created",
    createdAt: Date.now(),
  };

  payments.push(payment);
  return payment;
};

// 💳 Process Payment (Mock gateway)
export const processPayment = (paymentId: string) => {
  const p = payments.find((x) => x.id === paymentId);
  if (!p) throw new Error("Payment not found");

  // simulate success
  p.status = "success";
  return p;
};

// 📊 Get Payment
export const getPayment = (id: string) =>
  payments.find((p) => p.id === id);

// 🔁 Refund
export const refundPayment = (id: string) => {
  const p = getPayment(id);
  if (!p) throw new Error("Payment not found");

  const refund = initiateRefund(p);
  p.status = "refunded";

  return refund;
};