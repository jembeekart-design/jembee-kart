"use client";

import { useEffect, useState } from "react";

type ThemeType = {
  primary: string;
  bg: string;
  text: string;
};

const defaultTheme: ThemeType = {
  primary: "#6366f1",
  bg: "#020617",
  text: "#ffffff",
};

export const useTheme = () => {
  const [theme, setTheme] = useState(defaultTheme);

  useEffect(() => {
    const root = document.documentElement;

    root.style.setProperty("--color-primary", theme.primary);
    root.style.setProperty("--color-bg", theme.bg);
    root.style.setProperty("--color-text", theme.text);
  }, [theme]);

  return {
    theme,
    updateTheme: setTheme,
  };
};
