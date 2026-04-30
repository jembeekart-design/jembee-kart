export const validatePayment = (data: any) => {
  if (!data.orderId) throw new Error("Order required");
  if (!data.amount) throw new Error("Amount required");
  return true;
};