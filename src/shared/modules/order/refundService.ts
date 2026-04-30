export const processRefund = (order: any) => {
  return {
    orderId: order.id,
    amount: order.total,
    status: "refunded",
    processedAt: Date.now(),
  };
};