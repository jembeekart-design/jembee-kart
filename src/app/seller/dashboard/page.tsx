"use client";

import { useTheme } from "@/hooks/useTheme";
import { useRole } from "@/hooks/useRole";
import { useOrders } from "@/hooks/useOrders";
import { useProducts } from "@/hooks/useProducts";
import { useRealtime } from "@/hooks/useRealtime";

import { GlassCard } from "@/ui/GlassCard";
import { Button } from "@/ui/Button";
import { NotificationBell } from "@/ui/NotificationBell";

export default function SellerDashboard() {
  const { theme, updateTheme } = useTheme();
  const { isSeller } = useRole();

  const { orders } = useOrders();
  const { products } = useProducts();
  const { isConnected } = useRealtime();

  // 🔐 Role Guard
  if (!isSeller) {
    return (
      <div className="flex items-center justify-center h-screen text-xl">
        🚫 Access Denied
      </div>
    );
  }

  // 📊 Calculations
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce(
    (sum: number, o: any) => sum + (o.amount || 0),
    0
  );

  const pendingOrders = orders.filter(
    (o: any) => o.status === "pending"
  ).length;

  return (
    <div
      style={{
        background: "var(--bg)",
        minHeight: "100vh",
        padding: "24px",
        color: "var(--text)",
      }}
    >
      {/* 🔝 HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Seller Dashboard</h1>
          <p style={{ color: "var(--text-soft)" }}>
            Welcome back 👋
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* 🔴 Realtime indicator */}
          <span
            className="text-sm px-3 py-1 rounded-full"
            style={{
              background: isConnected
                ? "var(--success)"
                : "var(--error)",
              color: "#fff",
            }}
          >
            {isConnected ? "Live" : "Offline"}
          </span>

          <NotificationBell />

          {/* 🎨 Theme Switch */}
          <Button
            onClick={() =>
              updateTheme({
                ...theme,
                primary: "#22c55e",
                accent: "#f59e0b",
              })
            }
          >
            🎨 Theme
          </Button>
        </div>
      </div>

      {/* 📊 STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <GlassCard>
          <h3>Total Orders</h3>
          <p className="text-2xl font-bold">{totalOrders}</p>
        </GlassCard>

        <GlassCard>
          <h3>Revenue</h3>
          <p className="text-2xl font-bold">₹{totalRevenue}</p>
        </GlassCard>

        <GlassCard>
          <h3>Products</h3>
          <p className="text-2xl font-bold">{products.length}</p>
        </GlassCard>

        <GlassCard>
          <h3>Pending</h3>
          <p className="text-2xl font-bold">{pendingOrders}</p>
        </GlassCard>
      </div>

      {/* 📦 ORDERS TABLE */}
      <div className="mt-8">
        <GlassCard>
          <h2 className="mb-4 text-xl font-semibold">
            Recent Orders
          </h2>

          <table className="w-full text-sm">
            <thead>
              <tr className="text-left opacity-60">
                <th>ID</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Amount</th>
              </tr>
            </thead>

            <tbody>
              {orders.slice(0, 6).map((order: any) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.customer}</td>
                  <td
                    style={{
                      color:
                        order.status === "delivered"
                          ? "var(--success)"
                          : order.status === "pending"
                          ? "var(--warning)"
                          : "var(--text-soft)",
                    }}
                  >
                    {order.status}
                  </td>
                  <td>₹{order.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassCard>
      </div>

      {/* 🧠 QUICK ACTIONS */}
      <div className="mt-8 grid md:grid-cols-3 gap-6">
        <GlassCard>
          <h3>Add Product</h3>
          <p style={{ color: "var(--text-soft)" }}>
            Upload new items via Qikink
          </p>
        </GlassCard>

        <GlassCard>
          <h3>Track Orders</h3>
          <p style={{ color: "var(--text-soft)" }}>
            Real-time tracking enabled
          </p>
        </GlassCard>

        <GlassCard>
          <h3>Analytics</h3>
          <p style={{ color: "var(--text-soft)" }}>
            View performance & sales
          </p>
        </GlassCard>
      </div>
    </div>
  );
}
