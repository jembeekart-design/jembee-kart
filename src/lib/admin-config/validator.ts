// src/lib/admin-config/validator.ts

import { AdminConfig } from "./types";
import { DEFAULT_ADMIN_CONFIG } from "./defaults";

/**
 * Validates and Deep Merges fetched config with defaults.
 * Ensures structural integrity even with partial or malformed Firestore data.
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function validateConfig(data: unknown): AdminConfig {
  if (!isRecord(data)) {
    console.warn("Invalid or empty config received, using defaults.");
    return DEFAULT_ADMIN_CONFIG;
  }

  // Version check for future-proofing migration
  if (data.version !== undefined && data.version !== DEFAULT_ADMIN_CONFIG.version) {
    console.warn(`Config version mismatch: Expected ${DEFAULT_ADMIN_CONFIG.version}, got ${String(data.version)}.`);
  }

  const section = (key: string): Record<string, unknown> =>
    isRecord(data[key]) ? data[key] : {};

  try {
    const homepage = section("homepage");
    const navigation = section("navigation");
    const validated: AdminConfig = {
      version: typeof data.version === "number" ? data.version : DEFAULT_ADMIN_CONFIG.version,

      theme: { ...DEFAULT_ADMIN_CONFIG.theme, ...section("theme") },
      activityTracker: { ...DEFAULT_ADMIN_CONFIG.activityTracker, ...section("activityTracker") },
      adminChat: { ...DEFAULT_ADMIN_CONFIG.adminChat, ...section("adminChat") },
      adsManager: { ...DEFAULT_ADMIN_CONFIG.adsManager, ...section("adsManager") },
      analytics: { ...DEFAULT_ADMIN_CONFIG.analytics, ...section("analytics") },
      announcement: { ...DEFAULT_ADMIN_CONFIG.announcement, ...section("announcement") },
      watchEarn: { ...DEFAULT_ADMIN_CONFIG.watchEarn, ...section("watchEarn") },
      watchEarnStats: { ...DEFAULT_ADMIN_CONFIG.watchEarnStats, ...section("watchEarnStats") },
      commentModeration: { ...DEFAULT_ADMIN_CONFIG.commentModeration, ...section("commentModeration") },
      featureFlags: { ...DEFAULT_ADMIN_CONFIG.featureFlags, ...section("featureFlags") },

      header: { ...DEFAULT_ADMIN_CONFIG.header, ...section("header") },
      footer: { ...DEFAULT_ADMIN_CONFIG.footer, ...section("footer") },

      homepage: {
        ...DEFAULT_ADMIN_CONFIG.homepage,
        ...homepage,
        sections: Array.isArray(homepage.sections)
          ? homepage.sections as typeof DEFAULT_ADMIN_CONFIG.homepage.sections
          : DEFAULT_ADMIN_CONFIG.homepage.sections,
      },

      navigation: {
        ...DEFAULT_ADMIN_CONFIG.navigation,
        ...navigation,
        items: Array.isArray(navigation.items)
          ? navigation.items as typeof DEFAULT_ADMIN_CONFIG.navigation.items
          : DEFAULT_ADMIN_CONFIG.navigation.items,
      },

      support: { ...DEFAULT_ADMIN_CONFIG.support, ...section("support") },
      notification: { ...DEFAULT_ADMIN_CONFIG.notification, ...section("notification") },
      app: { ...DEFAULT_ADMIN_CONFIG.app, ...section("app") },
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
