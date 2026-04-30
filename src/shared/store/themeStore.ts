// src/shared/store/themeStore.ts

type Theme = {
  primary: string;
  blur: number;
  opacity: number;
  mode: "light" | "dark";
};

let theme: Theme = {
  primary: "#6366f1",
  blur: 12,
  opacity: 0.1,
  mode: "dark",
};

const listeners: Function[] = [];

const applyToDOM = () => {
  if (typeof document === "undefined") return;

  const root = document.documentElement;

  root.style.setProperty("--primary", theme.primary);
  root.style.setProperty("--glass-blur", `${theme.blur}px`);
  root.style.setProperty("--glass-opacity", `${theme.opacity}`);
};

const notify = () => {
  applyToDOM();
  listeners.forEach((l) => l(theme));
};

export const themeStore = {
  subscribe: (cb: Function) => {
    listeners.push(cb);
    return () => {
      const i = listeners.indexOf(cb);
      if (i > -1) listeners.splice(i, 1);
    };
  },

  get: () => theme,

  set: (updates: Partial<Theme>) => {
    theme = { ...theme, ...updates };
    notify();
  },
};