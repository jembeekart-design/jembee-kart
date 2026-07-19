"use client";

import {
  Cpu,
  Database,
  Globe,
  Server,
  ShieldCheck,
  Activity,
} from "lucide-react";

const health = [
  {
    title: "CPU Usage",
    value: "18%",
    status: "Healthy",
    icon: Cpu,
  },
  {
    title: "Memory Usage",
    value: "42%",
    status: "Healthy",
    icon: Activity,
  },
  {
    title: "API Status",
    value: "Online",
    status: "Operational",
    icon: Globe,
  },
  {
    title: "Database",
    value: "Connected",
    status: "Healthy",
    icon: Database,
  },
  {
    title: "Server",
    value: "Running",
    status: "Healthy",
    icon: Server,
  },
  {
    title: "Security",
    value: "Protected",
    status: "Secure",
    icon: ShieldCheck,
  },
];

export default function SystemHealthMonitor() {
  return (
    <section className="rounded-xl border bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">
          System Health Monitor
        </h2>

        <p className="text-sm text-gray-500">
          Live health status of your platform.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {health.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-xl border p-5"
            >
              <Icon className="mb-3 h-7 w-7 text-green-600" />

              <h3 className="text-sm text-gray-500">
                {item.title}
              </h3>

              <p className="mt-2 text-2xl font-bold">
                {item.value}
              </p>

              <span className="mt-2 inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                {item.status}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
