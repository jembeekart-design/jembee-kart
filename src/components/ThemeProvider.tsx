'use client';

import { useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

type ThemeType = {
  primary: string;
  secondary: string;
  accent: string;
  bg: string;
  text: string;
};

const DEFAULT_THEME: ThemeType = {
  primary: "#6366f1",
  secondary: "#22c55e",
  accent: "#f59e0b",
  bg: "#0f172a",
  text: "#ffffff",
};

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {

  // 🎨 SAFE APPLY FUNCTION
  const applyTheme = (theme: ThemeType) => {
    document.documentElement.style.setProperty("--primary", theme.primary);
    document.documentElement.style.setProperty("--secondary", theme.secondary);
    document.documentElement.style.setProperty("--accent", theme.accent);
    document.documentElement.style.setProperty("--bg", theme.bg);
    document.documentElement.style.setProperty("--text", theme.text);

    // 🔝 Status bar
    let meta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;

    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      document.head.appendChild(meta);
    }

    meta.content = theme.primary;
  };

  useEffect(() => {

    // ⚡ STEP 1: LocalStorage (instant, no flicker)
    const cached = localStorage.getItem("theme");

    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        applyTheme({ ...DEFAULT_THEME, ...parsed });
      } catch {
        applyTheme(DEFAULT_THEME);
      }
    } else {
      applyTheme(DEFAULT_THEME);
    }

    // 🔥 STEP 2: Firestore realtime
    const ref = doc(db, "settings", "theme");

    const unsubscribe = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const data = snap.data();

        const theme: ThemeType = {
          primary: data.primary || DEFAULT_THEME.primary,
          secondary: data.secondary || DEFAULT_THEME.secondary,
          accent: data.accent || DEFAULT_THEME.accent,
          bg: data.bg || DEFAULT_THEME.bg,
          text: data.text || DEFAULT_THEME.text,
        };

        applyTheme(theme);

        // 💾 cache
        localStorage.setItem("theme", JSON.stringify(theme));
      } else {
        applyTheme(DEFAULT_THEME);
      }
    });

    return () => unsubscribe();
  }, []);

  return <>{children}</>;
}
