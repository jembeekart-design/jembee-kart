// src/lib/admin-config/hook.ts

"use client";

import { useAdminConfig } from "./provider";

/**
 * Custom hooks for easy access to specific config modules.
 * These hooks automatically handle the context subscription.
 */

export function useThemeConfig() {
  const { config } = useAdminConfig();
  return config.theme;
}



export function useWatchEarnConfig() {
  const { config } = useAdminConfig();
  return config.watchEarn;
}



export function useFeatureFlags() {
  const { config } = useAdminConfig();
  return config.featureFlags;
}


export function useSupportConfig() {
  const { config } = useAdminConfig();
  return config.support;
}
