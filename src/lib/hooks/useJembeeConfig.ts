import { useAdminConfig } from "@/lib/admin-config/provider";

export const useJembeeConfig = () => {
  const { config } = useAdminConfig();
  return {
    theme: config.theme,
    features: config.featureFlags,
    isModuleEnabled: (module: keyof typeof config.featureFlags) => config.featureFlags[module],
  };
};
