export const requestReturn = (orderId: string, reason: string) => {
  return {
    orderId,
    status: "return_requested",
    reason,
    createdAt: Date.now(),
  };
};