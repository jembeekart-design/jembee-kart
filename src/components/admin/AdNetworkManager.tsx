"use client";

import { AdSlotManager } from "./AdSlotManager";
import { MonetagGlobalControl } from "./MonetagGlobalControl";
import { VideoAdScheduleManager } from "./VideoAdScheduleManager";
import { AdDiagnosticsPanel } from "./AdDiagnosticsPanel";

export function AdNetworkManager() {
  return (
    <div className="space-y-6">
      <MonetagGlobalControl />
      <VideoAdScheduleManager />
      <AdSlotManager />
      <AdDiagnosticsPanel />
    </div>
  );
}
