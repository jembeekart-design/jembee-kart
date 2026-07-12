"use client";

import { useAdminConfig } from "./provider";

export function useAdminPage() {
  const config = useAdminConfig();

  return {
    config,

    // Theme
    theme: config.theme,

    // Modules
    payment: config.payment,
    shipping: config.shipping,
    wallet: config.wallet,
    watchEarn: config.watchEarn,
    cashback: config.cashback,
    mlm: config.mlm,
    signup: config.signup,
    seller: config.seller,

    // Feature Flags
    featureFlags: config.featureFlags,

    // Helper Methods
    isFeatureEnabled: (
      feature: keyof typeof config.featureFlags
    ) => {
      return config.featureFlags[feature];
    },

    getThemeColor: (
      color: keyof typeof config.theme
    ) => {
      return config.theme[color];
    },
  };
}

export default useAdminPage;
