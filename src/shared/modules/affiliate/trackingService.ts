// src/shared/modules/affiliate/trackingService.ts

type Click = {
  code: string;
  productId: string;
  userId: string;
  time: number;
};

type OrderTrack = {
  orderId: string;
  code: string;
  commission: number;
};

let clicks: Click[] = [];
let orders: OrderTrack[] = [];

// 🔹 Track click
export const trackClick = (data: Click) => {
  clicks.push(data);
};

// 🔹 Track order
export const trackOrder = (data: OrderTrack) => {
  orders.push(data);
};

// 🔹 Get analytics
export const getTrackingStats = (userId: string) => {
  const userClicks = clicks.filter((c) => c.userId === userId);

  const userOrders = orders.filter((o) =>
    userClicks.some((c) => c.code === o.code)
  );

  const total = userOrders.reduce((sum, o) => sum + o.commission, 0);

  return {
    clicks: userClicks.length,
    orders: userOrders.length,
    earnings: total,
  };
};