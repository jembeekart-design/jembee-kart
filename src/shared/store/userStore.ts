// src/shared/store/userStore.ts

type UserState = {
  user: any | null;
  loading: boolean;
};

const state: UserState = {
  user: null,
  loading: false,
};

const listeners: Function[] = [];

const set = (partial: Partial<UserState>) => {
  Object.assign(state, partial);
  listeners.forEach((l) => l(state));
};

export const userStore = {
  subscribe: (cb: Function) => {
    listeners.push(cb);
    return () => {
      const i = listeners.indexOf(cb);
      if (i > -1) listeners.splice(i, 1);
    };
  },
  get: () => state,

  setUser: (user: any) => set({ user }),
  setLoading: (loading: boolean) => set({ loading }),

  logout: () => set({ user: null }),
};