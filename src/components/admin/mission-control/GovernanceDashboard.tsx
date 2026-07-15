"use client";

import {
  ShieldCheck,
  Database,
  Palette,
  Bug,
  Wallet,
  Cpu,
} from "lucide-react";

const scanners = [
  {
    title: "Security Scanner",
    status: "Ready",
    icon: ShieldCheck,
  },
  {
    title: "Firestore Scanner",
    status: "Ready",
    icon: Database,
  },
  {
    title: "Theme Scanner",
    status: "Ready",
    icon: Palette,
  },
  {
    title: "Wallet Scanner",
    status: "Ready",
    icon: Wallet,
  },
  {
    title: "Hardcoded Rule Scanner",
    status: "Coming Soon",
    icon: Bug,
  },
  {
    title: "Performance Scanner",
    status: "Coming Soon",
    icon: Cpu,
  },
];

export default function GovernanceDashboard() {
  return (
    <section className="rounded-xl border bg-white p-6">
      <h2 className="mb-6 text-sm font-bold uppercase tracking-wider text-gray-500">
        Governance Dashboard
      </h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {scanners.map((scanner) => {
          const Icon = scanner.icon;

          return (
            <div
              key={scanner.title}
              className="rounded-lg border p-4 hover:shadow-sm transition"
            >
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5 text-blue-600" />

                <div>
                  <p className="font-semibold">
                    {scanner.title}
                  </p>

                  <p className="text-xs text-gray-500">
                    {scanner.status}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
