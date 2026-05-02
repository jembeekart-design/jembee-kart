"use client";

import { useEffect, useState } from "react";

type ThemeType = {
  primary: string;
  secondary: string;
  accent: string;
  bg: string;
  surface: string;
  text: string;
};

const defaultTheme: ThemeType = {
  primary: "#6366f1",
  secondary: "#8b5cf6",
  accent: "#22c55e",
  bg: "#020617",
  surface: "#0f172a",
  text: "#ffffff",
};

export const useTheme = () => {
  const [theme, setTheme] = useState(defaultTheme);

  useEffect(() => {
    const root = document.documentElement;

    root.style.setProperty("--color-primary", theme.primary);
    root.style.setProperty("--color-secondary", theme.secondary);
    root.style.setProperty("--color-accent", theme.accent);
    root.style.setProperty("--color-bg", theme.bg);
    root.style.setProperty("--color-surface", theme.surface);
    root.style.setProperty("--color-text", theme.text);
  }, [theme]);

  const updateTheme = (newTheme: Partial<ThemeType>) => {
    setTheme((prev) => ({ ...prev, ...newTheme }));
  };

  return { theme, updateTheme };
};
