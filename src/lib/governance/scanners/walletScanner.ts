import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import type { ScanResult } from "../runSystemScan";

export async function walletScanner(): Promise<ScanResult[]> {
  const results: ScanResult[] = [];

  try {
    const walletDoc = await getDoc(doc(db, "settings", "wallet"));

    if (!walletDoc.exists()) {
      return [
        {
          id: "wallet-config",
          name: "Wallet Configuration",
          status: "FAIL",
          message: "Wallet configuration document not found.",
          severity: "HIGH",
          file: "/src/lib/governance/scanners/walletScanner.ts",
        },
      ];
    }

    const wallet = walletDoc.data();

    const commissionWalletEnabled =
      wallet.commissionWalletEnabled ?? false;

    const cashbackWalletEnabled =
      wallet.cashbackWalletEnabled ?? false;

    const rewardWalletEnabled =
      wallet.rewardWalletEnabled ?? false;

    const withdrawEnabled =
      wallet.withdrawEnabled ?? false;

    const minimumWithdrawal =
      wallet.minimumWithdrawal ??
      wallet.minWithdraw ??
      0;

    // Commission Wallet
    results.push({
      id: "commission-wallet",
      name: "Commission Wallet",
      status: commissionWalletEnabled ? "PASS" : "WARNING",
      message: commissionWalletEnabled
        ? "Commission wallet is enabled."
        : "Commission wallet is disabled.",
      severity: commissionWalletEnabled ? "LOW" : "MEDIUM",
      file: "/src/lib/governance/scanners/walletScanner.ts",
    });

    // Cashback Wallet
    results.push({
      id: "cashback-wallet",
      name: "Cashback Wallet",
      status: cashbackWalletEnabled ? "PASS" : "WARNING",
      message: cashbackWalletEnabled
        ? "Cashback wallet is enabled."
        : "Cashback wallet is disabled.",
      severity: cashbackWalletEnabled ? "LOW" : "MEDIUM",
      file: "/src/lib/governance/scanners/walletScanner.ts",
    });

    // Reward Wallet
    results.push({
      id: "reward-wallet",
      name: "Reward Wallet",
      status: rewardWalletEnabled ? "PASS" : "WARNING",
      message: rewardWalletEnabled
        ? "Reward wallet is enabled."
        : "Reward wallet is disabled.",
      severity: rewardWalletEnabled ? "LOW" : "MEDIUM",
      file: "/src/lib/governance/scanners/walletScanner.ts",
    });

    // Withdrawal Module
    results.push({
      id: "withdraw-module",
      name: "Withdrawal Module",
      status: withdrawEnabled ? "PASS" : "WARNING",
      message: withdrawEnabled
        ? "Withdrawal module is active."
        : "Withdrawal module is disabled.",
      severity: withdrawEnabled ? "LOW" : "MEDIUM",
      file: "/src/lib/governance/scanners/walletScanner.ts",
    });

    // Minimum Withdrawal
    results.push({
      id: "min-withdraw",
      name: "Minimum Withdrawal",
      status: minimumWithdrawal > 0 ? "PASS" : "FAIL",
      message:
        minimumWithdrawal > 0
          ? `Minimum withdrawal ₹${minimumWithdrawal}`
          : "Minimum withdrawal amount is invalid.",
      severity: minimumWithdrawal > 0 ? "LOW" : "HIGH",
      file: "/src/lib/governance/scanners/walletScanner.ts",
    });

    return results;
  } catch (error) {
    console.error("Wallet Scanner Error:", error);

    return [
      {
        id: "wallet",
        name: "Wallet Scanner",
        status: "FAIL",
        message: "Unable to verify wallet configuration.",
        severity: "HIGH",
        file: "/src/lib/governance/scanners/walletScanner.ts",
      },
    ];
  }
}
