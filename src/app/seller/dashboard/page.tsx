"use client";

import { useTheme } from "@/shared/hooks/useTheme";
import { GlassCard } from "@/shared/ui/GlassCard";
import { Button } from "@/shared/ui/Button";

export default function SellerDashboardPage() {
  const { theme } = useTheme();

  return (
    <div
      className="min-h-screen p-5"
      style={{
        background: `linear-gradient(135deg, ${theme.bg1}, ${theme.bg2})`,
      }}
    >
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">
          Seller Dashboard 💼
        </h1>

        <Button>Logout</Button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <GlassCard title="Sales" value="₹1,24,500" />
        <GlassCard title="Orders" value="342" />
        <GlassCard title="Products" value="28" />
        <GlassCard title="Earnings" value="₹42,300" />
      </div>

      {/* ACTION */}
      <div className="grid grid-cols-2 gap-4">
        <GlassCard title="Add Product" value="+" />
        <GlassCard title="Orders" value="View" />
        <GlassCard title="Analytics" value="Open" />
        <GlassCard title="Withdraw" value="₹" />
      </div>
    </div>
  );
}
