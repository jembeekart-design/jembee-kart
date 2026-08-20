import { AdNetwork } from "@/types/ads";

export interface AdProvider {
  /**
   * Safely loads network-specific scripts and configures the environment.
   * Only called in production, and only if network config is valid.
   */
  initializeScripts: (network: AdNetwork) => void;
}

const GAMProvider: AdProvider = {
  initializeScripts: (network) => {
    // Logic: Load GPT scripts, define slots (to be implemented in Phase C).
  },
};

const AdSenseAutoProvider: AdProvider = {
  initializeScripts: (network) => {
    // Logic: Inject Auto Ads script into header (to be implemented in Phase C).
  },
};

const AdSenseManualProvider: AdProvider = {
  initializeScripts: (network) => {
    // Logic: Inject AdSense script, define individual ad units (to be implemented in Phase C).
  },
};

export const getProvider = (mode: string): AdProvider | null => {
  switch (mode) {
    case "GAM": return GAMProvider;
    case "AdSense_Auto": return AdSenseAutoProvider;
    case "AdSense_Manual": return AdSenseManualProvider;
    default: return null;
  }
};
