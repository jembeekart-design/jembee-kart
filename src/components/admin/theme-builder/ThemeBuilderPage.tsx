"use client";

import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";

import { db } from "@/firebase/config";
import { useTheme } from "@/context/ThemeContext";

import ThemeEditor from "./ThemeEditor";
import ThemePreview from "./ThemePreview";
import ThemeActions from "./ThemeActions";
import type { Theme } from "@/types/theme";
export default function ThemeBuilderPage() {

  const { setTheme } = useTheme();

  const [theme, setLocalTheme] = useState({

    primaryColor: "#4F46E5",

    secondaryColor: "#7C3AED",

    backgroundColor: "#F8F9FE",

    cardColor: "#FFFFFF",

    textColor: "#111827",

    borderColor: "#E5E7EB",

    borderRadius: "24",

    buttonRadius: 24,

    cardRadius: 24,

    inputRadius: 12,

    fontFamily: "Inter",

    headingSize: 32,

    bodySize: 16,

    fontWeight: "600",

    shadow: "md",

    shadowOpacity: 0.25,

    borderWidth: 1,

    buttonStyle: "filled",

    buttonSize: "md",

    buttonHoverEffect: "scale",

    buttonIconPosition: "left",

  });

  const [saving, setSaving] =
    useState(false);

  useEffect(() => {

    async function loadTheme() {

      try {

        const snap =
          await getDoc(
            doc(
              db,
              "admin_settings",
              "customize"
            )
          );

        if (!snap.exists()) return;

        setLocalTheme((prev) => ({
          ...prev,
          ...snap.data(),
        }));

      } catch (error) {

        console.error(error);

      }

    }

    loadTheme();

  }, []);

  async function saveTheme() {

    setSaving(true);

    try {

      await setDoc(

        doc(
          db,
          "admin_settings",
          "customize"
        ),

        theme,

        {
          merge: true,
        }

      );

      setTheme(theme);

      alert(
        "Theme Saved Successfully"
      );

    } catch (error) {

      console.error(error);

      alert(
        "Failed to Save Theme"
      );

    } finally {

      setSaving(false);

    }

  }

  function resetTheme() {

    setLocalTheme({

      primaryColor: "#4F46E5",

      secondaryColor: "#7C3AED",

      backgroundColor: "#F8F9FE",

      cardColor: "#FFFFFF",

      textColor: "#111827",

      borderColor: "#E5E7EB",

      borderRadius: "24",

      buttonRadius: 24,

      cardRadius: 24,

      inputRadius: 12,

      fontFamily: "Inter",

      headingSize: 32,

      bodySize: 16,

      fontWeight: "600",

      shadow: "md",

      shadowOpacity: 0.25,

      borderWidth: 1,

      buttonStyle: "filled",

      buttonSize: "md",

      buttonHoverEffect: "scale",

      buttonIconPosition: "left",

    });

  }

  return (

    <main className="space-y-8">

      <ThemeEditor
        theme={theme}
        setTheme={setLocalTheme}
      />

      <ThemePreview
        theme={theme}
      />

      <ThemeActions
        saving={saving}
        onSave={saveTheme}
        onReset={resetTheme}
        onApply={saveTheme}
        onGenerateAI={() => {
          alert(
            "AI Theme Generator Coming Soon"
          );
        }}
      />

    </main>

  );

}
