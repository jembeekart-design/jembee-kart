import { AdNetwork } from "@/types/ads";
import { injectScript } from "../scriptLoader";
import { ALLOW_LIVE_SERVING } from "../constants";

export interface AdProvider {
  /**
   * Safely loads network-specific scripts.
   * Double-gate check: ALLOW_LIVE_SERVING must be true AND config must be valid.
   */
  initializeScripts: (network: AdNetwork) => void;
}

const GAMProvider: AdProvider = {
  initializeScripts: (network) => {
    // 1. Double-Gate Check
    if (!ALLOW_LIVE_SERVING) return;
    
    // 2. Config Validation
    if (!network.config.gamNetworkCode) return;
    
    // 3. Inject
    injectScript("https://securepubads.g.doubleclick.net/tag/js/gpt.js", "gpt-script");
  },
};

const AdSenseAutoProvider: AdProvider = {
  initializeScripts: (network) => {
    // 1. Double-Gate Check
    if (!ALLOW_LIVE_SERVING) return;
    
    // 2. Config Validation
    if (!network.config.adsenseClientId) return;
    
    // 3. Inject
    injectScript(`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${network.config.adsenseClientId}`, "adsense-auto-script");
  },
};

const AdSenseManualProvider: AdProvider = {
  initializeScripts: (network) => {
    // 1. Double-Gate Check
    if (!ALLOW_LIVE_SERVING) return;
    
    // 2. Config Validation
    if (!network.config.adsenseClientId) return;
    
    // 3. Inject
    injectScript(`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${network.config.adsenseClientId}`, "adsense-manual-script");
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
