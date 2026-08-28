"use client";

import { useAdminConfig } from "@/lib/admin-config/provider";

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
      <p className="text-[9px] text-gray-500 font-bold uppercase">
        {label}
      </p>

      <p className="font-mono font-bold text-gray-800 text-sm truncate">
        {value}
      </p>
    </div>
  );
}

export default function BuildDiagnostics() {
  const { config } = useAdminConfig();

  return (
    <section>
      <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
        Build Diagnostics
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Build Version"
          value={config?.app?.version || "N/A"}
        />

        <MetricCard
          label="Config Version"
          value={`v${config?.version || "0"}`}
        />

        <MetricCard
          label="Environment"
          value={process.env.NODE_ENV || "unknown"}
        />

        <MetricCard
          label="Realtime Listeners"
          value="N/A"
        />
      </div>
    </section>
  );
}
