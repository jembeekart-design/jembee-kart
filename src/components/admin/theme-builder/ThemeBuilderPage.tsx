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
  const [saving, setSaving] = useState(false);

  // 1. LOAD: पेज रिफ्रेश होते ही Firebase से सेव्ड डेटा लाएं
  useEffect(() => {
    async function fetchSavedTheme() {
      try {
        const docRef = doc(db, "admin_settings", "customize");
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const savedData = docSnap.data() as Theme;
          setLocalTheme(savedData); // स्टेट अपडेट करें
          setTheme(savedData);      // कॉन्टेक्स्ट अपडेट करें
          console.log("Firebase से थीम लोड हुई:", savedData);
        }
      } catch (error) {
        console.error("थीम लोड करने में एरर:", error);
      }
    }
    fetchSavedTheme();
  }, [setTheme]);

  // 2. SAVE: फायरबेस में सेव करने का फंक्शन
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
            onUndo={() => {}} // यहाँ अपनी हिस्ट्री लॉजिक रखें
         />
       </div>
    </main>
  );
}
