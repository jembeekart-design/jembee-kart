import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import type { ScanResult } from "../runSystemScan";

export async function firestoreScanner(): Promise<ScanResult[]> {
  const results: ScanResult[] = [];

  const requiredDocuments = [
    {
      id: "global-config",
      name: "Global Configuration",
      ref: doc(db, "settings", "global_config"),
      file: "firestore/settings/global_config",
    },
    {
      id: "theme-config",
      name: "Theme Settings",
      ref: doc(db, "settings", "theme"),
      file: "firestore/settings/theme",
    },
  ];

  for (const item of requiredDocuments) {
    try {
      const snapshot = await getDoc(item.ref);

      if (snapshot.exists()) {
        results.push({
          id: item.id,
          name: item.name,
          status: "PASS",
          message: "Document found.",
          severity: "LOW",
          file: item.file,
        });
      } else {
        results.push({
          id: item.id,
          name: item.name,
          status: "FAIL",
          message: "Required Firestore document is missing.",
          severity: "HIGH",

          file: item.file,
          line: 1,

          autoFix: true,

          fixedCode: `// Create Firestore document
Collection: settings
Document: ${item.id}
`,
        });
      }
    } catch (error) {
      console.error(`${item.name} Scanner Error`, error);

      results.push({
        id: item.id,
        name: item.name,
        status: "FAIL",
        message: "Unable to access Firestore document.",
        severity: "HIGH",

        file: item.file,
        line: 1,

        autoFix: true,

        fixedCode: `// Check Firebase configuration and Firestore rules`,
      });
    }
  }

  return results;
}
