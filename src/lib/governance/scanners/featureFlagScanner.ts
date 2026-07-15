import type { ScanResult } from "../runSystemScan";
import { DEFAULT_ADMIN_CONFIG } from "@/lib/admin-config/defaults";

export async function featureFlagScanner(): Promise<ScanResult[]> {
  try {
    const flags = DEFAULT_ADMIN_CONFIG.featureFlags;

    if (!flags) {
      return [
        {
          id: "feature-flags",
          name: "Feature Flags",
          status: "FAIL",
          message: "Feature flags configuration not found.",
          severity: "HIGH",
        },
      ];
    }

    const requiredFlags = [
      "ecommerce",
      "referral",
      "wallet",
      "cashback",
      "loyalty",
      "creatorEconomy",
    ] as const;

    const results: ScanResult[] = [];

    for (const flag of requiredFlags) {
      results.push({
        id: `feature-${flag}`,
        name: `${flag} Module`,
        status: flags[flag] ? "PASS" : "WARNING",
        message: flags[flag]
          ? "Module is enabled."
          : "Module is disabled.",
        severity: flags[flag] ? "LOW" : "MEDIUM",
      });
    }

    return results;
  } catch (error) {
    console.error("Feature Flag Scanner Error:", error);

    return [
      {
        id: "feature-flags",
        name: "Feature Flags",
        status: "FAIL",
        message: "Unable to validate feature flags.",
        severity: "HIGH",
      },
    ];
  }
}
