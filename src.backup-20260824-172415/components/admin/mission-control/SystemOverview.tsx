"use client";

import { useAdminConfig } from "@/lib/admin-config/provider";

export default function SystemOverview() {
  const { config, source, lastUpdated } = useAdminConfig();

  const rows = [
    {
      label: "Application",
      value: config.app.appName,
    },
    {
      label: "Build Version",
      value: config.app.version,
    },
    {
      label: "Config Version",
      value: `v${config.version}`,
    },
    {
      label: "Config Source",
      value: source,
    },
    {
      label: "Maintenance Mode",
      value: config.app.maintenanceMode ? "Enabled" : "Disabled",
    },
    {
      label: "Last Sync",
      value: lastUpdated
        ? lastUpdated.toLocaleString()
        : "Never",
    },
  ];

  return (
    <section className="rounded-xl border bg-white p-6">
      <h2 className="mb-6 text-sm font-bold uppercase tracking-wider text-gray-500">
        System Overview
      </h2>

      <div className="grid gap-4 md:grid-cols-2">
        {rows.map((item) => (
          <div
            key={item.label}
            className="flex justify-between rounded-lg border p-4"
          >
            <span className="text-gray-500">
              {item.label}
            </span>

            <span className="font-semibold">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
