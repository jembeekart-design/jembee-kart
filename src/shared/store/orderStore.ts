// src/shared/store/orderStore.ts

let orders: any[] = [];
const listeners: Function[] = [];

const notify = () => listeners.forEach((l) => l(orders));

export const orderStore = {
  subscribe: (cb: Function) => {
    listeners.push(cb);
    return () => {
      const i = listeners.indexOf(cb);
      if (i > -1) listeners.splice(i, 1);
    };
  },

  get: () => orders,

  add: (order: any) => {
    orders.unshift(order);
    notify();
  },

  update: (id: string, updates: any) => {
    orders = orders.map((o) =>
      o.id === id ? { ...o, ...updates } : o
    );
    notify();
  },
};