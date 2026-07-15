import type { ScanResult } from "../runSystemScan";
import { DEFAULT_ADMIN_CONFIG } from "@/lib/admin-config/defaults";

export async function themeScanner(): Promise<ScanResult[]> {
  try {
    const theme = DEFAULT_ADMIN_CONFIG.theme;

    if (!theme) {
      return [
        {
          id: "theme-config",
          name: "Theme Configuration",
          status: "FAIL",
          message: "Theme configuration not found.",
          severity: "HIGH",
        },
      ];
    }

    const requiredFields = [
      "primaryColor",
      "secondaryColor",
      "backgroundColor",
      "cardColor",
      "textColor",
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
          message: `Missing theme fields: ${missingFields.join(", ")}`,
          severity: "MEDIUM",
        },
      ];
    }

    return [
      {
        id: "theme-config",
        name: "Theme Configuration",
        status: "PASS",
        message: "Theme configuration loaded successfully.",
        severity: "LOW",
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
      },
    ];
  }
}
