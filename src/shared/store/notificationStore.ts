// src/shared/store/notificationStore.ts

let notifications: any[] = [];
const listeners: Function[] = [];

const notify = () => listeners.forEach((l) => l(notifications));

export const notificationStore = {
  subscribe: (cb: Function) => {
    listeners.push(cb);
    return () => {
      const i = listeners.indexOf(cb);
      if (i > -1) listeners.splice(i, 1);
    };
  },

  get: () => notifications,

  push: (n: any) => {
    notifications.unshift({ ...n, id: Date.now() });
    notify();
  },

  clear: () => {
    notifications = [];
    notify();
  },
};