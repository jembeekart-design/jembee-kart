"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";

import {
  Database,
  Trash2,
  RefreshCw,
  HardDrive,
  Timer,
  Zap,
  ShieldCheck,
  Activity,
  Save,
  CheckCircle2
} from "lucide-react";

const cacheItems = [
  {
    name: "Homepage Cache",
    size: "240 MB",
    status: "Active"
  },
  {
    name: "Products Cache",
    size: "1.2 GB",
    status: "Active"
  },
  {
    name: "Images Cache",
    size: "820 MB",
    status: "Optimized"
  },
  {
    name: "API Cache",
    size: "410 MB",
    status: "Warning"
  }
];

export default function CacheManagerPage() {

  const [autoClear, setAutoClear] =
    useState(true);

  return (

    <main className="min-h-screen bg-[var(--primary-color)] p-4 text-[var(--button-text-color)]">

      {/* HEADER */}

      <div className="mb-8 flex items-center justify-between">

        <div className="flex items-center gap-4">

          <div className="flex h-16 w-16 items-center justify-center rounded-[28px] bg-[var(--warning-color)]">

            <Database
              size={30}
              className="text-[var(--text-color)]"
            />

          </div>

          <div>

            <h1 className="text-3xl font-black">
              Cache Manager
            </h1>

            <p className="mt-1 text-sm text-[var(--muted-text-color)]">
              Manage app cache & optimization
            </p>

          </div>

        </div>

        <button className="flex items-center gap-2 rounded-2xl bg-[var(--warning-color)] px-5 py-3 font-bold text-[var(--text-color)]">

          <Save size={18} />

          Save Settings

        </button>

      </div>

      {/* STATS */}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

        <StatCard
          title="Cache Files"
          value="148"
          icon={<Database size={22} />}
        />

        <StatCard
          title="Storage Used"
          value="2.7GB"
          icon={<HardDrive size={22} />}
        />

        <StatCard
          title="Speed Boost"
          value="48%"
          icon={<Zap size={22} />}
        />

        <StatCard
          title="Response"
          value="124ms"
          icon={<Timer size={22} />}
        />

      </div>

      {/* AUTO CLEAR */}

      <div className="mt-6 rounded-[28px] border border-[var(--border-color)]/10 bg-[var(--primary-color)] p-5">

        <div className="flex items-center justify-between">

          <div>

            <h2 className="text-2xl font-black">
              Automatic Cache Cleanup
            </h2>

            <p className="mt-1 text-sm text-[var(--muted-text-color)]">
              Automatically clear unused cache files
            </p>

          </div>

          <button
            onClick={() =>
              setAutoClear(
                !autoClear
              )
            }
            className={`rounded-full px-5 py-2 font-bold ${
              autoClear
                ? "bg-[var(--success-color)] text-[var(--text-color)]"
                : "bg-[var(--danger-color)]"
            }`}
          >

            {autoClear
              ? "Enabled"
              : "Disabled"}

          </button>

        </div>

      </div>

      {/* CACHE ITEMS */}

      <div className="mt-6 space-y-4">

        {cacheItems.map(
          (
            item,
            index
          ) => (

            <div
              key={index}
              className="rounded-[28px] border border-[var(--border-color)]/10 bg-[var(--primary-color)] p-5"
            >

              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                <div>

                  <h2 className="text-2xl font-black">
                    {item.name}
                  </h2>

                  <p className="mt-2 text-sm text-[var(--muted-text-color)]">
                    Cache Size:
                    {" "}
                    {item.size}
                  </p>

                </div>

                <div className="flex items-center gap-3">

                  <div
                    className={`rounded-full px-4 py-1 text-sm font-bold ${
                      item.status ===
                      "Active"
                        ? "bg-[var(--success-color)]/20 text-[var(--success-color)]"
                        : item.status ===
                          "Optimized"
                        ? "bg-[var(--primary-color)]/20 text-[var(--primary-color)]"
                        : "bg-[var(--warning-color)]/20 text-[var(--warning-color)]"
                    }`}
                  >

                    {item.status}

                  </div>

                  <button className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--primary-color)] text-[var(--text-color)]">

                    <RefreshCw size={18} />

                  </button>

                  <button className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--danger-color)]/20 text-[var(--danger-color)]">

                    <Trash2 size={18} />

                  </button>

                </div>

              </div>

            </div>

          )
        )}

      </div>

      {/* ACTIONS */}

      <div className="mt-6 flex flex-wrap gap-4">

        <button className="flex items-center gap-2 rounded-2xl bg-[var(--danger-color)] px-6 py-3 font-bold">

          <Trash2 size={18} />

          Clear All Cache

        </button>

        <button className="flex items-center gap-2 rounded-2xl bg-[var(--primary-color)] px-6 py-3 font-bold text-[var(--text-color)]">

          <RefreshCw size={18} />

          Refresh Cache

        </button>

      </div>

      {/* PERFORMANCE */}

      <div className="mt-6 rounded-[30px] bg-gradient-to-r from-[var(--primary-color)] to-[var(--primary-color)] p-6">

        <div className="flex items-center gap-3">

          <Activity size={26} />

          <h2 className="text-3xl font-black">
            Performance Optimization
          </h2>

        </div>

        <p className="mt-3 max-w-2xl text-sm text-[var(--button-text-color)]/90">

          Smart caching improves loading speed,
          database performance and realtime response.

        </p>

        <button className="mt-6 rounded-2xl bg-[var(--card-color)] px-6 py-3 font-bold text-[var(--button-text-color)]">

          Run Optimization

        </button>

      </div>

      {/* SECURITY */}

      <div className="mt-6 rounded-[28px] border border-[var(--success-color)]/20 bg-[var(--success-color)]/10 p-5">

        <div className="flex items-start gap-4">

          <ShieldCheck
            size={24}
            className="text-[var(--success-color)]"
          />

          <div>

            <h3 className="text-xl font-black text-[var(--success-color)]">
              Cache Healthy
            </h3>

            <p className="mt-2 text-sm text-[var(--text-color)]">

              Cache system is optimized and running
              efficiently without overload.

            </p>

          </div>

        </div>

      </div>

      {/* STATUS */}

      <div className="mt-6 rounded-[28px] border border-[var(--primary-color)]/20 bg-[var(--primary-color)]/10 p-5">

        <div className="flex items-start gap-4">

          <CheckCircle2
            size={24}
            className="text-[var(--primary-color)]"
          />

          <div>

            <h3 className="text-xl font-black text-[var(--primary-color)]">
              Realtime Sync Active
            </h3>

            <p className="mt-2 text-sm text-[var(--text-color)]">

              Cache updates are syncing instantly
              across all app modules.

            </p>

          </div>

        </div>

      </div>

    </main>

  );
}

function StatCard({
  title,
  value,
  icon
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {

  return (

    <div className="rounded-[28px] border border-[var(--border-color)]/10 bg-[var(--primary-color)] p-5">

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--warning-color)] text-[var(--text-color)]">

        {icon}

      </div>

      <p className="mt-4 text-sm text-[var(--muted-text-color)]">
        {title}
      </p>

      <h2 className="mt-2 text-3xl font-black">
        {value}
      </h2>

    </div>

  );
}
