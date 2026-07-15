import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import type { ScanResult } from "../runSystemScan";

export async function walletScanner(): Promise<ScanResult[]> {
  const results: ScanResult[] = [];

  try {
    // Wallet Configuration
    const walletDoc = await getDoc(doc(db, "settings", "wallet"));

    if (!walletDoc.exists()) {
      results.push({
        id: "wallet-config",
        name: "Wallet Configuration",
        status: "FAIL",
        message: "Wallet configuration document not found.",
        severity: "HIGH",
      });

      return results;
    }

    const wallet = walletDoc.data();

    // Commission Wallet
    results.push({
      id: "commission-wallet",
      name: "Commission Wallet",
      status: wallet.commissionWalletEnabled ? "PASS" : "WARNING",
      message: wallet.commissionWalletEnabled
        ? "Commission wallet is enabled."
        : "Commission wallet is disabled.",
      severity: wallet.commissionWalletEnabled ? "LOW" : "MEDIUM",
    });

    // Cashback Wallet
    results.push({
      id: "cashback-wallet",
      name: "Cashback Wallet",
      status: wallet.cashbackWalletEnabled ? "PASS" : "WARNING",
      message: wallet.cashbackWalletEnabled
        ? "Cashback wallet is enabled."
        : "Cashback wallet is disabled.",
      severity: wallet.cashbackWalletEnabled ? "LOW" : "MEDIUM",
    });

    // Reward Wallet
    results.push({
      id: "reward-wallet",
      name: "Reward Wallet",
      status: wallet.rewardWalletEnabled ? "PASS" : "WARNING",
      message: wallet.rewardWalletEnabled
        ? "Reward wallet is enabled."
        : "Reward wallet is disabled.",
      severity: wallet.rewardWalletEnabled ? "LOW" : "MEDIUM",
    });

    // Withdrawals
    results.push({
      id: "withdraw-module",
      name: "Withdrawal Module",
      status: wallet.withdrawEnabled ? "PASS" : "WARNING",
      message: wallet.withdrawEnabled
        ? "Withdrawal module is active."
        : "Withdrawal module is disabled.",
      severity: wallet.withdrawEnabled ? "LOW" : "MEDIUM",
    });

    // Minimum Withdrawal
    results.push({
      id: "min-withdraw",
      name: "Minimum Withdrawal",
      status: wallet.minimumWithdrawal > 0 ? "PASS" : "FAIL",
      message:
        wallet.minimumWithdrawal > 0
          ? `Minimum withdrawal ₹${wallet.minimumWithdrawal}`
          : "Minimum withdrawal amount is invalid.",
      severity:
        wallet.minimumWithdrawal > 0 ? "LOW" : "HIGH",
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
      },
    ];
  }
}
