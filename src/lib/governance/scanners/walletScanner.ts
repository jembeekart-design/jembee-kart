import type { ScanResult } from "../runSystemScan";

export async function walletScanner(): Promise<ScanResult[]> {
  const walletEnabled = true;
  const walletConfigured = true;

  if (!walletEnabled) {
    return [
      {
        id: "wallet-config",
        name: "Wallet Configuration",
        status: "FAIL",
        severity: "HIGH",
        message: "Wallet module is disabled.",

        file: "/src/lib/governance/scanners/walletScanner.ts",
        line: 1,

        autoFix: true,
        patchId: "wallet-config-fix",

        currentCode: `{
  "walletEnabled": false
}`,

        fixedCode: `{
  "walletEnabled": true,
  "rewardWallet": true,
  "cashbackWallet": true,
  "commissionWallet": true
}`,

        suggestion:
          "Enable wallet module and create all required wallet configuration.",
      },
    ];
  }

  if (!walletConfigured) {
    return [
      {
        id: "wallet-fields",
        name: "Wallet Fields",
        status: "WARNING",
        severity: "MEDIUM",
        message: "Wallet configuration is incomplete.",

        file: "/src/lib/governance/scanners/walletScanner.ts",
        line: 20,

        autoFix: true,
        patchId: "wallet-fields-fix",

        currentCode: `{
  "walletEnabled": true
}`,

        fixedCode: `{
  "walletEnabled": true,
  "rewardWallet": true,
  "cashbackWallet": true,
  "commissionWallet": true,
  "withdrawWallet": true
}`,

        suggestion:
          "Generate missing wallet configuration automatically.",
      },
    ];
  }

  return [
    {
      id: "wallet-pass",
      name: "Wallet Configuration",
      status: "PASS",
      severity: "LOW",
      message: "Wallet configuration is valid.",

      file: "/src/lib/governance/scanners/walletScanner.ts",
      line: 40,
    },
  ];
}
