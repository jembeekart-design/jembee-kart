"use client";

import { create } from "zustand";

interface ThemeStore {
  setTheme: (
    primary: string,
    secondary: string,
    accent: string
  ) => void;
}

export const useThemeStore = create<ThemeStore>(() => ({
  setTheme: (primary, secondary, accent) => {

    document.documentElement.style.setProperty(
      "--color-primary",
      primary
    );

    document.documentElement.style.setProperty(
      "--color-secondary",
      secondary
    );

    document.documentElement.style.setProperty(
      "--color-accent",
      accent
    );

    localStorage.setItem(
      "admin-theme",
      JSON.stringify({
        primary,
        secondary,
        accent,
      })
    );
  },
}));
