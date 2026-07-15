import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import type { ScanResult } from "../runSystemScan";

export async function featureFlagScanner(): Promise<ScanResult[]> {
  const results: ScanResult[] = [];

  try {
    const snapshot = await getDoc(doc(db, "settings", "global_config"));

    if (!snapshot.exists()) {
      return [
        {
          id: "feature-flags",
          name: "Feature Flags",
          status: "FAIL",
          message: "Global configuration document not found.",
          severity: "HIGH",
        },
      ];
    }

    const data = snapshot.data();
    const flags = data.featureFlags ?? {};

    const features = [
      {
        key: "ecommerce",
        label: "Ecommerce",
      },
      {
        key: "referral",
        label: "Referral System",
      },
      {
        key: "mlm",
        label: "MLM Engine",
      },
      {
        key: "wallet",
        label: "Wallet System",
      },
      {
        key: "watchEarn",
        label: "Watch & Earn",
      },
      {
        key: "creatorEconomy",
        label: "Creator Economy",
      },
      {
        key: "cashback",
        label: "Cashback",
      },
      {
        key: "coinSystem",
        label: "Coin System",
      },
      {
        key: "loyaltyProgram",
        label: "Loyalty Program",
      },
      {
        key: "sellerModule",
        label: "Seller Module",
      },
      {
        key: "advertisement",
        label: "Advertisement",
      },
      {
        key: "affiliate",
        label: "Affiliate",
      },
    ];

    for (const feature of features) {
      const enabled = Boolean(flags[feature.key]);

      results.push({
        id: feature.key,
        name: feature.label,
        status: enabled ? "PASS" : "WARNING",
        message: enabled
          ? `${feature.label} is enabled.`
          : `${feature.label} is disabled.`,
        severity: enabled ? "LOW" : "MEDIUM",
      });
    }

    return results;
  } catch (error) {
    console.error("Feature Flag Scanner Error:", error);

    return [
      {
        id: "feature-flags",
        name: "Feature Flag Scanner",
        status: "FAIL",
        message: "Unable to verify feature flags.",
        severity: "HIGH",
      },
    ];
  }
}
