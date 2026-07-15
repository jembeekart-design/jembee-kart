"use client";
import { useState, useEffect } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { useTheme } from "@/context/ThemeContext";
import ThemeEditor from "./ThemeEditor";
import ThemePreview from "./ThemePreview";
import ThemeActions from "./ThemeActions";
import type { Theme } from "@/types/theme";

export default function ThemeBuilderPage() {
  const { theme, setTheme } = useTheme();
  const [localTheme, setLocalTheme] = useState<Theme>(theme);
  const [saving, setSaving] = useState(false);

  // Sync agar context badle
  useEffect(() => {
    setLocalTheme(theme);
  }, [theme]);

  async function saveTheme() {
    setSaving(true);
    try {
      await setDoc(doc(db, "admin_settings", "customize"), localTheme, { merge: true });
      alert("Theme Saved Successfully!");
    } catch (e) {
      console.error("Save Error:", e);
      alert("Failed to Save");
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
            onGenerateAI={() => alert("Coming Soon!")}
            onUndo={() => {}}
         />
       </div>
    </main>
  );
}
