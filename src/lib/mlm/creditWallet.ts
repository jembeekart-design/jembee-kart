import {
  doc,
  increment,
  serverTimestamp,
  runTransaction
} from "firebase/firestore";

import { db } from "@/firebase/config";
import { createNotification } from "./createNotification";

interface CreditWalletData {
  uid: string;
  amount: number;
  incomeType:
    | "cashback"
    | "directIncome"
    | "levelIncome"
    | "rankIncome"
    | "watchReward"
    | "creatorIncome"; // Future Creator Economy Support
  transactionId?: string; 
}

export async function creditWallet(data: CreditWalletData) {
  try {
    /* =========================
       VALIDATION
    ========================= */

    if (!data.uid?.trim()) {
      return { success: false, message: "User ID Required" };
    }

    if (!data.amount || data.amount <= 0) {
      return { success: false, message: "Invalid Amount" };
    }

    const userRef = doc(db, "users", data.uid);
    
    /* =========================
       HIGH-CONCURRENCY TRANSACTION ID FALLBACK
    ========================= */
    let fallbackId: string;
    try {
      fallbackId = crypto.randomUUID();
    } catch {
      fallbackId = `${data.uid}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    }

    const uniqueTxId = data.transactionId?.trim() || fallbackId;
    
    // 1. User Subcollection Reference
    const txRef = doc(db, "users", data.uid, "walletTransactions", uniqueTxId);
    
    // 2. Global Collection Reference for Admin Reports
    const globalIncomeRef = doc(db, "incomeHistory", uniqueTxId);

    /* =========================
       FIRESTORE TRANSACTION BLOCK
    ========================= */
    
    const transactionResult = await runTransaction(db, async (transaction) => {
      const userSnap = await transaction.get(userRef);
      if (!userSnap.exists()) {
        throw new Error("User Not Found");
      }

      // DOUBLE-GUARD DUPLICATE CHECK (Subcollection + Global Collection)
      const txSnap = await transaction.get(txRef);
      const globalSnap = await transaction.get(globalIncomeRef);

      if (txSnap.exists() || globalSnap.exists()) {
        throw new Error("Transaction already processed");
      }

      // Base aggregation payload (removed untracked todayIncome to keep data pure)
      const updateData: Record<string, any> = {
        totalIncome: increment(data.amount),
        updatedAt: serverTimestamp()
      };

      let walletType = "walletBalance";
      let title = "Income Credited";

      if (data.incomeType === "cashback") {
        updateData.cashbackWallet = increment(data.amount);
        updateData.walletBalance = increment(data.amount); // General ledger update
        walletType = "cashbackWallet";
        title = "Cashback Credited";
      } else if (data.incomeType === "directIncome") {
        updateData.commissionWallet = increment(data.amount);
        updateData.walletBalance = increment(data.amount);
        walletType = "commissionWallet";
        title = "Direct Income Credited";
      } else if (data.incomeType === "levelIncome") {
        updateData.commissionWallet = increment(data.amount);
        updateData.walletBalance = increment(data.amount);
        walletType = "commissionWallet";
        title = "Level Income Credited";
      } else if (data.incomeType === "rankIncome") {
        updateData.rewardWallet = increment(data.amount);
        updateData.walletBalance = increment(data.amount);
        updateData.withdrawableWallet = increment(data.amount); // Master script unlock alignment
        walletType = "rewardWallet";
        title = "Rank Reward Credited";
      } else if (data.incomeType === "watchReward") {
        updateData.rewardWallet = increment(data.amount);
        updateData.walletBalance = increment(data.amount);
        updateData.totalUnlockedReward = increment(data.amount);
        updateData.withdrawableWallet = increment(data.amount); // Master script unlock alignment
        walletType = "rewardWallet";
        title = "Watch Reward Credited";
      } else if (data.incomeType === "creatorIncome") {
        updateData.creatorAdIncome = increment(data.amount); // Master script schema alignment
        updateData.walletBalance = increment(data.amount);
        updateData.withdrawableWallet = increment(data.amount); // Future-ready withdrawal setup
        walletType = "creatorAdIncome";
        title = "Creator Income Credited";
      }

      // Payload optimization for history logging
      const transactionPayload = {
        transactionId: uniqueTxId,
        userId: data.uid,
        title,
        amount: data.amount,
        type: data.incomeType,
        status: "success",
        walletType,
        createdAt: serverTimestamp()
      };

      // Atomic Mutations
      transaction.update(userRef, updateData);
      transaction.set(txRef, transactionPayload);
      transaction.set(globalIncomeRef, transactionPayload); // Global log entry for cross-user admin querying

      return { title };
    });

    /* =========================
       POST-TRANSACTION ACTIONS (Isolated Notification Engine)
    ========================= */

    try {
      let notificationType: "commission" | "reward";

      if (
        data.incomeType === "directIncome" || 
        data.incomeType === "levelIncome"
      ) {
        notificationType = "commission";
      } else {
        notificationType = "reward"; 
      }

      await createNotification({
        userId: data.uid,
        title: transactionResult.title,
        message: `₹${data.amount} credited successfully.`,
        type: notificationType
      });
    } catch (notificationError) {
      console.error("Non-blocking Notification Error:", notificationError);
    }

    return { success: true };

  } catch (error: any) {
    console.error("creditWallet Fatal Error:", error);
    
    if (
      error.message === "User Not Found" || 
      error.message === "Transaction already processed"
    ) {
      return { success: false, message: error.message };
    }

    return { success: false, message: "Wallet credit failed" };
  }
}
