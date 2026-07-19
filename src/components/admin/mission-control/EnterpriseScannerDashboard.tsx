"use client";

import {
  Shield,
  Database,
  Palette,
  FileCode,
  Activity,
  CheckCircle2,
} from "lucide-react";

const scanners = [
  {
    title: "Theme Scanner",
    icon: Palette,
    status: "Ready",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    title: "Firestore Scanner",
    icon: Database,
    status: "Ready",
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    title: "Business Rule Scanner",
    icon: Shield,
    status: "Ready",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    title: "Duplicate Code Scanner",
    icon: FileCode,
    status: "Ready",
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
  {
    title: "Performance Scanner",
    icon: Activity,
    status: "Coming Soon",
    color: "text-gray-600",
    bg: "bg-gray-100",
  },
  {
    title: "Security Scanner",
    icon: CheckCircle2,
    status: "Coming Soon",
    color: "text-red-600",
    bg: "bg-red-50",
  },
];

export default function EnterpriseScannerDashboard() {
  return (
    <section className="rounded-xl border bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-xl font-bold">
          Enterprise Scanner Dashboard
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Monitor all governance scanners from one place.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {scanners.map((scanner) => {
          const Icon = scanner.icon;

          return (
            <div
              key={scanner.title}
              className="rounded-lg border p-5 transition hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div
                  className={`rounded-lg p-3 ${scanner.bg}`}
                >
                  <Icon
                    className={scanner.color}
                    size={24}
                  />
                </div>

                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold">
                  {scanner.status}
                </span>
              </div>

              <h3 className="mt-4 text-lg font-semibold">
                {scanner.title}
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Scanner is available in Mission Control.
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
