"use client";

import { useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";

export function ThemeLoader({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    async function applyTheme() {
      try {
        const docs = ["header_section", "section_style"];
        for (const id of docs) {
          const snap = await getDoc(doc(db, "homepage_sections", id));
          if (snap.exists()) {
            const data = snap.data();
            Object.entries(data).forEach(([key, value]) => {
              document.documentElement.style.setProperty(`--${key}`, value as string);
            });
          }
        }
      } catch (error) {
        console.error("Theme Load Error:", error);
      }
    }
    applyTheme();
  }, []);

  return <>{children}</>;
}
