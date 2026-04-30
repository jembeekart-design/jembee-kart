// src/shared/store/configStore.ts

type Config = {
  maintenanceMode: boolean;
  paymentsEnabled: boolean;
};

let config: Config = {
  maintenanceMode: false,
  paymentsEnabled: true,
};

const listeners: Function[] = [];

const notify = () => listeners.forEach((l) => l(config));

export const configStore = {
  subscribe: (cb: Function) => {
    listeners.push(cb);
    return () => {
      const i = listeners.indexOf(cb);
      if (i > -1) listeners.splice(i, 1);
    };
  },

  get: () => config,

  set: (updates: Partial<Config>) => {
    config = { ...config, ...updates };
    notify();
  },
};