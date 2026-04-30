export type PaymentStatus =
  | "created"
  | "pending"
  | "success"
  | "failed"
  | "refunded";

export type Payment = {
  id: string;
  orderId: string;
  amount: number;
  method: "razorpay" | "stripe" | "cod";
  status: PaymentStatus;
  createdAt: number;
};