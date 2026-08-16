"use client";

export const dynamic = "force-dynamic";

import {
  Activity,
  Cpu,
  HardDrive,
  Wifi,
  Gauge,
  Timer,
  TrendingUp,
  Zap,
  RefreshCw,
  ShieldCheck,
  BarChart3,
  Database
} from "lucide-react";

const services = [
  {
    name: "API Server",
    usage: "68%",
    status: "Healthy"
  },
  {
    name: "Database",
    usage: "52%",
    status: "Healthy"
  },
  {
    name: "Storage Engine",
    usage: "81%",
    status: "Warning"
  },
  {
    name: "Realtime Sync",
    usage: "44%",
    status: "Healthy"
  }
];

export default function PerformancePage() {

  return (

    <main className="min-h-screen bg-[var(--primary-color)] p-4 text-[var(--button-text-color)]">

      {/* HEADER */}

      <div className="mb-8 flex items-center justify-between">

        <div className="flex items-center gap-4">

          <div className="flex h-16 w-16 items-center justify-center rounded-[28px] bg-[var(--primary-color)]">

            <Gauge
              size={30}
              className="text-[var(--text-color)]"
            />

          </div>

          <div>

            <h1 className="text-3xl font-black">
              Performance Monitor
            </h1>

            <p className="mt-1 text-sm text-[var(--muted-text-color)]">
              Monitor realtime system performance
            </p>

          </div>

        </div>

        <button className="flex items-center gap-2 rounded-2xl bg-[var(--primary-color)] px-5 py-3 font-bold text-[var(--text-color)]">

          <RefreshCw size={18} />

          Refresh

        </button>

      </div>

      {/* STATS */}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

        <StatCard
          title="CPU"
          value="68%"
          icon={<Cpu size={22} />}
        />

        <StatCard
          title="RAM"
          value="74%"
          icon={<HardDrive size={22} />}
        />

        <StatCard
          title="Network"
          value="92%"
          icon={<Wifi size={22} />}
        />

        <StatCard
          title="Response"
          value="132ms"
          icon={<Timer size={22} />}
        />

      </div>

      {/* PERFORMANCE CHART */}

      <div className="mt-6 rounded-[30px] border border-[var(--border-color)]/10 bg-[var(--primary-color)] p-6">

        <div className="flex items-center gap-3">

          <BarChart3
            size={24}
            className="text-[var(--primary-color)]"
          />

          <h2 className="text-2xl font-black">
            Performance Analytics
          </h2>

        </div>

        <div className="mt-8 flex items-end gap-3">

          <div className="h-[120px] w-full rounded-t-2xl bg-[var(--primary-color)]/40" />

          <div className="h-[180px] w-full rounded-t-2xl bg-[var(--primary-color)]/60" />

          <div className="h-[140px] w-full rounded-t-2xl bg-[var(--primary-color)]/30" />

          <div className="h-[240px] w-full rounded-t-2xl bg-[var(--primary-color)]" />

          <div className="h-[190px] w-full rounded-t-2xl bg-[var(--primary-color)]/70" />

          <div className="h-[220px] w-full rounded-t-2xl bg-[var(--primary-color)]/50" />

        </div>

      </div>

      {/* SERVICES */}

      <div className="mt-6 space-y-4">

        {services.map(
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
                    Resource Usage:
                    {" "}
                    {item.usage}
                  </p>

                </div>

                <div className="flex items-center gap-4">

                  <div className="h-3 w-40 overflow-hidden rounded-full bg-[var(--card-color)]/30">

                    <div
                      className={`h-full rounded-full ${
                        item.status ===
                        "Healthy"
                          ? "bg-[var(--success-color)]"
                          : "bg-[var(--warning-color)]"
                      }`}
                      style={{
                        width:
                          item.usage
                      }}
                    />

                  </div>

                  <div
                    className={`rounded-full px-4 py-1 text-sm font-bold ${
                      item.status ===
                      "Healthy"
                        ? "bg-[var(--success-color)]/20 text-[var(--success-color)]"
                        : "bg-[var(--warning-color)]/20 text-[var(--warning-color)]"
                    }`}
                  >

                    {item.status}

                  </div>

                </div>

              </div>

            </div>

          )
        )}

      </div>

      {/* SYSTEM INFO */}

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">

        <InfoCard
          title="Realtime Activity"
          value="18.4K Users"
          icon={<Activity size={24} />}
        />

        <InfoCard
          title="Database Queries"
          value="2.1M"
          icon={<Database size={24} />}
        />

        <InfoCard
          title="Optimization"
          value="Enabled"
          icon={<Zap size={24} />}
        />

      </div>

      {/* AI SECTION */}

      <div className="mt-6 rounded-[30px] bg-gradient-to-r from-[var(--primary-color)] to-[var(--primary-color)] p-6 text-[var(--text-color)]">

        <div className="flex items-center gap-3">

          <TrendingUp size={26} />

          <h2 className="text-3xl font-black">
            AI Performance Optimizer
          </h2>

        </div>

        <p className="mt-3 max-w-2xl text-sm font-medium">

          AI automatically detects slow services,
          high memory usage and optimizes performance.

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
              System Stable
            </h3>

            <p className="mt-2 text-sm text-[var(--text-color)]">

              All core services are operational and
              performing within safe limits.

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

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary-color)] text-[var(--text-color)]">

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

function InfoCard({
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

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary-color)] text-[var(--text-color)]">

        {icon}

      </div>

      <h2 className="mt-5 text-2xl font-black">
        {value}
      </h2>

      <p className="mt-2 text-sm text-[var(--muted-text-color)]">
        {title}
      </p>

    </div>

  );
}
