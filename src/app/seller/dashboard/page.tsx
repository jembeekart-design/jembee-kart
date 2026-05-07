"use client";

import {
  ShoppingBag,
  Package,
  Wallet,
  BarChart3,
  Share2,
  Bell,
} from "lucide-react";

import { useTheme } from "@/shared/hooks/useTheme";
import { useRole } from "@/shared/hooks/useRole";
import { useOrders } from "@/shared/hooks/useOrders";
import { useProducts } from "@/shared/hooks/useProducts";
import { useRealtime } from "@/shared/hooks/useRealtime";

const apps = [
  {
    title: "Products",
    icon: Package,
    color: "from-cyan-500 to-blue-500",
  },
  {
    title: "Orders",
    icon: ShoppingBag,
    color: "from-pink-500 to-rose-500",
  },
  {
    title: "Earnings",
    icon: Wallet,
    color: "from-emerald-500 to-green-500",
  },
  {
    title: "Analytics",
    icon: BarChart3,
    color: "from-violet-500 to-indigo-500",
  },
  {
    title: "Affiliate",
    icon: Share2,
    color: "from-orange-500 to-red-500",
  },
  {
    title: "Alerts",
    icon: Bell,
    color: "from-yellow-500 to-amber-500",
  },
];

export default function SellerDashboard() {
  const { updatePartialTheme } = useTheme();

  const { isSeller } = useRole();

  const { orders } = useOrders();

  const { products } = useProducts();

  const { connected } = useRealtime();

  if (!isSeller) {
    return (
      <div className="flex h-screen items-center justify-center bg-black text-white">
        🚫 Access Denied
      </div>
    );
  }

  const totalRevenue = orders.reduce(
    (sum: number, o: any) => sum + (o.amount || 0),
    0
  );

  return (
    <main className="relative min-h-screen overflow-hidden text-white">

      {/* Wallpaper */}
      <div className="absolute inset-0">

        <img
          src="https://images.unsplash.com/photo-1498050108023-c5249f4df085"
          alt=""
          className="h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

      </div>

      {/* TOP */}
      <div className="relative z-10 flex items-center justify-between px-6 pt-8">

        <div>

          <h1 className="text-4xl font-black tracking-tight">
            JembeeKart
          </h1>

          <p className="mt-1 text-white/60">
            Premium Seller Console
          </p>

        </div>

        <div className="flex items-center gap-3">

          <div
            className={`rounded-full px-4 py-2 text-xs font-semibold ${
              connected
                ? "bg-emerald-500/20 text-emerald-300"
                : "bg-red-500/20 text-red-300"
            }`}
          >
            {connected ? "LIVE" : "OFFLINE"}
          </div>

          <button
            onClick={() =>
              updatePartialTheme({
                primary: "#06b6d4",
                accent: "#8b5cf6",
              })
            }
            className="glass rounded-full px-4 py-2 text-sm"
          >
            Theme
          </button>

        </div>
      </div>

      {/* Earnings Card */}
      <section className="relative z-10 mt-8 px-6">

        <div className="glass rounded-[34px] p-6">

          <p className="text-white/60">
            Total Revenue
          </p>

          <h2 className="mt-2 text-5xl font-black">
            ₹{totalRevenue}
          </h2>

          <div className="mt-5 flex gap-3">

            <div className="rounded-2xl bg-emerald-500/20 px-4 py-2 text-sm text-emerald-300">
              +32% Growth
            </div>

            <div className="rounded-2xl bg-white/10 px-4 py-2 text-sm text-white/70">
              This Month
            </div>

          </div>

        </div>
      </section>

      {/* App Launcher */}
      <section className="relative z-10 mt-10 px-6">

        <div className="grid grid-cols-3 gap-5">

          {apps.map((app) => {
            const Icon = app.icon;

            return (
              <button
                key={app.title}
                className="group"
              >

                <div
                  className={`mx-auto flex h-24 w-24 items-center justify-center rounded-[30px] bg-gradient-to-br ${app.color} shadow-2xl transition-all duration-300 group-active:scale-95`}
                >
                  <Icon className="h-10 w-10 text-white" />
                </div>

                <p className="mt-3 text-center text-sm font-medium text-white/90">
                  {app.title}
                </p>

              </button>
            );
          })}
        </div>
      </section>

      {/* Stats */}
      <section className="relative z-10 mt-10 space-y-5 px-6 pb-32">

        <div className="glass rounded-[30px] p-5">

          <div className="flex items-center justify-between">

            <div>

              <h3 className="text-xl font-bold">
                Orders
              </h3>

              <p className="text-white/50">
                Total seller orders
              </p>

            </div>

            <div className="text-4xl font-black">
              {orders.length}
            </div>

          </div>

        </div>

        <div className="glass rounded-[30px] p-5">

          <div className="flex items-center justify-between">

            <div>

              <h3 className="text-xl font-bold">
                Products
              </h3>

              <p className="text-white/50">
                Active Qikink products
              </p>

            </div>

            <div className="text-4xl font-black">
              {products.length}
            </div>

          </div>

        </div>

        <div className="glass rounded-[30px] p-5">

          <div className="flex items-center justify-between">

            <div>

              <h3 className="text-xl font-bold">
                Production
              </h3>

              <p className="text-white/50">
                Printing status active
              </p>

            </div>

            <div className="rounded-full bg-cyan-500/20 px-4 py-2 text-cyan-300">
              LIVE
            </div>

          </div>

        </div>

      </section>

      {/* Bottom Dock */}
      <nav className="fixed bottom-5 left-1/2 z-50 flex w-[92%] -translate-x-1/2 items-center justify-around rounded-[32px] border border-white/10 bg-white/10 p-4 backdrop-blur-2xl">

        <button className="text-cyan-400">
          Home
        </button>

        <button className="text-white/60">
          Products
        </button>

        <button className="text-white/60">
          Orders
        </button>

        <button className="text-white/60">
          Analytics
        </button>

      </nav>

    </main>
  );
}
