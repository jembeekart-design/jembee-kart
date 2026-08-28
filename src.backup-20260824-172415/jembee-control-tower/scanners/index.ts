export interface ControlTowerIssue {
  id: string;
  category: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  title: string;
  file: string;
  line?: number;
  message: string;
  fix?: string;
}

export interface ControlTowerScanner {
  name: string;
  scan(): Promise<ControlTowerIssue[]>;
}

export async function runAllScanners(): Promise<ControlTowerIssue[]> {
  const issues: ControlTowerIssue[] = [];

  // Next Step:
  // ThemeScanner
  // SecurityScanner
  // FirestoreScanner
  // WalletScanner
  // NavigationScanner
  // MLMScanner

  return issues;
}
