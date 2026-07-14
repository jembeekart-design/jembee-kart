// src/lib/admin-config/validator.ts

import { AdminConfig } from "./types";
import { DEFAULT_ADMIN_CONFIG } from "./defaults";

/**
 * Validates and Deep Merges fetched config with defaults.
 * Ensures structural integrity even with partial or malformed Firestore data.
 */
export function validateConfig(data: any): AdminConfig {
  if (!data || typeof data !== "object") {
    console.warn("Invalid or empty config received, using defaults.");
    return DEFAULT_ADMIN_CONFIG;
  }

  // Version check for future-proofing migration
  if (data.version !== undefined && data.version !== DEFAULT_ADMIN_CONFIG.version) {
    console.warn(`Config version mismatch: Expected ${DEFAULT_ADMIN_CONFIG.version}, got ${data.version}.`);
  }

  try {
    const validated: AdminConfig = {
      version: data.version ?? DEFAULT_ADMIN_CONFIG.version,
      
      theme: { ...DEFAULT_ADMIN_CONFIG.theme, ...(data.theme || {}) },
      payment: { ...DEFAULT_ADMIN_CONFIG.payment, ...(data.payment || {}) },
      shipping: { ...DEFAULT_ADMIN_CONFIG.shipping, ...(data.shipping || {}) },
      watchEarn: { ...DEFAULT_ADMIN_CONFIG.watchEarn, ...(data.watchEarn || {}) },
      cashback: { ...DEFAULT_ADMIN_CONFIG.cashback, ...(data.cashback || {}) },
      mlm: { ...DEFAULT_ADMIN_CONFIG.mlm, ...(data.mlm || {}) },
      referral: { ...DEFAULT_ADMIN_CONFIG.referral, ...(data.referral || {}) },
      signup: { ...DEFAULT_ADMIN_CONFIG.signup, ...(data.signup || {}) },
      wallet: { ...DEFAULT_ADMIN_CONFIG.wallet, ...(data.wallet || {}) },
      seller: { ...DEFAULT_ADMIN_CONFIG.seller, ...(data.seller || {}) },
      mlmPage: { ...DEFAULT_ADMIN_CONFIG.mlmPage, ...(data.mlmPage || {}) },
      featureFlags: { ...DEFAULT_ADMIN_CONFIG.featureFlags, ...(data.featureFlags || {}) },
      
      header: { ...DEFAULT_ADMIN_CONFIG.header, ...(data.header || {}) },
      footer: { ...DEFAULT_ADMIN_CONFIG.footer, ...(data.footer || {}) },
      
      homepage: { 
        ...DEFAULT_ADMIN_CONFIG.homepage, 
        ...(data.homepage || {}),
        sections: Array.isArray(data.homepage?.sections) 
          ? data.homepage.sections 
          : DEFAULT_ADMIN_CONFIG.homepage.sections 
      },
      
      navigation: { 
        ...DEFAULT_ADMIN_CONFIG.navigation, 
        ...(data.navigation || {}),
        items: Array.isArray(data.navigation?.items) 
          ? data.navigation.items 
          : DEFAULT_ADMIN_CONFIG.navigation.items 
      },
      
      support: { ...DEFAULT_ADMIN_CONFIG.support, ...(data.support || {}) },
      notification: { ...DEFAULT_ADMIN_CONFIG.notification, ...(data.notification || {}) },
      app: { ...DEFAULT_ADMIN_CONFIG.app, ...(data.app || {}) },
    };

    return validated;
  } catch (error) {
    console.error("Critical error during config merge, reverting to safe defaults:", error);
    return DEFAULT_ADMIN_CONFIG;
  }
}

/**
 * Safely checks if a feature is enabled.
 */
export function isFeatureEnabled(
  config: AdminConfig, 
  feature: keyof AdminConfig["featureFlags"]
): boolean {
  return Boolean(config.featureFlags?.[feature]);
}

/**
 * Utility to check maintenance mode.
 */
export function isMaintenanceMode(config: AdminConfig): boolean {
  return Boolean(config.app?.maintenanceMode);
}
