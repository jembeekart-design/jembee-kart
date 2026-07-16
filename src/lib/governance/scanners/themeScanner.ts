import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import type { ScanResult } from "../runSystemScan";

export async function themeScanner(): Promise<ScanResult[]> {
  try {
    const snapshot = await getDoc(
      doc(db, "settings", "global_config")
    );

    if (!snapshot.exists()) {
      return [
        {
          id: "theme-config",
          name: "Theme Configuration",
          status: "FAIL",
          message: "Global configuration document not found.",
          severity: "HIGH",
          file: "/src/lib/governance/scanners/themeScanner.ts",
          line: 10,
        },
      ];
    }

    const data = snapshot.data();
    const theme = data.theme;

    if (!theme) {
      return [
        {
          id: "theme-config",
          name: "Theme Configuration",
          status: "FAIL",
          message: "Theme configuration is missing.",
          severity: "HIGH",
          file: "/src/lib/governance/scanners/themeScanner.ts",
          line: 28,
        },
      ];
    }

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
          line: 53,
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
        line: 66,
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
        line: 76,
      },
    ];
  }
}
