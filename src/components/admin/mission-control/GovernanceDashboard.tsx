"use client";

import {
  ShieldCheck,
  Database,
  Palette,
  Bug,
  Wallet,
  Cpu,
  AlertTriangle,
} from "lucide-react";

const scanners = [
  {
    title: "Security Scanner",
    status: "Ready",
    color: "text-[var(--success-color)]",
    icon: ShieldCheck,
  },
  {
    title: "Firestore Scanner",
    status: "Ready",
    color: "text-[var(--success-color)]",
    icon: Database,
  },
  {
    title: "Theme Scanner",
    status: "Ready",
    color: "text-[var(--success-color)]",
    icon: Palette,
  },
  {
    title: "Wallet Scanner",
    status: "Ready",
    color: "text-[var(--success-color)]",
    icon: Wallet,
  },
  {
    title: "Hardcoded Rule Scanner",
    status: "380 Warnings Detected",
    color: "text-yellow-600",
    icon: Bug,
  },
  {
    title: "Performance Scanner",
    status: "Coming Soon",
    color: "text-gray-500",
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
              className="rounded-lg border p-4 transition hover:shadow-sm"
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`h-5 w-5 ${
                    scanner.title === "Hardcoded Rule Scanner"
                      ? "text-yellow-600"
                      : "text-[var(--primary-color)]"
                  }`}
                />

                <div className="flex-1">
                  <p className="font-semibold">{scanner.title}</p>

                  <p className={`text-xs ${scanner.color}`}>
                    {scanner.status}
                  </p>

                  {scanner.title === "Hardcoded Rule Scanner" && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-yellow-600">
                      <AlertTriangle className="h-3 w-3" />
                      <span>Requires Review</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
