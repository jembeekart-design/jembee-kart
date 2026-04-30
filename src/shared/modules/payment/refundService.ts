export const initiateRefund = (payment: any) => {
  return {
    paymentId: payment.id,
    amount: payment.amount,
    status: "refunded",
    processedAt: Date.now(),
  };
};