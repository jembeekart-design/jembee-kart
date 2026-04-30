// src/shared/store/searchStore.ts

let query = "";
let results: any[] = [];

const listeners: Function[] = [];

const notify = () =>
  listeners.forEach((l) => l({ query, results }));

export const searchStore = {
  subscribe: (cb: Function) => {
    listeners.push(cb);
    return () => {
      const i = listeners.indexOf(cb);
      if (i > -1) listeners.splice(i, 1);
    };
  },

  get: () => ({ query, results }),

  setQuery: (q: string) => {
    query = q;
    notify();
  },

  setResults: (r: any[]) => {
    results = r;
    notify();
  },
};