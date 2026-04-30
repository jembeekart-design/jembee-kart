import { validateOrder } from "./orderSchema";
import { nextStatus } from "./orderFlow";
import { generateInvoice } from "./invoiceService";
import { getTracking } from "./trackingService";
import { requestReturn } from "./returnService";
import { processRefund } from "./refundService";

let orders: any[] = [];

// 🛒 Create Order
export const createOrder = (data: any) => {
  validateOrder(data);

  const order = {
    id: Date.now().toString(),
    ...data,
    status: "created",
    createdAt: Date.now(),
  };

  orders.push(order);
  return order;
};

// 📊 Get Orders
export const getOrders = () => orders;

// 🔍 Get Order
export const getOrder = (id: string) =>
  orders.find((o) => o.id === id);

// 🔄 Update Status
export const updateOrderStatus = (id: string) => {
  const order = getOrder(id);
  if (!order) throw new Error("Order not found");

  order.status = nextStatus(order.status);
  return order;
};

// 📄 Invoice
export const getInvoice = (id: string) => {
  const order = getOrder(id);
  return generateInvoice(order);
};

// 🚚 Tracking
export const trackOrder = (id: string) => {
  return getTracking(id);
};

// 🔁 Return
export const returnOrder = (id: string, reason: string) => {
  return requestReturn(id, reason);
};

// 💸 Refund
export const refundOrder = (id: string) => {
  const order = getOrder(id);
  return processRefund(order);
};