// src/shared/realtime/events/eventHandlers.ts

import { eventBus } from "./eventBus";
import { EVENTS } from "../events";

// 🔹 Order update handler
eventBus.on(EVENTS.ORDER_UPDATED, (data) => {
  console.log("Order Updated:", data);
});

// 🔹 Notification handler
eventBus.on(EVENTS.NOTIFICATION, (data) => {
  console.log("New Notification:", data);
});

// 🔹 Cart update handler
eventBus.on(EVENTS.CART_UPDATED, (data) => {
  console.log("Cart Updated:", data);
});