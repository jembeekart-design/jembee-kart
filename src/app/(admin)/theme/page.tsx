'use client';

import { useEffect, useState } from "react";

export default function ThemePage() {
  const [themeColor, setThemeColor] = useState("#6366f1");
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const savedColor = localStorage.getItem("themeColor");
    const savedMode = localStorage.getItem("darkMode");

    if (savedColor) setThemeColor(savedColor);
    if (savedMode) setDarkMode(savedMode === "true");
  }, []);

  const applyTheme = () => {
    localStorage.setItem("themeColor", themeColor);
    localStorage.setItem("darkMode", darkMode.toString());

    // apply instantly
    document.documentElement.style.setProperty(
      "--primary",
      themeColor
    );

    alert("Theme Updated 🚀");
  };

  return (
    <div className="space-y-6 text-white">
      {/* Title */}
      <h1 className="text-3xl font-bold">🎨 Theme Settings</h1>

      <div className="glass p-6 rounded-2xl space-y-5">
        {/* Color Picker */}
        <div>
          <label className="text-sm opacity-70">
            Primary Color
          </label>

          <input
            type="color"
            value={themeColor}
            onChange={(e) => setThemeColor(e.target.value)}
            className="w-20 h-10 mt-2 cursor-pointer"
          />

          <p className="text-sm mt-1 opacity-60">
            Selected: {themeColor}
          </p>
        </div>

        {/* Dark Mode */}
        <div className="flex items-center gap-3">
          <label>Dark Mode</label>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`px-4 py-1 rounded-full text-sm ${
              darkMode
                ? "bg-green-500/30 text-green-400"
                : "bg-gray-500/30 text-gray-300"
            }`}
          >
            {darkMode ? "Enabled" : "Disabled"}
          </button>
        </div>

        {/* Preview */}
        <div className="glass p-4 rounded-xl">
          <p className="text-sm opacity-70 mb-2">
            Preview:
          </p>

          <button
            className="px-4 py-2 rounded-xl font-medium"
            style={{
              background: themeColor,
              boxShadow: `0 0 20px ${themeColor}55`,
            }}
          >
            Sample Button
          </button>
        </div>

        {/* Save */}
        <button
          onClick={applyTheme}
          className="px-6 py-2 rounded-xl font-medium"
          style={{
            background: themeColor,
            boxShadow: `0 0 20px ${themeColor}55`,
          }}
        >
          Save Theme
        </button>
      </div>

      {/* Info */}
      <div className="glass p-4 rounded-xl text-sm opacity-70">
        This will change the theme across the entire admin panel instantly.
      </div>
    </div>
  );
}
