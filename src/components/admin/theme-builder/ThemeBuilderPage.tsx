"use client";

import { useState, useEffect, useCallback } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { useTheme } from "@/context/ThemeContext";
import ThemeEditor from "./ThemeEditor";
import ThemePreview from "./ThemePreview";
import ThemeActions from "./ThemeActions";
import type { Theme } from "@/types/theme";

const DEFAULT_THEME: Theme = {
  primaryColor: "#3b82f6",
  secondaryColor: "#64748b",
  backgroundColor: "#ffffff",
  surfaceColor: "#f8fafc",
  cardColor: "#ffffff",
  textColor: "#0f172a",
  mutedTextColor: "#64748b",
  headingColor: "#020617",
  borderColor: "#e2e8f0",
  successColor: "#22c55e",
  warningColor: "#f59e0b",
  dangerColor: "#ef4444",
  infoColor: "#0ea5e9",
  buttonTextColor: "#ffffff",
  inputBackgroundColor: "#ffffff",
  inputBorderColor: "#cbd5e1",
  sidebarColor: "#1e293b",
  headerColor: "#ffffff",
  footerColor: "#f8fafc",
  linkColor: "#3b82f6",
  hoverColor: "#2563eb",
  activeColor: "#1d4ed8",
  fontFamily: "Inter",
  headingFont: "Inter",
  bodyFont: "Inter",
  headingSize: 32,
  bodySize: 16,
  letterSpacing: "normal",
  lineHeight: 1.5,
  textTransform: "none",
  fontWeight: "600",
  borderRadius: 8,
  buttonRadius: 8,
  cardRadius: 12,
  inputRadius: 6,
  borderWidth: 1,
  shadow: "md",
  shadowOpacity: 0.1,
  buttonStyle: "filled",
  buttonSize: "md",
  buttonHoverEffect: "scale",
  animationStyle: "fade",
};

export default function ThemeBuilderPage() {
  const { setTheme } = useTheme();
  const [theme, setLocalTheme] = useState<Theme>(DEFAULT_THEME);
  const [history, setHistory] = useState<Theme[]>([DEFAULT_THEME]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [saving, setSaving] = useState(false);

  // 1. Live Apply: Theme badalte hi Context update ho raha hai
  useEffect(() => {
    setTheme(theme);
  }, [theme, setTheme]);

  // 2. Load from Firebase
  useEffect(() => {
    async function loadTheme() {
      const snap = await getDoc(doc(db, "admin_settings", "customize"));
      if (snap.exists()) {
        const savedTheme = snap.data() as Theme;
        setLocalTheme(savedTheme);
      }
    }
    loadTheme();
  }, []);

  // 3. Undo/Redo Handler
  const handleThemeChange = (newTheme: Theme) => {
    setLocalTheme(newTheme);
    const newHistory = history.slice(0, historyIndex + 1);
    setHistory([...newHistory, newTheme]);
    setHistoryIndex(newHistory.length);
  };

  async function saveTheme() {
    setSaving(true);
    try {
      await setDoc(doc(db, "admin_settings", "customize"), theme, { merge: true });
      alert("Theme Saved Successfully");
    } catch (e) {
      alert("Failed to Save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6">
      <div className="lg:col-span-2">
        <ThemeEditor theme={theme} setTheme={handleThemeChange} />
      </div>
      
      <div className="lg:col-span-1 space-y-6">
        <ThemePreview theme={theme} />
        <ThemeActions 
          saving={saving} 
          onSave={saveTheme} 
          onUndo={() => {
            if(historyIndex > 0) {
              setHistoryIndex(historyIndex - 1);
              setLocalTheme(history[historyIndex - 1]);
            }
          }}
        />
      </div>
    </main>
  );
}
