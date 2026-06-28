"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebase/config";

import ThemeEditor from "./ThemeEditor";
import ThemePreview from "./ThemePreview";
import ThemeActions from "./ThemeActions";

export default function ThemeBuilderPage() {
  const [theme, setTheme] = useState({
    primaryColor: "#06b6d4",
    secondaryColor: "#8b5cf6",
    backgroundColor: "#050505",
    cardColor: "#111111",
    textColor: "#ffffff",
    borderColor: "#2a2a2a",
    buttonRadius: 24,
    fontFamily: "Inter",
  });

  useEffect(() => {
    async function loadTheme() {
      const snap = await getDoc(
        doc(db, "admin_settings", "customize")
      );

      if (snap.exists()) {
        setTheme((prev) => ({
          ...prev,
          ...snap.data(),
        }));
      }
    }

    loadTheme();
  }, []);

  async function saveTheme() {
    await setDoc(
      doc(db, "admin_settings", "customize"),
      theme,
      { merge: true }
    );

    alert("Theme Saved Successfully");
  }

  return (
    <main className="min-h-screen bg-[#050505] p-6 text-white">

      <ThemeEditor
        theme={theme}
        setTheme={setTheme}
      />

      <ThemePreview
        theme={theme}
      />

      <ThemeActions
        onSave={saveTheme}
      />

    </main>
  );
}
