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
          severity: "HIGH",

          message: "Theme document not found.",

          file: "/src/lib/governance/scanners/themeScanner.ts",
          line: 10,

          autoFix: true,

          patchId: "theme-config-create",

          suggestion:
            "Create the default theme configuration in Firestore.",

          currentCode:
            "// Theme document does not exist.",

          fixedCode: `{
  "primaryColor": "#2563eb",
  "secondaryColor": "#0f172a",
  "backgroundColor": "#ffffff",
  "cardColor": "#ffffff",
  "textColor": "#111827",
  "borderColor": "#e5e7eb",
  "buttonColor": "#2563eb",
  "buttonTextColor": "#ffffff"
}`,
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
          severity: "MEDIUM",

          message: `Missing fields: ${missingFields.join(", ")}`,

          file: "/src/lib/governance/scanners/themeScanner.ts",
          line: 45,

          autoFix: true,

          patchId: "theme-fields-fix",

          suggestion:
            "Generate all missing theme fields automatically.",

          currentCode: JSON.stringify(theme, null, 2),

          fixedCode: `{
  "primaryColor": "${theme.primaryColor ?? "#2563eb"}",
  "secondaryColor": "${theme.secondaryColor ?? "#0f172a"}",
  "backgroundColor": "${theme.backgroundColor ?? "#ffffff"}",
  "cardColor": "${theme.cardColor ?? "#ffffff"}",
  "textColor": "${theme.textColor ?? "#111827"}",
  "borderColor": "${theme.borderColor ?? "#e5e7eb"}",
  "buttonColor": "${theme.buttonColor ?? "#2563eb"}",
  "buttonTextColor": "${theme.buttonTextColor ?? "#ffffff"}"
}`,
        },
      ];
    }

    return [
      {
        id: "theme-config",
        name: "Theme Configuration",

        status: "PASS",
        severity: "LOW",

        message: "Theme configuration is valid.",

        file: "/src/lib/governance/scanners/themeScanner.ts",
        line: 75,
      },
    ];
  } catch (error) {
    console.error("Theme Scanner Error:", error);

    return [
      {
        id: "theme-config",
        name: "Theme Configuration",

        status: "FAIL",
        severity: "HIGH",

        message: "Unable to validate theme configuration.",

        file: "/src/lib/governance/scanners/themeScanner.ts",
        line: 90,

        autoFix: true,

        patchId: "theme-connection-fix",

        suggestion:
          "Verify Firestore connection and recreate the theme configuration.",

        currentCode:
          "// Theme validation failed.",

        fixedCode: `{
  "primaryColor": "#2563eb",
  "secondaryColor": "#0f172a",
  "backgroundColor": "#ffffff",
  "cardColor": "#ffffff",
  "textColor": "#111827",
  "borderColor": "#e5e7eb",
  "buttonColor": "#2563eb",
  "buttonTextColor": "#ffffff"
}`,
      },
    ];
  }
}
