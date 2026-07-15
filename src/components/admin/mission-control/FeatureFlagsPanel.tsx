"use client";

import { useAdminConfig } from "@/lib/admin-config/provider";

export default function FeatureFlagsPanel() {
  const { config } = useAdminConfig();

  const flags = Object.entries(config.featureFlags);

  return (
    <section className="rounded-xl border bg-white p-6">
      <h2 className="mb-6 text-sm font-bold uppercase tracking-wider text-gray-500">
        Feature Flags
      </h2>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {flags.map(([key, enabled]) => (
          <div
            key={key}
            className="flex items-center justify-between rounded-lg border p-4"
          >
            <span className="capitalize">
              {key.replace(/([A-Z])/g, " $1")}
            </span>

            <span
              className={
                enabled
                  ? "font-bold text-green-600"
                  : "font-bold text-red-500"
              }
            >
              {enabled ? "Enabled" : "Disabled"}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
