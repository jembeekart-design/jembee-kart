"use client";

export const dynamic = "force-dynamic";

import {
  Activity,
  Cpu,
  HardDrive,
  Wifi,
  Shield,
  Database,
  Server,
  RefreshCw,
  Power,
  Clock3,
  BarChart3,
  Bell
} from "lucide-react";

export default function SystemMonitorPage() {

  const servers = [

    {
      name: "Main Server",
      status: "Online",
      usage: "68%"
    },

    {
      name: "Database Server",
      status: "Online",
      usage: "54%"
    },

    {
      name: "Storage Server",
      status: "Online",
      usage: "73%"
    },

    {
      name: "Backup Server",
      status: "Warning",
      usage: "91%"
    }

  ];

  return (

    <main className="min-h-screen bg-[#050505] p-4 text-white">

      {/* HEADER */}

      <div className="mb-8 flex items-center justify-between">

        <div className="flex items-center gap-4">

          <div className="flex h-16 w-16 items-center justify-center rounded-[30px] bg-green-500">

            <Activity
              size={30}
              className="text-black"
            />

          </div>

          <div>

            <h1 className="text-4xl font-black">

              System Monitor

            </h1>

            <p className="mt-1 text-sm text-gray-400">

              Live server and system monitoring

            </p>

          </div>

        </div>

        <button
          className="flex items-center gap-2 rounded-2xl bg-green-500 px-6 py-4 font-black text-black"
        >

          <RefreshCw size={20} />

          Refresh

        </button>

      </div>

      {/* STATS */}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

        <StatsCard
          title="CPU Usage"
          value="68%"
          icon={Cpu}
        />

        <StatsCard
          title="RAM Usage"
          value="74%"
          icon={HardDrive}
        />

        <StatsCard
          title="Network"
          value="Stable"
          icon={Wifi}
        />

        <StatsCard
          title="Security"
          value="Protected"
          icon={Shield}
        />

      </div>

      {/* SERVERS */}

      <div className="mt-6 rounded-[30px] border border-white/10 bg-[#111111] p-6">

        <div className="flex items-center gap-3">

          <Server className="text-green-400" />

          <h2 className="text-3xl font-black">

            Server Status

          </h2>

        </div>

        <div className="mt-6 space-y-5">

          {servers.map(
            (
              item,
              index
            ) => (

              <div
                key={index}
                className="rounded-[24px] bg-black/30 p-5"
              >

                <div className="flex items-center justify-between">

                  <div>

                    <h3 className="text-xl font-black">

                      {item.name}

                    </h3>

                    <p className="mt-1 text-sm text-gray-400">

                      Resource Usage:
                      {" "}
                      {item.usage}

                    </p>

                  </div>

                  <div
                    className={`rounded-full px-4 py-2 text-sm font-black ${
                      item.status === "Online"
                        ? "bg-green-500 text-black"
                        : "bg-yellow-500 text-black"
                    }`}
                  >

                    {item.status}

                  </div>

                </div>

                <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">

                  <div
                    className="h-full rounded-full bg-green-500"
                    style={{
                      width: item.usage
                    }}
                  />

                </div>

              </div>

            )
          )}

        </div>

      </div>

      {/* LIVE PERFORMANCE */}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">

        <div className="rounded-[30px] border border-white/10 bg-[#111111] p-6">

          <div className="flex items-center gap-3">

            <BarChart3 className="text-green-400" />

            <h2 className="text-2xl font-black">

              Performance

            </h2>

          </div>

          <div className="mt-6 flex items-end gap-3">

            <div className="h-[120px] w-full rounded-t-2xl bg-green-500/40" />

            <div className="h-[180px] w-full rounded-t-2xl bg-green-500/60" />

            <div className="h-[100px] w-full rounded-t-2xl bg-green-500/30" />

            <div className="h-[230px] w-full rounded-t-2xl bg-green-500" />

            <div className="h-[160px] w-full rounded-t-2xl bg-green-500/50" />

            <div className="h-[210px] w-full rounded-t-2xl bg-green-500/80" />

          </div>

        </div>

        <div className="rounded-[30px] border border-white/10 bg-[#111111] p-6">

          <div className="flex items-center gap-3">

            <Database className="text-green-400" />

            <h2 className="text-2xl font-black">

              Database Health

            </h2>

          </div>

          <div className="mt-6 space-y-4">

            <HealthItem
              title="Realtime Sync"
              value="Healthy"
            />

            <HealthItem
              title="Firestore"
              value="Connected"
            />

            <HealthItem
              title="Storage"
              value="Optimized"
            />

            <HealthItem
              title="Backups"
              value="Running"
            />

          </div>

        </div>

      </div>

      {/* ALERTS */}

      <div className="mt-6 rounded-[30px] bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-black">

        <div className="flex items-center gap-3">

          <Bell />

          <h2 className="text-3xl font-black">

            System Alerts

          </h2>

        </div>

        <div className="mt-5 space-y-4">

          <AlertItem
            text="Backup completed successfully"
          />

          <AlertItem
            text="Database optimization completed"
          />

          <AlertItem
            text="High RAM usage detected on Backup Server"
          />

        </div>

      </div>

      {/* ACTIONS */}

      <div className="mt-6 flex flex-wrap gap-4">

        <button
          className="flex items-center gap-2 rounded-2xl bg-cyan-500 px-6 py-4 font-black text-black"
        >

          <RefreshCw size={20} />

          Restart Services

        </button>

        <button
          className="flex items-center gap-2 rounded-2xl bg-red-500 px-6 py-4 font-black"
        >

          <Power size={20} />

          Shutdown Server

        </button>

        <button
          className="flex items-center gap-2 rounded-2xl bg-yellow-500 px-6 py-4 font-black text-black"
        >

          <Clock3 size={20} />

          Schedule Backup

        </button>

      </div>

    </main>

  );
}

function StatsCard({
  title,
  value,
  icon: Icon
}: any) {

  return (

    <div className="rounded-[30px] border border-white/10 bg-[#111111] p-5">

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-500">

        <Icon
          size={24}
          className="text-black"
        />

      </div>

      <p className="mt-4 text-sm text-gray-400">

        {title}

      </p>

      <h2 className="mt-2 text-3xl font-black">

        {value}

      </h2>

    </div>

  );
}

function HealthItem({
  title,
  value
}: {
  title: string;
  value: string;
}) {

  return (

    <div className="flex items-center justify-between rounded-2xl bg-black/30 p-4">

      <h3 className="font-bold">

        {title}

      </h3>

      <div className="rounded-full bg-green-500 px-4 py-2 text-sm font-black text-black">

        {value}

      </div>

    </div>

  );
}

function AlertItem({
  text
}: {
  text: string;
}) {

  return (

    <div className="rounded-2xl bg-white/20 p-4 font-bold">

      {text}

    </div>

  );
}
