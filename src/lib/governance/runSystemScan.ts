import { themeScanner } from "./scanners/themeScanner";
import { firestoreScanner } from "./scanners/firestoreScanner";
import { featureFlagScanner } from "./scanners/featureFlagScanner";
import { securityScanner } from "./scanners/securityScanner";
import { walletScanner } from "./scanners/walletScanner";
import { deploymentScanner } from "./scanners/deploymentScanner";
import { adminControlScanner } from "./scanners/adminControlScanner";

export type ScanStatus = "PASS" | "WARNING" | "FAIL";

export type ScanSeverity = "LOW" | "MEDIUM" | "HIGH";

export type ScanResult = {
  id: string;
  name: string;
  status: ScanStatus;
  message: string;
  severity?: ScanSeverity;
};

export async function runSystemScan(): Promise<ScanResult[]> {
  const scannerJobs = [
    {
      id: "theme",
      name: "Theme Scanner",
      run: themeScanner,
    },
    {
      id: "firestore",
      name: "Firestore Scanner",
      run: firestoreScanner,
    },
    {
      id: "feature-flags",
      name: "Feature Flag Scanner",
      run: featureFlagScanner,
    },
    {
      id: "security",
      name: "Security Scanner",
      run: securityScanner,
    },
    {
      id: "wallet",
      name: "Wallet Scanner",
      run: walletScanner,
    },
    {
      id: "deployment",
      name: "Deployment Scanner",
      run: deploymentScanner,
    },
    {
      id: "admin-control",
      name: "Admin Control Scanner",
      run: adminControlScanner,
    },
  ];

  const settled = await Promise.allSettled(
    scannerJobs.map((scanner) => scanner.run())
  );

  const results: ScanResult[] = [];

  settled.forEach((result, index) => {
    const scanner = scannerJobs[index];

    if (result.status === "fulfilled") {
      results.push(...result.value);
    } else {
      console.error(`${scanner.name} failed`, result.reason);

      results.push({
        id: scanner.id,
        name: scanner.name,
        status: "FAIL",
        severity: "HIGH",
        message: "Scanner execution failed.",
      });
    }
  });

  return results;
}
