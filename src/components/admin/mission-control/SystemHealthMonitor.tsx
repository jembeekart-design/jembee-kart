"use client";

import { useEffect, useState } from "react";
import {
  Cpu,
  Activity,
  Database,
  ShieldCheck,
  Globe,
  Clock,
} from "lucide-react";

interface HealthResponse {
  success: boolean;

  generatedAt: string;

  api: {
    status: string;
    responseTime: number;
  };

  database: {
    connected: boolean;
    status: string;
    users: number;
  };

  environment: {
    valid: boolean;
    missing: number;
  };

  scanners: {
    total: number;
    healthy: number;
    failed: number;
  };

  system: {
    status: string;
    cpuUsage: number | null;
    memoryUsage: number | null;
  };
}

export default function SystemHealthMonitor() {
  const [data, setData] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHealth() {
      try {
        const res = await fetch(
          "/api/mission-control/system-health",
          {
            cache: "no-store",
          }
        );

        const json = await res.json();

        setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadHealth();
  }, []);

  if (loading) {
    return (
      <section className="rounded-xl border bg-white p-6 shadow-sm">
        Loading System Health...
      </section>
    );
  }

  if (!data?.success) {
    return (
      <section className="rounded-xl border border-red-300 bg-red-50 p-6">
        Failed to load System Health.
      </section>
    );
  }

  const cards = [
    {
      title: "CPU Usage",
      value:
        data.system.cpuUsage === null
          ? "N/A"
          : `${data.system.cpuUsage}%`,
      status: data.system.status,
      icon: Cpu,
    },

    {
      title: "API Status",
      value: data.api.status,
      status: `${data.api.responseTime} ms`,
      icon: Globe,
    },

    {
      title: "Database",
      value: data.database.status,
      status: `${data.database.users} Users`,
      icon: Database,
    },

    {
      title: "Environment",
      value: data.environment.valid
        ? "Valid"
        : "Invalid",
      status: `${data.environment.missing} Missing`,
      icon: ShieldCheck,
    },

    {
      title: "Scanners",
      value: `${data.scanners.healthy}/${data.scanners.total}`,
      status: `${data.scanners.failed} Failed`,
      icon: Activity,
    },

    {
      title: "Last Updated",
      value: new Date(
        data.generatedAt
      ).toLocaleTimeString(),
      status: "Live",
      icon: Clock,
    },
  ];

  return (
    <section className="rounded-xl border bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">
          System Health Monitor
        </h2>

        <p className="text-sm text-gray-500">
          Live infrastructure status
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="rounded-xl border p-5"
            >
              <Icon className="mb-3 h-7 w-7 text-[var(--success-color)]" />

              <h3 className="text-sm text-gray-500">
                {card.title}
              </h3>

              <p className="mt-2 text-2xl font-bold">
                {card.value}
              </p>

              <p className="mt-1 text-sm text-[var(--success-color)]">
                {card.status}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
