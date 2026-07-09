"use client";

export const dynamic = "force-dynamic";

import {
  BarChart3,
  ShoppingCart,
  Users,
  IndianRupee,
  Package
} from "lucide-react";

export default function AnalyticsPage() {

  const stats = [
    {
      title: "Total Sales",
      value: "₹1,25,000",
      icon: IndianRupee
    },
    {
      title: "Total Orders",
      value: "1,240",
      icon: ShoppingCart
    },
    {
      title: "Total Users",
      value: "3,420",
      icon: Users
    },
    {
      title: "Products",
      value: "540",
      icon: Package
    }
  ];

  return (

    <main className="min-h-screen bg-[#0b0b0b] p-4 text-[var(--button-text-color)]">

      {/* HEADER */}

      <div className="mb-8 flex items-center gap-3">

        <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-violet-600">

          <BarChart3 size={30} />

        </div>

        <div>

          <h1 className="text-3xl font-black">
            Analytics Dashboard
          </h1>

          <p className="mt-1 text-sm text-[var(--muted-text-color)]">
            Track sales and performance
          </p>

        </div>

      </div>

      {/* STATS */}

      <div className="grid grid-cols-2 gap-4">

        {stats.map((item, index) => {

          const Icon =
            item.icon;

          return (

            <div
              key={index}
              className="rounded-[30px] border border-white/10 bg-[#151515] p-5"
            >

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600">

                <Icon size={24} />

              </div>

              <p className="mt-5 text-sm text-[var(--muted-text-color)]">
                {item.title}
              </p>

              <h2 className="mt-2 text-3xl font-black">
                {item.value}
              </h2>

            </div>

          );
        })}

      </div>

      {/* SALES CARD */}

      <div className="mt-6 rounded-[30px] bg-gradient-to-r from-violet-600 to-fuchsia-500 p-6">

        <h2 className="text-3xl font-black">
          Monthly Revenue
        </h2>

        <p className="mt-2 text-[var(--button-text-color)]/80">
          Your store performance is growing fast 🚀
        </p>

        <div className="mt-6 flex items-end gap-3">

          <div className="h-[120px] w-full rounded-t-2xl bg-[var(--card-color)]/20" />

          <div className="h-[180px] w-full rounded-t-2xl bg-[var(--card-color)]/30" />

          <div className="h-[90px] w-full rounded-t-2xl bg-[var(--card-color)]/20" />

          <div className="h-[220px] w-full rounded-t-2xl bg-[var(--card-color)]/40" />

          <div className="h-[150px] w-full rounded-t-2xl bg-[var(--card-color)]/20" />

          <div className="h-[250px] w-full rounded-t-2xl bg-[var(--card-color)]/50" />

        </div>

      </div>

      {/* RECENT ACTIVITY */}

      <div className="mt-6 rounded-[30px] border border-white/10 bg-[#151515] p-6">

        <h2 className="text-2xl font-black">
          Recent Activity
        </h2>

        <div className="mt-5 space-y-4">

          <ActivityItem
            title="New Order Received"
            subtitle="Order #1024 placed"
          />

          <ActivityItem
            title="New User Registered"
            subtitle="User joined today"
          />

          <ActivityItem
            title="Product Added"
            subtitle="New fashion item uploaded"
          />

          <ActivityItem
            title="Affiliate Commission Paid"
            subtitle="₹450 commission transferred"
          />

        </div>

      </div>

    </main>

  );
}

function ActivityItem({
  title,
  subtitle
}: {
  title: string;
  subtitle: string;
}) {

  return (

    <div className="flex items-center justify-between rounded-2xl bg-[var(--card-color)]/30 p-4">

      <div>

        <h3 className="font-bold">
          {title}
        </h3>

        <p className="mt-1 text-sm text-[var(--muted-text-color)]">
          {subtitle}
        </p>

      </div>

      <div className="h-3 w-3 rounded-full bg-[var(--success-color)]" />

    </div>

  );
}
