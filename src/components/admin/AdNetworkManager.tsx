"use client";

import { AdSlotManager } from "./AdSlotManager";
import { MonetagGlobalControl } from "./MonetagGlobalControl";

export function AdNetworkManager() {
  return (
    <div className="space-y-6">
      <MonetagGlobalControl />
      <AdSlotManager />
    </div>
  );
}
