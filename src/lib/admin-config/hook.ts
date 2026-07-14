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

export function useWalletConfig() {
  const { config } = useAdminConfig();
  return config.wallet;
}

export function usePaymentConfig() {
  const { config } = useAdminConfig();
  return config.payment;
}

export function useWatchEarnConfig() {
  const { config } = useAdminConfig();
  return config.watchEarn;
}

export function useMlmConfig() {
  const { config } = useAdminConfig();
  return config.mlm;
}

export function useReferralConfig() {
  const { config } = useAdminConfig();
  return config.referral;
}

export function useFeatureFlags() {
  const { config } = useAdminConfig();
  return config.featureFlags;
}

export function useShippingConfig() {
  const { config } = useAdminConfig();
  return config.shipping;
}

export function useSupportConfig() {
  const { config } = useAdminConfig();
  return config.support;
}
