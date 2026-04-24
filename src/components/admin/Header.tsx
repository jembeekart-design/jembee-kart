'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Header({
  themeColor,
  setThemeColor,
  darkMode,
  setDarkMode,
}: any) {
  const router = useRouter();
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--primary",
      themeColor
    );
  }, [themeColor]);

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    router.push("/login");
  };

  const changeColor = (color: string) => {
    setThemeColor(color);
    localStorage.setItem("themeColor", color);
  };

  const toggleDark = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", newMode.toString());
  };

  return (
    <header className="glass px-6 py-4 flex justify-between items-center">
      {/* Left */}
      <h2 className="text-lg font-semibold">
        Welcome Admin 👋
      </h2>

      {/* Right */}
      <div className="flex items-center gap-4">
        {/* Theme Picker */}
        <div className="relative">
          <button
            onClick={() => setShowPicker(!showPicker)}
            className="w-8 h-8 rounded-full border"
            style={{ background: themeColor }}
          />

          {showPicker && (
            <div className="absolute right-0 mt-2 glass p-3 rounded-xl flex gap-2">
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
                  className="w-6 h-6 rounded-full cursor-pointer"
                  style={{ background: color }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Dark Mode */}
        <button
          onClick={toggleDark}
          className="px-3 py-1 rounded-lg text-sm"
          style={{
            border: `1px solid ${themeColor}`,
            color: themeColor,
          }}
        >
          {darkMode ? "🌙 Dark" : "☀️ Light"}
        </button>

        {/* Notification */}
        <button className="text-xl">🔔</button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="px-3 py-1 rounded-lg text-sm bg-red-500/30 text-red-400"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
