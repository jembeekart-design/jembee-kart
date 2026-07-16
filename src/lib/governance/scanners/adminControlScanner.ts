import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import type { ScanResult } from "../runSystemScan";

export async function adminControlScanner(): Promise<ScanResult[]> {
  const results: ScanResult[] = [];

  const adminConfigs = [
    {
      id: "theme-settings",
      name: "Theme Settings",
      collection: "admin_settings",
      document: "customize",
    },
    {
      id: "feature-flags",
      name: "Feature Flags",
      collection: "settings",
      document: "feature_flags",
    },
    {
      id: "wallet-settings",
      name: "Wallet Settings",
      collection: "settings",
      document: "wallet",
    },
    {
      id: "mlm-settings",
      name: "MLM Settings",
      collection: "settings",
      document: "mlm",
    },
    {
      id: "watch-earn-settings",
      name: "Watch & Earn Settings",
      collection: "settings",
      document: "watch_earn",
    },
  ];

  for (const item of adminConfigs) {
    try {
      const snapshot = await getDoc(
        doc(db, item.collection, item.document)
      );

      if (!snapshot.exists()) {
        results.push({
          id: item.id,
          name: item.name,

          status: "FAIL",
          severity: "HIGH",

          message: "Admin configuration document not found.",

          file: "/src/lib/governance/scanners/adminControlScanner.ts",
          line: 40,

          autoFix: true,

          patchId: `${item.id}-create`,

          suggestion:
            "Create the missing Admin configuration document.",

          currentCode:
            "// Admin configuration document does not exist.",

          fixedCode: `Collection: ${item.collection}
Document: ${item.document}

{
  "enabled": true,
  "updatedAt": "SERVER_TIMESTAMP"
}`,
        });

        continue;
      }

      const data = snapshot.data();

      if (!data || Object.keys(data).length === 0) {
        results.push({
          id: item.id,
          name: item.name,

          status: "WARNING",
          severity: "MEDIUM",

          message: "Configuration document is empty.",

          file: "/src/lib/governance/scanners/adminControlScanner.ts",
          line: 70,

          autoFix: true,

          patchId: `${item.id}-repair`,

          suggestion:
            "Generate the default Admin configuration.",

          currentCode:
            JSON.stringify(data, null, 2),

          fixedCode: `{
  "enabled": true,
  "updatedAt": "SERVER_TIMESTAMP"
}`,
        });

        continue;
      }

      results.push({
        id: item.id,
        name: item.name,

        status: "PASS",
        severity: "LOW",

        message: "Configuration is managed from Admin Panel.",

        file: "/src/lib/governance/scanners/adminControlScanner.ts",
        line: 95,
      });

    } catch (error) {
      console.error(`${item.name} Scanner Error`, error);

      results.push({
        id: item.id,
        name: item.name,

        status: "FAIL",
        severity: "HIGH",

        message: "Unable to verify admin configuration.",

        file: "/src/lib/governance/scanners/adminControlScanner.ts",
        line: 110,

        autoFix: true,

        patchId: `${item.id}-connection-fix`,

        suggestion:
          "Verify Firestore connection and Admin configuration.",

        currentCode:
          "// Admin configuration validation failed.",

        fixedCode: `Collection: ${item.collection}
Document: ${item.document}

{
  "enabled": true
}`,
      });
    }
  }

  return results;
}
