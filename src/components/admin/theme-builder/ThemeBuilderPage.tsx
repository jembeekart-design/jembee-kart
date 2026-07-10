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

  // 1. Live Sync Debugging
  useEffect(() => {
    console.log("Local Theme updated, syncing with Context:", localTheme);
    setTheme(localTheme);
  }, [localTheme, setTheme]);

  // 2. Firebase Save Logic with Debugging
  async function saveTheme() {
    setSaving(true);
    console.log("Starting save process...");
    console.log("Data to be saved:", JSON.stringify(localTheme, null, 2));

    try {
      const themeRef = doc(db, "admin_settings", "customize");
      console.log("Firestore reference created:", themeRef.path);

      await setDoc(themeRef, localTheme, { merge: true });
      
      console.log("Firestore setDoc successful!");
      alert("Theme Saved Successfully!");
    } catch (e) {
      console.error("CRITICAL ERROR during saveTheme:", e);
      alert("Failed to Save. Check Console for details.");
    } finally {
      setSaving(false);
      console.log("Save process finished.");
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
            onReset={() => {
              console.log("Resetting theme to initial...");
              setLocalTheme(theme);
            }}
            onApply={() => {
              console.log("Applying live theme...");
              setTheme(localTheme);
            }}
            onGenerateAI={() => alert("AI feature coming soon!")}
            onUndo={() => {
              if(historyIndex > 0) {
                console.log("Undoing, history index:", historyIndex - 1);
                setHistoryIndex(prev => prev - 1);
                setLocalTheme(history[historyIndex - 1]);
              } else {
                console.warn("No more history to undo!");
              }
            }}
         />
       </div>
    </main>
  );
}
