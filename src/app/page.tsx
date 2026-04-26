'use client';

import { useState, useEffect } from "react";

export default function Home() {
  const [color, setColor] = useState("#6366f1");

  useEffect(() => {
    const saved = localStorage.getItem("themeColor");
    if (saved) {
      setColor(saved);
      applyTheme(saved);
    }
  }, []);

  const applyTheme = (newColor: string) => {
    // 🎨 CSS variable change
    document.documentElement.style.setProperty("--primary", newColor);

    // 💾 save
    localStorage.setItem("themeColor", newColor);

    // 🔝 status bar color
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", newColor);
    }
  };

  const changeColor = (newColor: string) => {
    setColor(newColor);
    applyTheme(newColor);
  };

  return (
    <div style={{ padding: 20 }}>
      
      {/* 🔥 Glass Card */}
      <div className="glass glow" style={{ padding: 20 }}>
        <h1>🚀 JembeeKart Theme Test</h1>
        <p>Admin se theme change ka demo 👇</p>

        {/* 🎨 Color buttons */}
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          {[
            "#6366f1",
            "#22c55e",
            "#ef4444",
            "#f59e0b",
            "#0ea5e9",
          ].map((c) => (
            <button
              key={c}
              onClick={() => changeColor(c)}
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                border: "none",
                cursor: "pointer",
                background: c,
                boxShadow: `0 0 10px ${c}`,
              }}
            />
          ))}
        </div>

        {/* 🎛 Button */}
        <button
          style={{
            marginTop: 20,
            padding: "10px 20px",
            borderRadius: 10,
            border: "none",
            background: "var(--primary)",
            color: "#fff",
            cursor: "pointer",
            boxShadow: "0 0 15px var(--primary)",
          }}
        >
          Primary Button
        </button>
      </div>
    </div>
  );
}
