"use client";

export const dynamic = "force-dynamic";

import { BarChart3, ShoppingCart, Users, IndianRupee, Package } from "lucide-react";
import { useAdminConfig } from "@/lib/admin-config/provider";

export default function AnalyticsPage() {
  const { config } = useAdminConfig();
  const { analytics } = config;

  const stats = [
    { title: "Total Sales", value: "Not connected", icon: IndianRupee },
    { title: "Total Orders", value: "Not connected", icon: ShoppingCart },
    { title: "Total Users", value: "Not connected", icon: Users },
    { title: "Products", value: "Not connected", icon: Package },
  ];

  return (
    <main className="min-h-screen bg-[var(--color-page-background)] p-4 text-[var(--button-text-color)]">
      <header className="mb-8 flex items-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-[var(--primary-color)]">
          <BarChart3 size={30} />
        </div>
        <div>
          <h1 className="text-3xl font-black">{analytics.pageTitle}</h1>
          <p className="mt-1 text-sm text-[var(--muted-text-color)]">
            Verified store analytics are not connected yet. Sample figures are intentionally hidden.
          </p>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-4">
        {stats.map(({ title, value, icon: Icon }) => (
          <div key={title} className="rounded-[30px] border border-[var(--border-color)]/10 bg-[var(--primary-color)] p-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary-color)]">
              <Icon size={24} />
            </div>
            <p className="mt-5 text-sm text-[var(--muted-text-color)]">{title}</p>
            <h2 className="mt-2 text-xl font-black">{value}</h2>
          </div>
        ))}
      </section>

      <section className="mt-6 rounded-[30px] bg-[var(--primary-color)] p-6">
        <h2 className="text-2xl font-black">Monthly Revenue</h2>
        <p className="mt-2 text-sm text-[var(--muted-text-color)]">
          Revenue chart will appear after verified order and settlement data is connected.
        </p>
      </section>

      <section className="mt-6 rounded-[30px] border border-[var(--border-color)]/10 bg-[var(--primary-color)] p-6">
        <h2 className="text-2xl font-black">Recent Activity</h2>
        <p className="mt-3 text-sm text-[var(--muted-text-color)]">
          Live activity feed is not connected. No sample events are displayed.
        </p>
      </section>
    </main>
  );
}
