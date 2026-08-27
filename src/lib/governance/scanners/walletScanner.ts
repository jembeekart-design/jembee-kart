import { walletConfigService } from "@/jembee-governance/services/walletConfigService";
import type { ScanResult } from "../runSystemScan";

export async function walletScanner(): Promise<ScanResult[]> {
  try {
    const valid = await walletConfigService.validate();

    if (!valid) {
      return [
        {
          id: "wallet-config",
          name: "Wallet Configuration",
          status: "FAIL",
          severity: "HIGH",
          message: "Centralized wallet configuration is invalid.",
          file: "/src/firestore/businessRules/loader.ts",
          line: 140,
        },
      ];
    }

    const config =
      await walletConfigService.getScannerConfig();

    return [
      {
        id: "wallet-pass",
        name: "Wallet Configuration",
        status: "PASS",
        severity: "LOW",
        message:
          `Centralized wallet configuration is valid. Minimum withdrawal: ${config.minimumWithdrawal}.`,
        file: "/src/jembee-governance/services/walletConfigService.ts",
        line: 20,
      },
    ];
  } catch (error) {
    console.error("Wallet Scanner Error:", error);

    return [
      {
        id: "wallet-error",
        name: "Wallet Scanner",
        status: "FAIL",
        severity: "HIGH",
        message:
          "Unable to validate centralized wallet configuration.",
        file: "/src/jembee-governance/services/walletConfigService.ts",
        line: 1,
      },
    ];
  }
}
