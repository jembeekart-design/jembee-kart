import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import type { ScanResult } from "../runSystemScan";

export async function featureFlagScanner(): Promise<ScanResult[]> {
  try {
    const snapshot = await getDoc(
      doc(db, "settings", "feature_flags")
    );

    if (!snapshot.exists()) {
      return [
        {
          id: "feature-flags",
          name: "Feature Flags",

          status: "FAIL",
          severity: "HIGH",

          message: "Feature Flags document not found.",

          file: "/src/lib/governance/scanners/featureFlagScanner.ts",
          line: 10,

          autoFix: true,

          patchId: "feature-flags-create",

          suggestion:
            "Create the default Feature Flags configuration.",

          currentCode:
            "// Feature Flags document does not exist.",

          fixedCode: `{
  "ecommerce": true,
  "referral": true,
  "mlm": true,
  "wallet": true,
  "watchEarn": true,
  "creatorEconomy": true,
  "cashback": true,
  "coinSystem": true,
  "loyaltyProgram": true,
  "sellerModule": true,
  "advertisement": true,
  "affiliate": true
}`,
        },
      ];
    }

    const flags = snapshot.data();

    const features = [
      { key: "ecommerce", label: "Ecommerce" },
      { key: "referral", label: "Referral System" },
      { key: "mlm", label: "MLM Engine" },
      { key: "wallet", label: "Wallet System" },
      { key: "watchEarn", label: "Watch & Earn" },
      { key: "creatorEconomy", label: "Creator Economy" },
      { key: "cashback", label: "Cashback" },
      { key: "coinSystem", label: "Coin System" },
      { key: "loyaltyProgram", label: "Loyalty Program" },
      { key: "sellerModule", label: "Seller Module" },
      { key: "advertisement", label: "Advertisement" },
      { key: "affiliate", label: "Affiliate" },
    ];

    const results: ScanResult[] = [];

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

        file: "/src/lib/governance/scanners/featureFlagScanner.ts",
        line: 60,

        ...(enabled
          ? {}
          : {
              autoFix: true,

              patchId: `${feature.key}-feature-fix`,

              suggestion: `Enable ${feature.label} automatically.`,

              currentCode: `"${feature.key}": false`,

              fixedCode: `"${feature.key}": true`,
            }),
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
        severity: "HIGH",

        message: "Unable to verify feature flags.",

        file: "/src/lib/governance/scanners/featureFlagScanner.ts",
        line: 100,

        autoFix: true,

        patchId: "feature-flags-error",

        suggestion:
          "Verify Firestore connection and recreate Feature Flags configuration.",

        currentCode:
          "// Feature Flags validation failed.",

        fixedCode: `{
  "ecommerce": true,
  "referral": true,
  "mlm": true,
  "wallet": true,
  "watchEarn": true,
  "creatorEconomy": true,
  "cashback": true,
  "coinSystem": true,
  "loyaltyProgram": true,
  "sellerModule": true,
  "advertisement": true,
  "affiliate": true
}`,
      },
    ];
  }
}
