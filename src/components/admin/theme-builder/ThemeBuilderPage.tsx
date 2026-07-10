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
  const { theme, setTheme } = useTheme();
  const [localTheme, setLocalTheme] = useState<Theme>(theme);
  const [history, setHistory] = useState<Theme[]>([theme]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [saving, setSaving] = useState(false);

  // 1. Live Sync
  useEffect(() => {
    setTheme(localTheme);
  }, [localTheme, setTheme]);

  // 2. Firebase Save Logic
  async function saveTheme() {
    setSaving(true);
    try {
      await setDoc(doc(db, "admin_settings", "customize"), localTheme, { merge: true });
      alert("Theme Saved!");
    } catch (e) {
      console.error(e);
      alert("Error saving theme");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6">
       <div className="lg:col-span-2">
         <ThemeEditor theme={localTheme} setTheme={setLocalTheme} />
       </div>
       
       <div className="lg:col-span-1">
         <ThemePreview theme={localTheme} />
         <ThemeActions 
            saving={saving} 
            onSave={saveTheme} 
            onReset={() => setLocalTheme(theme)}
            onApply={() => setTheme(localTheme)}
            onGenerateAI={() => alert("AI feature coming soon!")}
            onUndo={() => {
              if(historyIndex > 0) {
                setHistoryIndex(prev => prev - 1);
                setLocalTheme(history[historyIndex - 1]);
              }
            }}
         />
       </div>
    </main>
  );
}
