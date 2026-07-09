"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";

import {
  ShoppingCart,
  Users,
  IndianRupee,
  Package,
  TrendingUp,
  Wallet,
  Bell,
  Shield,
  Store,
  Truck,
  Sparkles,
  BarChart3,
  ArrowRight
} from "lucide-react";

const stats = [

  {
    title: "Total Revenue",
    value: "₹18.4L",
    icon: IndianRupee
  },

  {
    title: "Orders",
    value: "12,840",
    icon: ShoppingCart
  },

  {
    title: "Users",
    value: "42,120",
    icon: Users
  },

  {
    title: "Products",
    value: "8,420",
    icon: Package
  }

];

const quickLinks = [

  {
    title: "Orders",
    icon: ShoppingCart,
    link: "/admin/orders"
  },

  {
    title: "Products",
    icon: Package,
    link: "/admin/products"
  },

  {
    title: "Users",
    icon: Users,
    link: "/admin/users"
  },

  {
    title: "Analytics",
    icon: BarChart3,
    link: "/admin/analytics"
  },

  {
    title: "Payments",
    icon: Wallet,
    link: "/admin/payments"
  },

  {
    title: "Affiliate",
    icon: Store,
    link: "/admin/affiliate"
  },

  {
    title: "Delivery",
    icon: Truck,
    link: "/admin/delivery"
  },

  {
    title: "AI Tools",
    icon: Sparkles,
    link: "/admin/ai-tools"
  }

];

