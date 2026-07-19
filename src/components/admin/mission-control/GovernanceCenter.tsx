"use client";

import {
  ShieldCheck,
  FileWarning,
  Database,
  Settings2,
  Flag,
  BadgeCheck,
} from "lucide-react";

const governance = [
  {
    title: "Compliance Score",
    value: "98%",
    status: "Excellent",
    icon: BadgeCheck,
  },
  {
    title: "Hardcoded Rules",
    value: "12",
    status: "Needs Review",
    icon: FileWarning,
  },
  {
    title: "Admin Control Coverage",
    value: "96%",
    status: "Healthy",
    icon: Settings2,
  },
  {
    title: "Firestore Health",
    value: "Healthy",
    status: "Connected",
    icon: Database,
  },
  {
    title: "Feature Flags",
    value: "18 Enabled",
    status: "Active",
    icon: Flag,
  },
  {
    title: "Governance",
    value: "Protected",
    status: "Secure",
    icon: ShieldCheck,
  },
];

export default function GovernanceCenter() {
  return (
    <section className="rounded-xl border bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">
          Governance Center
        </h2>

        <p className="text-sm text-gray-500">
          Monitor governance, compliance and admin-controlled rules.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {governance.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-xl border p-5 hover:shadow-md transition"
            >
              <Icon className="mb-3 h-8 w-8 text-emerald-600" />

              <h3 className="text-sm text-gray-500">
                {item.title}
              </h3>

              <p className="mt-2 text-2xl font-bold">
                {item.value}
              </p>

              <span className="mt-3 inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                {item.status}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
