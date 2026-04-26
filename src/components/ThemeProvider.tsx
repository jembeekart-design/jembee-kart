'use client';

import { useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

const DEFAULT_COLOR = "#6366f1";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {

  const applyTheme = (color: string) => {
    document.documentElement.style.setProperty("--primary", color);

    // 🔝 status bar
    let meta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;

    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      document.head.appendChild(meta);
    }

    meta.content = color;
  };

  useEffect(() => {
    // ⚡ STEP 1: Instant load from localStorage
    const cached = localStorage.getItem("themeColor");

    if (cached) {
      applyTheme(cached);
    } else {
      applyTheme(DEFAULT_COLOR);
    }

    // 🔥 STEP 2: Firestore realtime sync
    const ref = doc(db, "settings", "theme");

    const unsubscribe = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        const color = data.primary || DEFAULT_COLOR;

        applyTheme(color);

        // 💾 cache update
        localStorage.setItem("themeColor", color);
      } else {
        console.warn("⚠️ Theme doc missing, using default");
        applyTheme(DEFAULT_COLOR);
      }
    });

    return () => unsubscribe();
  }, []);

  return <>{children}</>;
}