export default function AdminHomePage() {

  return (

    <main className="min-h-screen text-[var(--button-text-color)]">

      {/* HERO */}

      <div className="rounded-[35px] bg-gradient-to-r from-cyan-500 to-blue-600 p-8 text-[var(--text-color)]">

        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

          <div>

            <h1 className="text-4xl font-black lg:text-5xl">

              JembeeKart Admin

            </h1>

            <p className="mt-4 max-w-2xl text-sm font-medium lg:text-base">

              Manage products, orders, analytics,
              affiliate system, AI tools, payments,
              storage, notifications and everything
              from one powerful dashboard.

            </p>

            <button className="mt-6 flex items-center gap-2 rounded-2xl bg-black px-6 py-4 font-bold text-[var(--button-text-color)]">

              Open Analytics

              <ArrowRight size={18} />

            </button>

          </div>

          {/* ICON */}

          <div className="flex h-[180px] w-[180px] items-center justify-center rounded-[40px] bg-black/10 backdrop-blur-xl">

            <BarChart3 size={90} />

          </div>

        </div>

      </div>

      {/* STATS */}

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">

        {stats.map((item, index) => {

          const Icon =
            item.icon;

          return (

            <div
              key={index}
              className="rounded-[30px] border border-white/10 bg-[#151515] p-5"
            >

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500 text-[var(--text-color)]">

                <Icon size={28} />

              </div>

              <p className="mt-5 text-sm text-gray-400">

                {item.title}

              </p>

              <h2 className="mt-2 text-3xl font-black">

                {item.value}

              </h2>

            </div>

          );

        })}

      </div>

      {/* QUICK ACCESS */}

      <div className="mt-10">

        <div className="mb-5 flex items-center gap-3">

          <TrendingUp
            size={24}
            className="text-cyan-400"
          />

          <h2 className="text-2xl font-black">

            Quick Access

          </h2>

        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

          {quickLinks.map(
            (
              item,
              index
            ) => {

              const Icon =
                item.icon;

              return (

                <Link
                  key={index}
                  href={item.link}
                  className="group rounded-[28px] border border-white/10 bg-[#151515] p-5 transition-all duration-300 hover:scale-[1.03] hover:border-cyan-500"
                >

                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500 text-[var(--text-color)] transition-all duration-300 group-hover:rotate-6">

                    <Icon size={28} />

                  </div>

                  <h3 className="mt-5 text-xl font-black">

                    {item.title}

                  </h3>

                  <p className="mt-2 text-sm text-gray-400">

                    Open Module

                  </p>

                </Link>

              );

            }
          )}

        </div>

      </div>

      {/* ACTIVITY */}

      <div className="mt-10 grid gap-5 lg:grid-cols-2">

        {/* RECENT ORDERS */}

        <div className="rounded-[30px] border border-white/10 bg-[#151515] p-6">

          <div className="flex items-center gap-3">

            <ShoppingCart
              size={24}
              className="text-cyan-400"
            />

            <h2 className="text-2xl font-black">

              Recent Orders

            </h2>

          </div>

          <div className="mt-6 space-y-4">

            <ActivityItem
              title="New iPhone Order"
              subtitle="Order #1024 placed"
            />

            <ActivityItem
              title="Fashion Product"
              subtitle="Order #1025 shipped"
            />

            <ActivityItem
              title="Gaming Laptop"
              subtitle="Order #1026 delivered"
            />

          </div>

        </div>

        {/* SYSTEM STATUS */}

        <div className="rounded-[30px] border border-white/10 bg-[#151515] p-6">

          <div className="flex items-center gap-3">

            <Shield
              size={24}
              className="text-green-400"
            />

            <h2 className="text-2xl font-black">

              System Status

            </h2>

          </div>

          <div className="mt-6 space-y-4">

            <StatusItem
              title="Payment Gateway"
              status="Active"
            />

            <StatusItem
              title="Realtime Notifications"
              status="Running"
            />

            <StatusItem
              title="Security Firewall"
              status="Protected"
            />

            <StatusItem
              title="Cloud Storage"
              status="Connected"
            />

          </div>

        </div>

      </div>

      {/* BOTTOM SECTION */}

      <div className="mt-10 rounded-[35px] bg-gradient-to-r from-fuchsia-500 to-violet-600 p-8">

        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

          <div>

            <h2 className="text-4xl font-black">

              AI Powered Ecommerce

            </h2>

            <p className="mt-4 max-w-2xl text-sm text-[var(--button-text-color)]/90">

              Your ecommerce admin panel is now powered
              with AI systems, affiliate engine,
              analytics, live chat and realtime tracking.

            </p>

          </div>

          <div className="flex gap-4">

            <button className="rounded-2xl bg-black px-6 py-4 font-bold text-[var(--button-text-color)]">

              Open AI Tools

            </button>

            <button className="rounded-2xl bg-[var(--card-color)] px-6 py-4 font-bold text-[var(--text-color)]">

              Manage Store

            </button>

          </div>

        </div>

      </div>

      {/* ALERT */}

      <div className="mt-8 rounded-[28px] border border-yellow-500/20 bg-[var(--warning-color)]/10 p-5">

        <div className="flex items-start gap-4">

          <Bell
            size={24}
            className="text-yellow-400"
          />

          <div>

            <h3 className="text-xl font-black text-yellow-400">

              System Notification

            </h3>

            <p className="mt-2 text-sm text-gray-300">

              Admin dashboard successfully connected
              with sidebar layout and navigation system.

            </p>

          </div>

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

    <div className="flex items-center justify-between rounded-2xl bg-[#0f0f0f] p-4">

      <div>

        <h3 className="font-bold">

          {title}

        </h3>

        <p className="mt-1 text-sm text-gray-400">

          {subtitle}

        </p>

      </div>

      <div className="h-3 w-3 rounded-full bg-[var(--success-color)]" />

    </div>

  );

}

function StatusItem({
  title,
  status
}: {
  title: string;
  status: string;
}) {

  return (

    <div className="flex items-center justify-between rounded-2xl bg-[#0f0f0f] p-4">

      <h3 className="font-bold">

        {title}

      </h3>

      <div className="rounded-full bg-[var(--success-color)]/20 px-4 py-2 text-sm font-bold text-green-400">

        {status}

      </div>

    </div>

  );

}
