"use client";

import { useTheme } from "@/hooks/useTheme";
import { useRole } from "@/hooks/useRole";
import { GlassCard } from "@/ui/GlassCard";

export default function SellerDashboard() {
  const { theme, updateTheme } = useTheme();
  const { isSeller } = useRole();

  // 🔐 Role protection
  if (!isSeller) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "var(--text)",
          background: "var(--bg)",
        }}
      >
        Access Denied
      </div>
    );
  }

  return (
    <div
      style={{
        background: "var(--bg)",
        minHeight: "100vh",
        padding: "24px",
        color: "var(--text)",
      }}
    >
      {/* 🔝 Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 style={{ fontSize: "26px", fontWeight: "bold" }}>
          Seller Dashboard
        </h1>

        {/* 🎨 Theme Button (FIXED) */}
        <button
          onClick={() =>
            updateTheme({
              ...theme,
              primary: "#22c55e",
              accent: "#f59e0b",
            })
          }
          className="px-4 py-2 rounded-xl"
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            backdropFilter: "blur(var(--blur))",
          }}
        >
          Change Theme
        </button>
      </div>

      {/* 📊 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <GlassCard>
          <h2>Total Orders</h2>
          <p style={{ fontSize: "22px" }}>120</p>
        </GlassCard>

        <GlassCard>
          <h2>Revenue</h2>
          <p style={{ fontSize: "22px" }}>₹45,000</p>
        </GlassCard>

        <GlassCard>
          <h2>Products</h2>
          <p style={{ fontSize: "22px" }}>32</p>
        </GlassCard>
      </div>

      {/* 📦 Section */}
      <div style={{ marginTop: "30px" }}>
        <GlassCard>
          <h2 style={{ marginBottom: "10px" }}>Recent Orders</h2>

          <table style={{ width: "100%", fontSize: "14px" }}>
            <thead>
              <tr style={{ textAlign: "left", opacity: 0.7 }}>
                <th>ID</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Amount</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>#101</td>
                <td>Rahul</td>
                <td style={{ color: "var(--success)" }}>Delivered</td>
                <td>₹1200</td>
              </tr>

              <tr>
                <td>#102</td>
                <td>Aman</td>
                <td style={{ color: "var(--warning)" }}>Pending</td>
                <td>₹800</td>
              </tr>
            </tbody>
          </table>
        </GlassCard>
      </div>
    </div>
  );
}
