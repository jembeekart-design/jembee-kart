"use client";

import { useEffect, useState } from "react";

type ThemeType = {
  primary: string;
  secondary: string;
  accent: string;
  bg: string;
  surface: string;
  text: string;
  glassOpacity: string;
  glassBlur: string;
};

const defaultTheme: ThemeType = {
  primary: "#6366f1",
  secondary: "#8b5cf6",
  accent: "#22c55e",
  bg: "#020617",
  surface: "#0f172a",
  text: "#ffffff",
  glassOpacity: "0.1",
  glassBlur: "12px",
};

export const useTheme = () => {
  const [theme, setTheme] = useState<ThemeType>(defaultTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const applyTheme = (t: ThemeType) => {
    const root = document.documentElement;

    root.style.setProperty("--color-primary", t.primary);
    root.style.setProperty("--color-secondary", t.secondary);
    root.style.setProperty("--color-accent", t.accent);
    root.style.setProperty("--color-bg", t.bg);
    root.style.setProperty("--color-surface", t.surface);
    root.style.setProperty("--color-text", t.text);

    root.style.setProperty("--glass-opacity", t.glassOpacity);
    root.style.setProperty("--glass-blur", t.glassBlur);
  };

  const updateTheme = (newTheme: Partial<ThemeType>) => {
    setTheme((prev) => ({
      ...prev,
      ...newTheme,
    }));
  };

  return {
    theme,
    updateTheme,
  };
};

