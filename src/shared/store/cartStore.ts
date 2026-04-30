// src/shared/store/cartStore.ts

type CartItem = { id: string; qty: number; price: number };

let cart: CartItem[] = [];
const listeners: Function[] = [];

const notify = () => listeners.forEach((l) => l(cart));

export const cartStore = {
  subscribe: (cb: Function) => {
    listeners.push(cb);
    return () => {
      const i = listeners.indexOf(cb);
      if (i > -1) listeners.splice(i, 1);
    };
  },

  get: () => cart,

  add: (item: CartItem) => {
    const existing = cart.find((c) => c.id === item.id);
    if (existing) existing.qty += item.qty;
    else cart.push(item);
    notify();
  },

  remove: (id: string) => {
    cart = cart.filter((c) => c.id !== id);
    notify();
  },

  clear: () => {
    cart = [];
    notify();
  },
};