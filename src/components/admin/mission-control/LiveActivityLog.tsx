"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  CheckCircle2,
  Wrench,
  Database,
  ShieldCheck,
  AlertTriangle,
  Clock,
} from "lucide-react";

interface ActivityItem {
  id: string;
  title: string;
  description: string;
  type: "success" | "info" | "database" | "security" | "warning";
  createdAt: string;
}

export default function LiveActivityLog() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadActivities() {
      try {
        const res = await fetch("/api/mission-control/activity");
        const json = await res.json();

        if (json.success) {
          setActivities(json.activities);
        }
      } catch (err) {
        console.error("Failed to load activities:", err);
      } finally {
        setLoading(false);
      }
    }

    loadActivities();
  }, []);

  if (loading) {
    return (
      <section className="rounded-xl border bg-white p-6 shadow-sm">
        Loading activity log...
      </section>
    );
  }

  return (
    <section className="rounded-xl border bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-2">
        <Activity className="h-6 w-6 text-blue-600" />

        <h2 className="text-2xl font-bold">
          Live Activity Log
        </h2>
      </div>

      <div className="space-y-4">
        {activities.map((item) => {
          let Icon = Activity;
          let color = "text-blue-600";

          switch (item.type) {
            case "success":
              Icon = CheckCircle2;
              color = "text-green-600";
              break;

            case "info":
              Icon = Wrench;
              color = "text-indigo-600";
              break;

            case "database":
              Icon = Database;
              color = "text-blue-600";
              break;

            case "security":
              Icon = ShieldCheck;
              color = "text-emerald-600";
              break;

            case "warning":
              Icon = AlertTriangle;
              color = "text-yellow-600";
              break;
          }

          return (
            <div
              key={item.id}
              className="flex items-start justify-between rounded-lg border p-4"
            >
              <div className="flex gap-4">
                <Icon className={`mt-1 h-6 w-6 ${color}`} />

                <div>
                  <h3 className="font-semibold">
                    {item.title}
                  </h3>

                  <p className="text-sm text-gray-500">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />

                {new Date(item.createdAt).toLocaleTimeString()}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
