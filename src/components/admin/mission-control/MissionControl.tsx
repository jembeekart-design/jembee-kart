"use client";

import { useAdminConfig } from "@/lib/admin-config/provider";
import { useRouter } from "next/navigation";
import SystemHealth from "./SystemHealth";
import { AlertCircle } from "lucide-react";

export default function MissionControl() {
  const { config, status, error, lastUpdated } = useAdminConfig();
  const router = useRouter();

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 font-sans">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">JembeeKart Mission Control</h1>
          <p className="text-gray-500 text-sm">System Status: {status === "ready" ? "Operational" : "Degraded"}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-gray-400 uppercase">Last Sync</p>
          <p className="font-mono text-sm">{lastUpdated?.toLocaleTimeString() || "Pending"}</p>
        </div>
      </header>

      {/* Error Handling */}
      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          <AlertCircle size={18} />
          <span className="text-sm font-medium">{error.message || "An unknown system error occurred"}</span>
        </div>
      )}

      {/* Modular Status Section */}
      <SystemHealth />

      {/* Performance & Versioning */}
      <section>
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Build Diagnostics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           <MetricCard label="Build Version" value={config?.app?.version || "N/A"} />
           <MetricCard label="Config Version" value={`v${config?.version || "0"}`} />
           <MetricCard label="Realtime Listeners" value="N/A" />
           <MetricCard label="Environment" value={process.env.NODE_ENV || "unknown"} />
        </div>
      </section>

      {/* Governance Actions */}
      <section className="border-t pt-8">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Governance Actions</h2>
        <div className="flex flex-wrap gap-3">
          <ActionButton onClick={() => router.refresh()} label="Reload Config" />
          <ActionButton onClick={() => {}} label="Run Full Audit" variant="secondary" />
          <ActionButton onClick={() => {}} label="Clear Cache" variant="danger" />
        </div>
      </section>
    </div>
  );
}

function MetricCard({ label, value }: { label: string, value: string }) {
  return (
    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
      <p className="text-[9px] text-gray-500 font-bold uppercase">{label}</p>
      <p className="font-mono font-bold text-gray-800 text-sm truncate">{value}</p>
    </div>
  );
}

function ActionButton({ onClick, label, variant = "primary" }: any) {
  const styles = {
    primary: "bg-gray-900 text-white hover:bg-black",
    secondary: "bg-white border border-gray-200 hover:bg-gray-50",
    danger: "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100"
  };
  return (
    <button 
      onClick={onClick} 
      className={`px-4 py-2 rounded-lg font-bold text-[11px] transition-all ${styles[variant as keyof typeof styles]}`}
    >
      {label}
    </button>
  );
}
