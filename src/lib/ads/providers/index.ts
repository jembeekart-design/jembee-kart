import type { AdNetwork } from "@/types/ads";

/**
 * Legacy script-provider adapter. Script-based GAM/AdSense/Monetag auto formats
 * are intentionally disabled. Admin-selected Monetag Direct Link cards are
 * rendered by MonetagPlacement and never inject third-party scripts.
 */
export interface AdProvider {
  initializeScripts: (network: AdNetwork) => void;
}

export function getProvider(_mode: string): AdProvider | null {
  return null;
}
