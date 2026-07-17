import type { ScanResult } from "../runSystemScan";

export async function hardcodedRuleScanner(): Promise<ScanResult[]> {
  try {
    const response = await fetch("/api/governance/hardcoded", {
      cache: "no-store",
    });

    if (!response.ok) {
      return [
        {
          id: "hardcoded-api-error",
          name: "Hardcoded Rule Scanner",
          status: "FAIL",
          severity: "HIGH",
          message: "Unable to load hardcoded scanner report.",
          autoFix: false,
        },
      ];
    }

    const data = await response.json();

    if (!data.success) {
      return [
        {
          id: "hardcoded-report-error",
          name: "Hardcoded Rule Scanner",
          status: "FAIL",
          severity: "HIGH",
          message: data.message ?? "Hardcoded scanner failed.",
          autoFix: false,
        },
      ];
    }

    if (!data.results || data.results.length === 0) {
      return [
        {
          id: "hardcoded-clean",
          name: "Hardcoded Rule Scanner",
          status: "PASS",
          severity: "LOW",
          message: "No hardcoded business rules detected.",
        },
      ];
    }

    return data.results as ScanResult[];
  } catch (error) {
    console.error("Hardcoded Rule Scanner Error:", error);

    return [
      {
        id: "hardcoded-exception",
        name: "Hardcoded Rule Scanner",
        status: "FAIL",
        severity: "HIGH",
        message: "Scanner crashed while loading report.",
        autoFix: false,
      },
    ];
  }
}
