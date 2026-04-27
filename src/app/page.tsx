'use client';

import { useState } from "react";

export default function Home() {
  const [loading, setLoading] = useState(false);

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
        <h1 className="text-primary">🚀 JembeeKart Theme Test</h1>
        <p className="text-muted">Theme controlled from Admin panel 👇</p>

        {/* 🎛 Primary Button */}
        <button
          className="btn btn-primary"
          style={{ marginTop: 20 }}
        >
          Primary Button
        </button>

        {/* 🔥 Secondary Button (Theme Controlled) */}
        <button
          onClick={createOrder}
          disabled={loading}
          className="btn btn-secondary"
          style={{ marginTop: 20, marginLeft: 10 }}
        >
          {loading ? "Creating..." : "Create Qikink Order"}
        </button>

      </div>
    </div>
  );
}
