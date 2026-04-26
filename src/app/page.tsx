'use client';

import { useState, useEffect } from "react";

export default function Home() {
  const [color, setColor] = useState("#6366f1");
  const [loading, setLoading] = useState(false);

  // 🔥 Load saved theme
  useEffect(() => {
    const saved = localStorage.getItem("themeColor");
    if (saved) {
      setColor(saved);
      applyTheme(saved);
    }

    // smooth transition
    document.documentElement.style.transition =
      "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
  }, []);

  // 🎨 Apply theme
  const applyTheme = (newColor: string) => {
    document.documentElement.style.setProperty("--primary", newColor);
    localStorage.setItem("themeColor", newColor);

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", newColor);
    }
  };

  const changeColor = (newColor: string) => {
    setColor(newColor);
    applyTheme(newColor);
  };

  // 🔥 Qikink Order function
  const createOrder = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/qikink/order", {
        method: "POST",
      });

      let data;

      try {
        data = await res.json();
      } catch {
        throw new Error("Invalid server response");
      }

      if (!res.ok) {
        throw new Error(data?.error || "Order failed");
      }

      alert(data.message || "✅ Order created successfully");

    } catch (err: any) {
      alert("❌ " + (err.message || "Server error"));
    } finally {
      setLoading(false);
    }
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
                outline: color === c ? "2px solid white" : "none",
              }}
            />
          ))}
        </div>

        {/* 🎛 Theme Button */}
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

        {/* 🔥 Qikink Order Button */}
        <button
          onClick={createOrder}
          disabled={loading}
          style={{
            marginTop: 20,
            marginLeft: 10,
            padding: "10px 20px",
            borderRadius: 10,
            border: "none",
            background: "#10b981",
            color: "#fff",
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow: "0 0 10px #10b981",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Creating..." : "Create Qikink Order"}
        </button>

      </div>
    </div>
  );
}
