"use client";

import Link from "next/link";

import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  ImageIcon,
  FlaskConical,
  Settings,
} from "lucide-react";

import ThemePanel from "@/components/ui/ThemePanel";

const cards = [
  {
    title: "Products",
    icon: Package,
    href: "/admin/products",
    color: "from-cyan-500 to-blue-500",
    value: "1,284",
  },
  {
    title: "Orders",
    icon: ShoppingCart,
    href: "/admin/orders",
    color: "from-pink-500 to-rose-500",
    value: "8,421",
  },
  {
    title: "Users",
    icon: Users,
    href: "/admin/users",
    color: "from-violet-500 to-indigo-500",
    value: "42K",
  },
  {
    title: "Analytics",
    icon: BarChart3,
    href: "/admin/analytics",
    color: "from-emerald-500 to-green-500",
    value: "98%",
  },
  {
    title: "Banners",
    icon: ImageIcon,
    href: "/admin/banners",
    color: "from-orange-500 to-red-500",
    value: "24",
  },
  {
    title: "Experiments",
    icon: FlaskConical,
    href: "/admin/experiments",
    color: "from-yellow-500 to-amber-500",
    value: "12",
  },
];

export default function AdminDashboardPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">

      {/* Wallpaper */}
      <div className="absolute inset-0">

        <img
          src="https://images.unsplash.com/photo-1518770660439-4636190af475"
          alt=""
          className="h-full w-full object-cover opacity-40"
        />

        <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

      </div>

      {/* HEADER */}
      <header className="relative z-10 flex items-center justify-between px-6 pt-8">

        <div>

          <div className="flex items-center gap-3">

            <div className="glass flex h-14 w-14 items-center justify-center rounded-[22px]">
              <LayoutDashboard className="h-7 w-7 text-cyan-400" />
            </div>

            <div>
              <h1 className="text-4xl font-black tracking-tight">
                Admin Panel
              </h1>

              <p className="text-white/60">
                Enterprise Control Center
              </p>
            </div>

          </div>

        </div>

        <div className="glass rounded-full px-5 py-3 text-sm text-emerald-300">
          LIVE SYSTEM
        </div>

      </header>

      {/* STATS */}
      <section className="relative z-10 mt-10 grid grid-cols-2 gap-5 px-6">

        <div className="glass rounded-[30px] p-6">

          <p className="text-white/50">
            Revenue
          </p>

          <h2 className="mt-2 text-5xl font-black">
            ₹48.2L
          </h2>

          <div className="mt-4 inline-flex rounded-full bg-emerald-500/20 px-4 py-2 text-sm text-emerald-300">
            +18% Growth
          </div>

        </div>

        <div className="glass rounded-[30px] p-6">

          <p className="text-white/50">
            Active Users
          </p>

          <h2 className="mt-2 text-5xl font-black">
            48K
          </h2>

          <div className="mt-4 inline-flex rounded-full bg-cyan-500/20 px-4 py-2 text-sm text-cyan-300">
            Real-time
          </div>

        </div>

      </section>

      {/* GRID */}
      <section className="relative z-10 mt-10 px-6">

        <div className="grid grid-cols-2 gap-5">

          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <Link
                href={card.href}
                key={card.title}
                className="group"
              >

                <div className="glass rounded-[32px] p-5 transition-all duration-300 group-hover:scale-[1.02]">

                  <div
                    className={`flex h-20 w-20 items-center justify-center rounded-[24px] bg-gradient-to-br ${card.color}`}
                  >
                    <Icon className="h-9 w-9 text-white" />
                  </div>

                  <div className="mt-5">

                    <h2 className="text-2xl font-black">
                      {card.title}
                    </h2>

                    <p className="mt-1 text-white/50">
                      Total: {card.value}
                    </p>

                  </div>

                </div>

              </Link>
            );
          })}

        </div>

      </section>

      {/* THEME PANEL */}
      <section className="relative z-10 mt-10 px-6 pb-32">

        <ThemePanel />

      </section>

      {/* BOTTOM NAV */}
      <nav className="fixed bottom-5 left-1/2 z-50 flex w-[92%] -translate-x-1/2 items-center justify-around rounded-[32px] border border-white/10 bg-white/10 p-4 backdrop-blur-2xl">

        <button className="text-cyan-400">
          Dashboard
        </button>

        <button className="text-white/60">
          Products
        </button>

        <button className="text-white/60">
          Orders
        </button>

        <button className="text-white/60">
          Settings
        </button>

      </nav>

    </main>
  );
}
