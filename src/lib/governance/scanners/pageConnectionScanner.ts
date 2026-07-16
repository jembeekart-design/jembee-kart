import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import type { ScanResult } from "../runSystemScan";

type PageCheck = {
  id: string;
  name: string;
  collection: string;
  document: string;
};

export async function pageConnectionScanner(): Promise<ScanResult[]> {
  const results: ScanResult[] = [];

  const pages: PageCheck[] = [
    {
      id: "homepage",
      name: "Homepage",
      collection: "settings",
      document: "global_config",
    },
    {
      id: "theme-builder",
      name: "Theme Builder",
      collection: "admin_settings",
      document: "customize",
    },
    {
      id: "mission-control",
      name: "Mission Control",
      collection: "settings",
      document: "global_config",
    },
    {
      id: "wallet",
      name: "Wallet Module",
      collection: "settings",
      document: "wallet",
    },
    {
      id: "referral",
      name: "Referral Module",
      collection: "settings",
      document: "referral",
    },
    {
      id: "watch-earn",
      name: "Watch & Earn",
      collection: "settings",
      document: "watch_earn",
    },
    {
      id: "feature-flags",
      name: "Feature Flags",
      collection: "settings",
      document: "feature_flags",
    },
    {
      id: "mlm",
      name: "MLM Module",
      collection: "settings",
      document: "mlm",
    },
  ];

  for (const page of pages) {
    try {
      const snapshot = await getDoc(
        doc(db, page.collection, page.document)
      );

      if (snapshot.exists()) {
        results.push({
          id: page.id,
          name: page.name,
          status: "PASS",
          severity: "LOW",
          message: "Configuration connected successfully.",

          file: "/src/lib/governance/scanners/pageConnectionScanner.ts",
          line: 1,
        });
      } else {
        results.push({
          id: page.id,
          name: page.name,
          status: "WARNING",
          severity: "MEDIUM",
          message: "Configuration document not found.",

          file: "/src/lib/governance/scanners/pageConnectionScanner.ts",
          line: 1,

          autoFix: true,
          patchId: `${page.id}-connection-fix`,

          currentCode: `Connection to ${page.collection}/${page.document} is missing.`,

          fixedCode: `Create Firestore document:
Collection: ${page.collection}
Document: ${page.document}

Initialize required configuration fields.`,

          suggestion:
            "Create the missing Firestore configuration document from the Admin Panel.",
        });
      }
    } catch (error) {
      console.error(`${page.name} Scanner Error`, error);

      results.push({
        id: page.id,
        name: page.name,
        status: "FAIL",
        severity: "HIGH",
        message: "Unable to verify page connection.",

        file: "/src/lib/governance/scanners/pageConnectionScanner.ts",
        line: 1,

        autoFix: true,
        patchId: `${page.id}-error-fix`,

        currentCode: "// Connection check failed",

        fixedCode: `// Verify Firebase configuration
// Verify Firestore permissions
// Verify ${page.collection}/${page.document}`,

        suggestion:
          "Verify Firebase configuration and reconnect this module automatically.",
      });
    }
  }

  return results;
}
