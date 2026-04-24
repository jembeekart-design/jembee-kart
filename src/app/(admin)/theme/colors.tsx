'use client';

import { useEffect, useState } from "react";

export default function ThemeColorsPage() {
  const [primary, setPrimary] = useState("#6366f1");
  const [secondary, setSecondary] = useState("#22c55e");
  const [background, setBackground] = useState("#0f172a");

  useEffect(() => {
    const p = localStorage.getItem("primary");
    const s = localStorage.getItem("secondary");
    const b = localStorage.getItem("background");

    if (p) setPrimary(p);
    if (s) setSecondary(s);
    if (b) setBackground(b);
  }, []);

  const applyColors = () => {
    localStorage.setItem("primary", primary);
    localStorage.setItem("secondary", secondary);
    localStorage.setItem("background", background);

    document.documentElement.style.setProperty("--primary", primary);
    document.documentElement.style.setProperty("--secondary", secondary);
    document.documentElement.style.setProperty("--bg", background);

    alert("Colors Updated 🎨");
  };

  return (
    <div className="space-y-6 text-white">
      {/* Title */}
      <h1 className="text-3xl font-bold">
        🎨 Advanced Colors
      </h1>

      <div className="glass p-6 rounded-2xl space-y-6">
        {/* Primary */}
        <div>
          <label className="text-sm opacity-70">
            Primary Color
          </label>
          <input
            type="color"
            value={primary}
            onChange={(e) => setPrimary(e.target.value)}
            className="w-20 h-10 mt-2"
          />
        </div>

        {/* Secondary */}
        <div>
          <label className="text-sm opacity-70">
            Secondary Color
          </label>
          <input
            type="color"
            value={secondary}
            onChange={(e) => setSecondary(e.target.value)}
            className="w-20 h-10 mt-2"
          />
        </div>

        {/* Background */}
        <div>
          <label className="text-sm opacity-70">
            Background Color
          </label>
          <input
            type="color"
            value={background}
            onChange={(e) => setBackground(e.target.value)}
            className="w-20 h-10 mt-2"
          />
        </div>

        {/* Preview */}
        <div className="glass p-5 rounded-xl">
          <p className="text-sm opacity-70 mb-3">
            Preview:
          </p>

          <div className="flex gap-3">
            <button
              className="px-4 py-2 rounded-xl"
              style={{ background: primary }}
            >
              Primary
            </button>

            <button
              className="px-4 py-2 rounded-xl"
              style={{ background: secondary }}
            >
              Secondary
            </button>
          </div>
        </div>

        {/* Save */}
        <button
          onClick={applyColors}
          className="px-6 py-2 rounded-xl font-medium"
          style={{
            background: primary,
            boxShadow: `0 0 20px ${primary}55`,
          }}
        >
          Save Colors
        </button>
      </div>

      {/* Info */}
      <div className="glass p-4 rounded-xl text-sm opacity-70">
        Customize full app colors. These will reflect across the admin panel dynamically.
      </div>
    </div>
  );
}
