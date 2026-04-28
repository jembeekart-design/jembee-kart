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
    document.documentElement.style.setProperty("--primary", themeColor);
  }, [themeColor]);

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    router.push("/login");
  };

  const changeColor = (color: string) => {
    setThemeColor(color);
    localStorage.setItem("themeColor", color);
    setShowPicker(false); // 🔥 auto close
  };

  const toggleDark = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", newMode.toString());
  };

  return (
    <header className="glass flex items-center justify-between px-4 py-3 sticky top-0 z-50">

      {/* LEFT */}
      <h2 className="text-base sm:text-lg font-semibold">
        Welcome Admin 👋
      </h2>

      {/* RIGHT */}
      <div className="flex items-center gap-2 sm:gap-4">

        {/* 🎨 THEME COLOR */}
        <div className="relative">
          <button
            onClick={() => setShowPicker(!showPicker)}
            className="w-8 h-8 rounded-full border border-white/20"
            style={{ background: themeColor }}
          />

          {showPicker && (
            <div className="absolute right-0 mt-2 glass p-2 rounded-xl flex gap-2 shadow-lg">
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
                  className="w-6 h-6 rounded-full cursor-pointer hover:scale-110 transition"
                  style={{ background: color }}
                />
              ))}
            </div>
          )}
        </div>

        {/* 🌙 DARK MODE */}
        <button
          onClick={toggleDark}
          className="px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm"
          style={{
            border: `1px solid ${themeColor}`,
            color: themeColor,
          }}
        >
          {darkMode ? "🌙" : "☀️"}
        </button>

        {/* 🔔 NOTIFICATION */}
        <button
          className="relative text-lg hover:scale-110 transition"
          onClick={() => alert("No new notifications")}
        >
          🔔
          {/* Badge */}
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1 rounded-full">
            3
          </span>
        </button>

        {/* 🚪 LOGOUT */}
        <button
          onClick={handleLogout}
          className="px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 transition"
        >
          Logout
        </button>

      </div>
    </header>
  );
}
