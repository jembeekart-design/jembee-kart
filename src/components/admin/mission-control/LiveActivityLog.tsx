"use client";

import {
  Activity,
  CheckCircle2,
  Wrench,
  Database,
  ShieldCheck,
  Clock,
} from "lucide-react";

const activities = [
  {
    title: "Enterprise Scanner Completed",
    description: "All scanners finished successfully.",
    icon: CheckCircle2,
    time: "2 minutes ago",
  },
  {
    title: "Auto Fix Applied",
    description: "Theme variables updated.",
    icon: Wrench,
    time: "5 minutes ago",
  },
  {
    title: "Firestore Scan",
    description: "28 collections verified.",
    icon: Database,
    time: "8 minutes ago",
  },
  {
    title: "Security Scan",
    description: "No critical vulnerabilities detected.",
    icon: ShieldCheck,
    time: "15 minutes ago",
  },
];

export default function LiveActivityLog() {
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
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="flex items-start justify-between rounded-lg border p-4"
            >
              <div className="flex gap-4">
                <Icon className="mt-1 h-6 w-6 text-blue-600" />

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
                {item.time}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
