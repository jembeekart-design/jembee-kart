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
  bg: "#0f172a",
  surface: "#111827",
  text: "#ffffff",
  glassOpacity: "0.15",
  glassBlur: "20px",
};

export const useTheme = () => {
  const [theme, setTheme] = useState<ThemeType>(defaultTheme);

  // 🔥 Load from localStorage (Admin panel future ready)
  useEffect(() => {
    const saved = localStorage.getItem("app-theme");
    if (saved) {
      const parsed = JSON.parse(saved);
      setTheme(parsed);
      applyTheme(parsed);
    } else {
      applyTheme(defaultTheme);
    }
  }, []);

  // 🔥 Apply theme to CSS variables
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

  // 🔥 Change theme (Admin panel use)
  const updateTheme = (newTheme: Partial<ThemeType>) => {
    const updated = { ...theme, ...newTheme };
    setTheme(updated);
    localStorage.setItem("app-theme", JSON.stringify(updated));
    applyTheme(updated);
  };

  return {
    theme,
    updateTheme,
  };
};
