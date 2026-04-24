'use client';

import { useState, useEffect } from "react";
import Sidebar from "@/components/admin/Sidebar";
import Header from "@/components/admin/Header";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Theme state (later Firestore se aayega)
  const [themeColor, setThemeColor] = useState("#6366f1"); // default indigo
  const [darkMode, setDarkMode] = useState(true);

  // Load theme (future: Firestore)
  useEffect(() => {
    const savedColor = localStorage.getItem("themeColor");
    const savedMode = localStorage.getItem("darkMode");

    if (savedColor) setThemeColor(savedColor);
    if (savedMode) setDarkMode(savedMode === "true");
  }, []);

  // Apply CSS variables
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--primary",
      themeColor
    );
  }, [themeColor]);

  return (
    <div
      className={`min-h-screen flex ${
        darkMode ? "bg-[#0f172a]" : "bg-gray-100"
      }`}
    >
      {/* Sidebar */}
      <Sidebar />

      {/* Main */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header
          themeColor={themeColor}
          setThemeColor={setThemeColor}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />

        {/* Content */}
        <main className="p-6">
          <div
            className="
              backdrop-blur-xl
              bg-white/10
              border border-white/20
              rounded-2xl
              shadow-xl
              p-6
              text-white
            "
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
