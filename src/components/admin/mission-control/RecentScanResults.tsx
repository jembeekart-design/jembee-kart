"use client";

import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  Shield,
} from "lucide-react";

const scans = [
  {
    name: "Firestore Scanner",
    status: "Passed",
    icon: CheckCircle2,
    time: "2 min ago",
  },
  {
    name: "Theme Scanner",
    status: "Passed",
    icon: CheckCircle2,
    time: "2 min ago",
  },
  {
    name: "Business Rule Scanner",
    status: "380 Warnings",
    icon: AlertTriangle,
    time: "3 min ago",
  },
  {
    name: "Security Scanner",
    status: "Passed",
    icon: Shield,
    time: "5 min ago",
  },
];

export default function RecentScanResults() {
  return (
    <section className="rounded-xl border bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">
          Recent Scan Results
        </h2>

        <p className="text-sm text-gray-500">
          Latest governance scan history
        </p>
      </div>

      <div className="space-y-4">
        {scans.map((scan) => {
          const Icon = scan.icon;

          return (
            <div
              key={scan.name}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5 text-blue-600" />

                <div>
                  <h3 className="font-medium">
                    {scan.name}
                  </h3>

                  <p className="text-sm text-gray-500">
                    {scan.status}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                {scan.time}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
