"use client";

import { useAdminConfig } from "@/lib/admin-config/provider";
import SystemHealth from "./SystemHealth";
import BuildDiagnostics from "./BuildDiagnostics";
import GovernanceActions from "./GovernanceActions";
import SystemOverview from "./SystemOverview";
import GovernanceDashboard from "./GovernanceDashboard";
import FeatureFlagsPanel from "./FeatureFlagsPanel";
import ScannerResults from "./ScannerResults";
import QuickLinks from "./QuickLinks";
import { AlertCircle } from "lucide-react";

export default function MissionControl() {
  const { status, error, lastUpdated } = useAdminConfig();

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

      {/* Modular Components */}
      <SystemHealth />
      <BuildDiagnostics />
      <GovernanceActions />
      <SystemOverview />
      <GovernanceDashboard />
      <FeatureFlagsPanel />
      <ScannerResults />
      <QuickLinks />
    </div>
  );
}
