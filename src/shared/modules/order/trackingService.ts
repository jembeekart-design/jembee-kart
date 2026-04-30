export const getTracking = (orderId: string) => {
  return {
    orderId,
    status: "shipped",
    location: "In transit",
    updatedAt: Date.now(),
  };
};