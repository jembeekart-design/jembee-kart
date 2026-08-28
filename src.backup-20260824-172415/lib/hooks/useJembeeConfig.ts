import { useAdminConfig } from "@/lib/admin-config/provider";

export const useJembeeConfig = () => {
  const { config } = useAdminConfig();
  
  return {
    theme: config.theme,
    features: config.featureFlags,
    mlm: config.mlm,
    wallet: config.wallet,
    referral: config.referral,
    // Add other modules here
    isModuleEnabled: (module: keyof typeof config.featureFlags) => config.featureFlags[module]
  };
};
