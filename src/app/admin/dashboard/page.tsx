"use client";

import { AdminLayout } from "@/shared/ui/AdminLayout";
import { GlassCard } from "@/shared/ui/GlassCard";
import { Button } from "@/shared/ui/Button";
import { useTheme } from "@/hooks/useTheme";

export default function AdminDashboard() {
  const { updateTheme } = useTheme();

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>

        <Button
          onClick={() =>
            updateTheme({
              primary: "#22c55e",
              accent: "#f59e0b",
            })
          }
        >
          Change Theme
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard>
          <h2 className="text-lg">Total Orders</h2>
          <p className="text-3xl font-bold mt-2">1,245</p>
        </GlassCard>

        <GlassCard>
          <h2 className="text-lg">Revenue</h2>
          <p className="text-3xl font-bold mt-2">₹2.4L</p>
        </GlassCard>

        <GlassCard>
          <h2 className="text-lg">Users</h2>
          <p className="text-3xl font-bold mt-2">8,230</p>
        </GlassCard>
      </div>

      {/* Activity */}
      <div className="mt-8">
        <GlassCard>
          <h2 className="text-lg mb-4">Recent Activity</h2>

          <ul className="space-y-2 text-sm">
            <li>🟢 New order received</li>
            <li>🔵 Product added</li>
            <li>🟡 User registered</li>
          </ul>
        </GlassCard>
      </div>
    </AdminLayout>
  );
}
