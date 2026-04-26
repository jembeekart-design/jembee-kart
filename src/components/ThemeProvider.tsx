'use client';

import { useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

const DEFAULT_THEME = {
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

  // 🎨 APPLY FULL THEME
  const applyTheme = (theme: any) => {
    Object.entries(theme).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key}`, value as string);
    });

    // 🔝 STATUS BAR COLOR
    let meta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;

    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      document.head.appendChild(meta);
    }

    meta.content = theme.primary || DEFAULT_THEME.primary;
  };

  useEffect(() => {

    // ⚡ STEP 1: LocalStorage instant load
    const cached = localStorage.getItem("theme");

    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        applyTheme(parsed);
      } catch {
        applyTheme(DEFAULT_THEME);
      }
    } else {
      applyTheme(DEFAULT_THEME);
    }

    // 🔥 STEP 2: Firestore realtime sync
    const ref = doc(db, "settings", "theme");

    const unsubscribe = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const data = snap.data();

        const theme = {
          ...DEFAULT_THEME,
          ...data,
        };

        applyTheme(theme);

        // 💾 cache update
        localStorage.setItem("theme", JSON.stringify(theme));
      } else {
        console.warn("⚠️ Theme doc missing");
        applyTheme(DEFAULT_THEME);
      }
    });

    return () => unsubscribe();
  }, []);

  return <>{children}</>;
}
