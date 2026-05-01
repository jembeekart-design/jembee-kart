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

// ================= DEFAULT THEMES =================
const DEFAULT_THEMES: Theme[] = [
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

  const [theme, setTheme] = useState<Theme>(DEFAULT_THEMES[0]);
  const [loading, setLoading] = useState(true);

  // ================= LOAD THEME =================
  useEffect(() => {
    const init = async () => {
      try {
        const t = await loadTheme();

        if (t) {
          setTheme(t);
          applyTheme(t);
        } else {
          applyTheme(DEFAULT_THEMES[0]);
        }
      } catch (err) {
        console.log("Theme load error", err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  // ================= APPLY THEME =================
  const applyTheme = (t: Theme) => {
    document.documentElement.style.setProperty("--primary", t.primary);
    document.documentElement.style.setProperty("--bg1", t.bg1);
    document.documentElement.style.setProperty("--bg2", t.bg2);
  };

  // ================= NAVIGATION =================
  const goShop = () => router.push("/products");
  const goAdmin = () => router.push("/admin");

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Loading...
      </div>
    );
  }

  // ================= UI =================
  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden px-4"
      style={{
        background: `linear-gradient(135deg, var(--bg1), var(--bg2))`,
      }}
    >
      {/* 🌌 Background Effects */}
      <div className="absolute w-[700px] h-[700px] bg-[var(--primary)] opacity-20 blur-3xl rounded-full top-[-200px] left-[-200px]" />
      <div className="absolute w-[600px] h-[600px] bg-purple-500 opacity-20 blur-3xl rounded-full bottom-[-200px] right-[-200px]" />

      {/* 🧊 Glass Card */}
      <div className="backdrop-blur-2xl bg-white/10 border border-white/20 shadow-2xl rounded-3xl p-10 w-full max-w-xl text-center z-10">

        {/* 🚀 Logo */}
        <h1 className="text-4xl font-bold text-white mb-2 tracking-wide">
          JembeeKart 🚀
        </h1>

        <p className="text-gray-300 mb-6">
          AI Powered Print-on-Demand eCommerce (Qikink Integrated)
        </p>

        {/* 🔘 Buttons */}
        <div className="flex gap-4 justify-center mb-8">
          <button
            onClick={goShop}
            className="px-6 py-3 rounded-xl text-white font-semibold transition hover:scale-105"
            style={{ background: "var(--primary)" }}
          >
            🛍 Shop Now
          </button>

          <button
            onClick={goAdmin}
            className="px-6 py-3 rounded-xl border border-white/30 text-white hover:bg-white/10"
          >
            ⚙ Admin Panel
          </button>
        </div>

        {/* 🎨 Theme Switcher */}
        <div>
          <p className="text-xs text-gray-400 mb-3">
            Theme Control (Admin Override Supported)
          </p>

          <div className="flex justify-center gap-3">
            {DEFAULT_THEMES.map((t) => (
              <div
                key={t.name}
                onClick={() => {
                  setTheme(t);
                  applyTheme(t);
                  saveTheme(t); // 🔥 Local + Firestore sync
                }}
                className="w-9 h-9 rounded-full cursor-pointer border border-white/30 hover:scale-110 transition"
                style={{ background: t.primary }}
              />
            ))}
          </div>
        </div>

        {/* 📊 Future Features Note */}
        <p className="text-[10px] text-gray-500 mt-6">
          Powered by Qikink • Cashfree • Firebase • WhatsApp Automation
        </p>

      </div>
    </div>
  );
}
