export const OrderStatus = {
  CREATED: "created",
  PAID: "paid",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
};

export const nextStatus = (current: string) => {
  const flow = [
    "created",
    "paid",
    "processing",
    "shipped",
    "delivered",
  ];

  const index = flow.indexOf(current);
  return flow[index + 1] || current;
};