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
          line: 1,
        });
      } else {
        results.push({
          id: item.id,
          name: item.name,

          status: "FAIL",
          severity: "HIGH",

          message: "Required Firestore document is missing.",

          file: item.file,
          line: 1,

          autoFix: true,

          patchId: `${item.id}-firestore-fix`,

          suggestion:
            "Create the missing Firestore document automatically.",

          currentCode:
            "// Firestore document does not exist.",

          fixedCode: `// Create Firestore document

Collection: settings
Document: ${item.id}

{
  "createdAt": "SERVER_TIMESTAMP",
  "updatedAt": "SERVER_TIMESTAMP"
}
`,
        });
      }
    } catch (error) {
      console.error(`${item.name} Scanner Error`, error);

      results.push({
        id: item.id,
        name: item.name,

        status: "FAIL",
        severity: "HIGH",

        message: "Unable to access Firestore document.",

        file: item.file,
        line: 1,

        autoFix: true,

        patchId: `${item.id}-connection-fix`,

        suggestion:
          "Verify Firebase configuration and Firestore Security Rules.",

        currentCode:
          "// Firestore connection failed.",

        fixedCode: `// Verify Firebase configuration

1. Check firebase config
2. Check Firestore Rules
3. Check Internet Connection
4. Verify settings/${item.id} document
`,
      });
    }
  }

  return results;
}
