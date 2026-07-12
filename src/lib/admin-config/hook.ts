// src/lib/admin-config/hook.ts

"use client";

import { useAdminConfig } from "./provider";

export function useThemeConfig() {
  const config = useAdminConfig();

  return config.theme;
}

export function useWalletConfig() {
  const config = useAdminConfig();

  return config.wallet;
}

export function useCheckoutConfig() {
  const config = useAdminConfig();

  return config.checkout;
}

export function useWatchEarnConfig() {
  const config = useAdminConfig();

  return config.watchEarn;
}

export function useMlmConfig() {
  const config = useAdminConfig();

  return config.mlm;
}

export function useReferralConfig() {
  const config = useAdminConfig();

  return config.referral;
}

export function useFeatureFlags() {
  const config = useAdminConfig();

  return config.featureFlags;
}
