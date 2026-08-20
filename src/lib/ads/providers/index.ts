import { AdNetwork } from "@/types/ads";

export interface AdProvider {
  /**
   * Safely loads network-specific scripts (e.g., GPT, AdSense).
   * ONLY called in production and only if configuration is valid.
   */
  initializeScripts: (network: AdNetwork) => void;
}

const GAMProvider: AdProvider = {
  initializeScripts: (network) => {
    // In production, initialize GPT scripts here.
    // For now, this is a placeholder/test-mode no-op.
  },
};

const AdSenseProvider: AdProvider = {
  initializeScripts: (network) => {
    // In production, initialize AdSense scripts here.
    // For now, this is a placeholder/test-mode no-op.
  },
};

export const getProvider = (providerType: string): AdProvider | null => {
  switch (providerType) {
    case "GAM":
      return GAMProvider;
    case "AdSense":
      return AdSenseProvider;
    default:
      return null;
  }
};
