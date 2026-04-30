// src/shared/realtime/orderLive.ts

import { socket } from "./socket";
import { EVENTS } from "./events";

type OrderListener = (data: any) => void;

export const subscribeOrder = (orderId: string, cb: OrderListener) => {
  socket.on(EVENTS.ORDER_UPDATED, (data) => {
    if (data.orderId === orderId) {
      cb(data);
    }
  });

  socket.on(EVENTS.ORDER_TRACKING, (data) => {
    if (data.orderId === orderId) {
      cb(data);
    }
  });
};

export const notifyOrderUpdate = (data: any) => {
  socket.send(EVENTS.ORDER_UPDATED, data);
};