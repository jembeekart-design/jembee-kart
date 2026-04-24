'use client';

import { useEffect, useState } from "react";

export default function ThemeSwitcher() {
  const [themeColor, setThemeColor] = useState("#6366f1");
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const savedColor = localStorage.getItem("themeColor");
    const savedMode = localStorage.getItem("darkMode");

    if (savedColor) setThemeColor(savedColor);
    if (savedMode) setDarkMode(savedMode === "true");

    applyTheme(savedColor || themeColor, savedMode === "true");
  }, []);

  const applyTheme = (color: string, mode: boolean) => {
    document.documentElement.style.setProperty("--primary", color);

    if (mode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const changeColor = (color: string) => {
    setThemeColor(color);
    localStorage.setItem("themeColor", color);
    applyTheme(color, darkMode);
  };

  const toggleMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", newMode.toString());
    applyTheme(themeColor, newMode);
  };

  return (
    <div className="glass p-4 rounded-xl flex items-center gap-4">
      {/* Colors */}
      <div className="flex gap-2">
        {[
          "#6366f1",
          "#22c55e",
          "#ef4444",
          "#f59e0b",
          "#0ea5e9",
        ].map((color) => (
          <div
            key={color}
            onClick={() => changeColor(color)}
            className="w-6 h-6 rounded-full cursor-pointer border"
            style={{
              background: color,
              border:
                themeColor === color
                  ? "2px solid white"
                  : "1px solid gray",
            }}
          />
        ))}
      </div>

      {/* Mode Toggle */}
      <button
        onClick={toggleMode}
        className="px-3 py-1 rounded-lg text-sm border border-white/20"
      >
        {darkMode ? "🌙 Dark" : "☀️ Light"}
      </button>
    </div>
  );
}
