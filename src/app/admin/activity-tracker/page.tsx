"use client";

export const dynamic = "force-dynamic";

import {
  Activity,
  Users,
  ShoppingCart,
  Wallet,
  Bell,
  ShieldCheck,
  Clock3,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  RefreshCw
} from "lucide-react";

const activities = [
  {
    title: "New User Registered",
    user: "Rahul Sharma",
    time: "2 min ago",
    type: "User"
  },
  {
    title: "Order Placed",
    user: "Sneha Singh",
    time: "5 min ago",
    type: "Order"
  },
  {
    title: "Wallet Withdrawal",
    user: "Aman Khan",
    time: "10 min ago",
    type: "Finance"
  },
  {
    title: "Security Login Alert",
    user: "Admin",
    time: "15 min ago",
    type: "Security"
  }
];

export default function ActivityTrackerPage() {

  return (

    <main className="min-h-screen bg-[#0b0b0b] p-4 text-white">

      {/* HEADER */}

      <div className="mb-8 flex items-center justify-between">

        <div className="flex items-center gap-4">

          <div className="flex h-16 w-16 items-center justify-center rounded-[28px] bg-pink-500">

            <Activity
              size={30}
              className="text-black"
            />

          </div>

          <div>

            <h1 className="text-3xl font-black">
              Activity Tracker
            </h1>

            <p className="mt-1 text-sm text-gray-400">
              Track realtime admin & user activities
            </p>

          </div>

        </div>

        <button className="flex items-center gap-2 rounded-2xl bg-pink-500 px-5 py-3 font-bold text-black">

          <RefreshCw size={18} />

          Refresh

        </button>

      </div>

      {/* STATS */}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

        <StatCard
          title="Users"
          value="12.4K"
          icon={<Users size={22} />}
        />

        <StatCard
          title="Orders"
          value="2.1K"
          icon={<ShoppingCart size={22} />}
        />

        <StatCard
          title="Finance"
          value="₹4.8L"
          icon={<Wallet size={22} />}
        />

        <StatCard
          title="Alerts"
          value="18"
          icon={<Bell size={22} />}
        />

      </div>

      {/* SEARCH */}

      <div className="mt-6 flex flex-col gap-4 md:flex-row">

        <div className="flex flex-1 items-center gap-3 rounded-[24px] border border-white/10 bg-[#151515] px-4 py-3">

          <Search
            size={20}
            className="text-gray-400"
          />

          <input
            type="text"
            placeholder="Search activity..."
            className="w-full bg-transparent outline-none placeholder:text-gray-500"
          />

        </div>

        <button className="flex items-center justify-center gap-2 rounded-[24px] bg-[#151515] px-5 py-3 font-bold">

          <Filter size={18} />

          Filter

        </button>

      </div>

      {/* ACTIVITIES */}

      <div className="mt-6 space-y-4">

        {activities.map(
          (
            item,
            index
          ) => (

            <div
              key={index}
              className="rounded-[28px] border border-white/10 bg-[#151515] p-5"
            >

              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                <div className="flex items-start gap-4">

                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
                      item.type === "User"
                        ? "bg-cyan-500"
                        : item.type === "Order"
                        ? "bg-green-500"
                        : item.type === "Finance"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                  >

                    {item.type ===
                    "User" ? (

                      <Users
                        size={22}
                        className="text-black"
                      />

                    ) : item.type ===
                      "Order" ? (

                      <ShoppingCart
                        size={22}
                        className="text-black"
                      />

                    ) : item.type ===
                      "Finance" ? (

                      <Wallet
                        size={22}
                        className="text-black"
                      />

                    ) : (

                      <ShieldCheck
                        size={22}
                        className="text-black"
                      />

                    )}

                  </div>

                  <div>

                    <h2 className="text-2xl font-black">
                      {item.title}
                    </h2>

                    <p className="mt-1 text-sm text-gray-400">
                      {item.user}
                    </p>

                    <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">

                      <Clock3 size={15} />

                      {item.time}

                    </div>

                  </div>

                </div>

                <div
                  className={`rounded-full px-4 py-2 text-sm font-bold ${
                    item.type ===
                    "Security"
                      ? "bg-red-500/20 text-red-400"
                      : "bg-green-500/20 text-green-400"
                  }`}
                >

                  {item.type}

                </div>

              </div>

            </div>

          )
        )}

      </div>

      {/* ANALYTICS */}

      <div className="mt-6 rounded-[30px] bg-gradient-to-r from-pink-500 to-fuchsia-600 p-6">

        <div className="flex items-center gap-3">

          <CheckCircle2 size={26} />

          <h2 className="text-3xl font-black">
            Realtime Monitoring
          </h2>

        </div>

        <p className="mt-3 max-w-2xl text-sm text-white/90">

          All activities are monitored instantly with
          realtime tracking, analytics & security logs.

        </p>

      </div>

      {/* ALERT */}

      <div className="mt-6 rounded-[28px] border border-yellow-500/20 bg-yellow-500/10 p-5">

        <div className="flex items-start gap-4">

          <AlertTriangle
            size={24}
            className="text-yellow-400"
          />

          <div>

            <h3 className="text-xl font-black text-yellow-400">
              Suspicious Activity Detection
            </h3>

            <p className="mt-2 text-sm text-gray-300">

              AI automatically detects unusual login,
              payment or admin activity for protection.

            </p>

          </div>

        </div>

      </div>

    </main>

  );
}
