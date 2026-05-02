import { defaultTheme, Theme } from "../core/theme";

let theme: Theme = defaultTheme;

let listeners: ((t: Theme) => void)[] = [];

export const themeStore = {
  get: () => theme,

  set: (newTheme: Theme) => {
    theme = newTheme;

    localStorage.setItem("theme", JSON.stringify(newTheme));

    listeners.forEach((l) => l(theme));

    // 🌈 Apply CSS variables
    const root = document.documentElement;

    root.style.setProperty("--primary", newTheme.primary);
    root.style.setProperty("--bg", newTheme.bg);
    root.style.setProperty("--card", newTheme.card);
    root.style.setProperty("--text", newTheme.text);
    root.style.setProperty("--accent", newTheme.accent);
    root.style.setProperty("--blur", newTheme.blur);
  },

  subscribe: (cb: (t: Theme) => void) => {
    listeners.push(cb);
    return () => {
      listeners = listeners.filter((l) => l !== cb);
    };
  },
};
