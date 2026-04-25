'use client';

import { useEffect, useState } from "react";

export default function useTheme() {
  const [themeColor, setThemeColor] = useState("#6366f1");
  const [darkMode, setDarkMode] = useState(true);

  // 🔄 Load saved theme
  useEffect(() => {
    const savedColor = localStorage.getItem("themeColor");
    const savedMode = localStorage.getItem("darkMode");

    if (savedColor) setThemeColor(savedColor);
    if (savedMode) setDarkMode(savedMode === "true");

    applyTheme(savedColor || themeColor, savedMode === "true");
  }, []);

  // 🎨 Apply theme globally
  const applyTheme = (color: string, isDark: boolean) => {
    document.documentElement.style.setProperty("--primary", color);

    if (isDark) {
      document.documentElement.classList.add("dark");
      document.body.style.background = "#0f172a";
      document.body.style.color = "white";
    } else {
      document.documentElement.classList.remove("dark");
      document.body.style.background = "#f1f5f9";
      document.body.style.color = "black";
    }
  };

  // 🎨 Change color
  const changeColor = (color: string) => {
    setThemeColor(color);
    localStorage.setItem("themeColor", color);
    applyTheme(color, darkMode);
  };

  // 🌙 Toggle dark mode
  const toggleMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", newMode.toString());
    applyTheme(themeColor, newMode);
  };

  return {
    themeColor,
    darkMode,
    changeColor,
    toggleMode,
  };
}
