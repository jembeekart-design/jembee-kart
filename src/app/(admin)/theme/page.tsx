'use client';

import { useState, useEffect } from "react";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

type ThemeType = {
  primary: string;
  secondary: string;
  accent: string;
  bg: string;
  text: string;
};

const defaultTheme: ThemeType = {
  primary: "#6366f1",
  secondary: "#22c55e",
  accent: "#f59e0b",
  bg: "#0f172a",
  text: "#ffffff",
};

export default function ThemePage() {
  const [theme, setTheme] = useState<ThemeType>(defaultTheme);
  const [loading, setLoading] = useState(false);

  // 🔥 Load theme from Firestore
  useEffect(() => {
    const loadTheme = async () => {
      const ref = doc(db, "settings", "theme");
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data() as ThemeType;
        setTheme({ ...defaultTheme, ...data });
        applyTheme({ ...defaultTheme, ...data });
      }
    };

    loadTheme();
  }, []);

  // 🎨 Apply theme live preview
  const applyTheme = (t: ThemeType) => {
    document.documentElement.style.setProperty("--primary", t.primary);
    document.documentElement.style.setProperty("--secondary", t.secondary);
    document.documentElement.style.setProperty("--accent", t.accent);
    document.documentElement.style.setProperty("--bg", t.bg);
    document.documentElement.style.setProperty("--text", t.text);
  };

  // 🔄 Update state + preview
  const handleChange = (key: keyof ThemeType, value: string) => {
    const updated = { ...theme, [key]: value };
    setTheme(updated);
    applyTheme(updated);
  };

  // 💾 Save to Firestore
  const saveTheme = async () => {
    setLoading(true);

    try {
      await setDoc(doc(db, "settings", "theme"), {
        ...theme,
        updatedAt: new Date(),
      });

      alert("✅ Theme saved successfully");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to save theme");
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: 20 }}>

      <h1 className="text-primary">🎨 Theme Settings (Admin)</h1>
      <p className="text-muted">Customize full app theme</p>

      {/* 🎨 COLOR PICKERS */}
      <div className="glass card" style={{ marginTop: 20 }}>
        
        <div className="flex">
          <label>Primary</label>
          <input
            type="color"
            value={theme.primary}
            onChange={(e) => handleChange("primary", e.target.value)}
          />
        </div>

        <div className="flex">
          <label>Secondary</label>
          <input
            type="color"
            value={theme.secondary}
            onChange={(e) => handleChange("secondary", e.target.value)}
          />
        </div>

        <div className="flex">
          <label>Accent</label>
          <input
            type="color"
            value={theme.accent}
            onChange={(e) => handleChange("accent", e.target.value)}
          />
        </div>

        <div className="flex">
          <label>Background</label>
          <input
            type="color"
            value={theme.bg}
            onChange={(e) => handleChange("bg", e.target.value)}
          />
        </div>

        <div className="flex">
          <label>Text</label>
          <input
            type="color"
            value={theme.text}
            onChange={(e) => handleChange("text", e.target.value)}
          />
        </div>

      </div>

      {/* 🔥 PREVIEW CARD */}
      <div className="glass glow card" style={{ marginTop: 20 }}>
        <h2>Live Preview</h2>
        <p className="text-muted">This is how your app will look</p>

        <button className="btn btn-primary">Primary Button</button>
        <button className="btn btn-secondary" style={{ marginLeft: 10 }}>
          Secondary
        </button>
      </div>

      {/* 💾 SAVE BUTTON */}
      <button
        onClick={saveTheme}
        disabled={loading}
        className="btn btn-primary"
        style={{ marginTop: 20 }}
      >
        {loading ? "Saving..." : "💾 Save Theme"}
      </button>

    </div>
  );
}
