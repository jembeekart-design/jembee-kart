"use client";

export const dynamic = "force-dynamic";

import {
  Server,
  Cpu,
  HardDrive,
  Wifi,
  ShieldCheck,
  Activity,
  RefreshCw,
  Database,
  Cloud,
  Timer,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";

const servers = [
  {
    name: "Main Server",
    usage: "72%",
    status: "Online"
  },
  {
    name: "Database Server",
    usage: "54%",
    status: "Online"
  },
  {
    name: "Storage Server",
    usage: "88%",
    status: "Warning"
  },
  {
    name: "Backup Server",
    usage: "46%",
    status: "Online"
  }
];

export default function ServerStatusPage() {

  return (

    <main className="min-h-screen bg-[#0b0b0b] p-4 text-white">

      {/* HEADER */}

      <div className="mb-8 flex items-center justify-between">

        <div className="flex items-center gap-4">

          <div className="flex h-16 w-16 items-center justify-center rounded-[28px] bg-lime-500">

            <Server
              size={30}
              className="text-black"
            />

          </div>

          <div>

            <h1 className="text-3xl font-black">
              Server Status
            </h1>

            <p className="mt-1 text-sm text-gray-400">
              Monitor server uptime & infrastructure
            </p>

          </div>

        </div>

        <button className="flex items-center gap-2 rounded-2xl bg-lime-500 px-5 py-3 font-bold text-black">

          <RefreshCw size={18} />

          Refresh

        </button>

      </div>

      {/* STATS */}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

        <StatCard
          title="CPU"
          value="72%"
          icon={<Cpu size={22} />}
        />

        <StatCard
          title="RAM"
          value="68%"
          icon={<HardDrive size={22} />}
        />

        <StatCard
          title="Network"
          value="99%"
          icon={<Wifi size={22} />}
        />

        <StatCard
          title="Uptime"
          value="99.9%"
          icon={<Activity size={22} />}
        />

      </div>

      {/* SERVER LIST */}

      <div className="mt-6 space-y-4">

        {servers.map(
          (
            item,
            index
          ) => (

            <div
              key={index}
              className="rounded-[28px] border border-white/10 bg-[#151515] p-5"
            >

              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                <div>

                  <h2 className="text-2xl font-black">
                    {item.name}
                  </h2>

                  <p className="mt-2 text-sm text-gray-400">
                    Server Usage:
                    {" "}
                    {item.usage}
                  </p>

                </div>

                <div className="flex items-center gap-4">

                  <div className="h-3 w-40 overflow-hidden rounded-full bg-black/30">

                    <div
                      className={`h-full rounded-full ${
                        item.status ===
                        "Online"
                          ? "bg-green-500"
                          : "bg-yellow-500"
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
                      "Online"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-yellow-500/20 text-yellow-400"
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

      {/* SERVICES */}

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">

        <InfoCard
          title="Database"
          value="Connected"
          icon={<Database size={24} />}
        />

        <InfoCard
          title="Cloud Sync"
          value="Active"
          icon={<Cloud size={24} />}
        />

        <InfoCard
          title="Response"
          value="128ms"
          icon={<Timer size={24} />}
        />

      </div>

      {/* ALERTS */}

      <div className="mt-6 rounded-[30px] bg-gradient-to-r from-lime-500 to-green-600 p-6 text-black">

        <div className="flex items-center gap-3">

          <ShieldCheck size={26} />

          <h2 className="text-3xl font-black">
            Infrastructure Security
          </h2>

        </div>

        <p className="mt-3 max-w-2xl text-sm font-medium">

          All servers are protected with realtime
          monitoring, firewall security and encrypted
          infrastructure systems.

        </p>

      </div>

      {/* STATUS */}

      <div className="mt-6 rounded-[28px] border border-green-500/20 bg-green-500/10 p-5">

        <div className="flex items-start gap-4">

          <CheckCircle2
            size={24}
            className="text-green-400"
          />

          <div>

            <h3 className="text-xl font-black text-green-400">
              Servers Operational
            </h3>

            <p className="mt-2 text-sm text-gray-300">

              All critical infrastructure systems
              are currently online and stable.

            </p>

          </div>

        </div>

      </div>

      {/* WARNING */}

      <div className="mt-6 rounded-[28px] border border-yellow-500/20 bg-yellow-500/10 p-5">

        <div className="flex items-start gap-4">

          <AlertTriangle
            size={24}
            className="text-yellow-400"
          />

          <div>

            <h3 className="text-xl font-black text-yellow-400">
              Storage Usage Warning
            </h3>

            <p className="mt-2 text-sm text-gray-300">

              Storage Server is approaching high
              usage capacity. Cleanup recommended.

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

    <div className="rounded-[28px] border border-white/10 bg-[#151515] p-5">

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-lime-500 text-black">

        {icon}

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

    <div className="rounded-[28px] border border-white/10 bg-[#151515] p-5">

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-lime-500 text-black">

        {icon}

      </div>

      <h2 className="mt-5 text-2xl font-black">
        {value}
      </h2>

      <p className="mt-2 text-sm text-gray-400">
        {title}
      </p>

    </div>

  );
}
