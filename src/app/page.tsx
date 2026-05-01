"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadTheme, saveTheme } from "@/shared/lib/theme";

// ================= TYPES =================
type Theme = {
  name: string;
  primary: string;
  bg1: string;
  bg2: string;
};

// ================= THEMES =================
const THEMES: Theme[] = [
  {
    name: "Indigo",
    primary: "#6366f1",
    bg1: "#020617",
    bg2: "#0f172a",
  },
  {
    name: "Emerald",
    primary: "#10b981",
    bg1: "#022c22",
    bg2: "#064e3b",
  },
  {
    name: "Rose",
    primary: "#f43f5e",
    bg1: "#1f0a10",
    bg2: "#3f0d17",
  },
];

// ================= COMPONENT =================
export default function HomePage() {
  const router = useRouter();

  const [theme, setTheme] = useState<Theme>(THEMES[0]);
  const [dark, setDark] = useState(true);

  // ================= LOAD THEME =================
  useEffect(() => {
    loadTheme().then((t) => {
      if (t) {
        setTheme(t);
        applyTheme(t);
      } else {
        applyTheme(theme);
      }
    });

    const savedDark = localStorage.getItem("darkMode");
    if (savedDark) setDark(savedDark === "true");
  }, []);

  // ================= APPLY THEME =================
  const applyTheme = (t: Theme) => {
    document.documentElement.style.setProperty("--primary", t.primary);
    document.documentElement.style.setProperty("--bg1", t.bg1);
    document.documentElement.style.setProperty("--bg2", t.bg2);
  };

  // ================= UI =================
  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden px-4"
      style={{
        background: `linear-gradient(135deg, var(--bg1), var(--bg2))`,
      }}
    >
      {/* 🔥 BACKGROUND EFFECTS */}
      <div className="absolute w-[600px] h-[600px] bg-[var(--primary)] opacity-20 blur-3xl rounded-full top-[-150px] left-[-150px]" />
      <div className="absolute w-[500px] h-[500px] bg-purple-500 opacity-20 blur-3xl rounded-full bottom-[-150px] right-[-150px]" />

      {/* 🧊 GLASS CARD */}
      <div className="backdrop-blur-2xl bg-white/10 border border-white/20 shadow-2xl rounded-3xl p-8 w-full max-w-lg text-center z-10">

        {/* LOGO */}
        <h1 className="text-4xl font-bold text-white mb-2 tracking-wide">
          JembeeKart 🚀
        </h1>

        <p className="text-gray-300 mb-6">
          Enterprise Glass UI eCommerce Platform
        </p>

        {/* ACTION BUTTONS */}
        <div className="flex gap-3 justify-center mb-6">
          <button
            onClick={() => router.push("/products")}
            className="px-6 py-2 rounded-xl text-white font-semibold transition hover:scale-105"
            style={{ background: "var(--primary)" }}
          >
            🛍 Shop Now
          </button>

          <button
            onClick={() => router.push("/admin")}
            className="px-6 py-2 rounded-xl border border-white/30 text-white hover:bg-white/10"
          >
            ⚙ Admin
          </button>
        </div>

        {/* THEME SWITCHER */}
        <div>
          <p className="text-xs text-gray-400 mb-2">
            Theme Control
          </p>

          <div className="flex justify-center gap-3">
            {THEMES.map((t) => (
              <div
                key={t.name}
                onClick={() => {
                  setTheme(t);
                  applyTheme(t);
                  saveTheme(t); // 🔥 Firestore + Local
                }}
                className="w-8 h-8 rounded-full cursor-pointer border border-white/30 hover:scale-110 transition"
                style={{ background: t.primary }}
              />
            ))}
          </div>
        </div>

        {/* DARK MODE */}
        <button
          onClick={() => {
            const val = !dark;
            setDark(val);
            localStorage.setItem("darkMode", String(val));
          }}
          className="mt-6 text-xs text-gray-400 hover:text-white transition"
        >
          {dark ? "🌙 Dark Mode" : "☀️ Light Mode"}
        </button>

      </div>
    </div>
  );
}
