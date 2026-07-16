import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import type { ScanResult } from "../runSystemScan";

export async function themeScanner(): Promise<ScanResult[]> {
  try {
    const snapshot = await getDoc(
      doc(db, "settings", "theme")
    );

    if (!snapshot.exists()) {
      return [
        {
          id: "theme-config",
          name: "Theme Configuration",
          status: "FAIL",
          message: "Theme document not found.",
          severity: "HIGH",
          file: "/src/lib/governance/scanners/themeScanner.ts",
          line: 10,
        },
      ];
    }

    const theme = snapshot.data();

    const requiredFields = [
      "primaryColor",
      "secondaryColor",
      "backgroundColor",
      "cardColor",
      "textColor",
      "borderColor",
      "buttonColor",
      "buttonTextColor",
    ] as const;

    const missingFields = requiredFields.filter(
      (field) => !theme[field]
    );

    if (missingFields.length > 0) {
      return [
        {
          id: "theme-config",
          name: "Theme Configuration",
          status: "WARNING",
          message: `Missing fields: ${missingFields.join(", ")}`,
          severity: "MEDIUM",
          file: "/src/lib/governance/scanners/themeScanner.ts",
          line: 35,
        },
      ];
    }

    return [
      {
        id: "theme-config",
        name: "Theme Configuration",
        status: "PASS",
        message: "Theme configuration is valid.",
        severity: "LOW",
        file: "/src/lib/governance/scanners/themeScanner.ts",
        line: 50,
      },
    ];
  } catch (error) {
    console.error("Theme Scanner Error:", error);

    return [
      {
        id: "theme-config",
        name: "Theme Configuration",
        status: "FAIL",
        message: "Unable to validate theme configuration.",
        severity: "HIGH",
        file: "/src/lib/governance/scanners/themeScanner.ts",
        line: 60,
      },
    ];
  }
}
