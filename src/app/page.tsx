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
        <h1>🚀 JembeeKart Theme Test</h1>
        <p>Theme controlled from Admin panel 👇</p>

        {/* 🎛 Primary Button */}
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
