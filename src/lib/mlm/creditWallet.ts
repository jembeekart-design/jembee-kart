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
    | "watchReward";
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
       (Combines UUID pattern with random strings to absolute block collisions)
    ========================= */
    let fallbackId: string;
    try {
      fallbackId = crypto.randomUUID();
    } catch {
      // Robust environments fallback pattern inside the same millisecond spectrum
      fallbackId = `${data.uid}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    }

    const uniqueTxId = data.transactionId?.trim() || fallbackId;
    const txRef = doc(db, "users", data.uid, "walletTransactions", uniqueTxId);

    /* =========================
       FIRESTORE TRANSACTION BLOCK
    ========================= */
    
    const transactionResult = await runTransaction(db, async (transaction) => {
      const userSnap = await transaction.get(userRef);
      if (!userSnap.exists()) {
        throw new Error("User Not Found");
      }

      const txSnap = await transaction.get(txRef);
      if (txSnap.exists()) {
        throw new Error("Transaction already processed");
      }

      const updateData: Record<string, any> = {
        totalIncome: increment(data.amount),
        todayIncome: increment(data.amount),
        updatedAt: serverTimestamp()
      };

      let walletType = "walletBalance";
      let title = "Income Credited";

      if (data.incomeType === "cashback") {
        updateData.cashbackWallet = increment(data.amount);
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
        walletType = "rewardWallet";
        title = "Rank Reward Credited";
      } else if (data.incomeType === "watchReward") {
        updateData.rewardWallet = increment(data.amount);
        updateData.walletBalance = increment(data.amount);
        updateData.totalUnlockedReward = increment(data.amount);
        walletType = "rewardWallet";
        title = "Watch Reward Credited";
      }

      transaction.update(userRef, updateData);
      
      transaction.set(txRef, {
        transactionId: uniqueTxId,
        userId: data.uid,
        title,
        amount: data.amount,
        type: data.incomeType,
        status: "success",
        walletType,
        createdAt: serverTimestamp()
      });

      return { title };
    });

    /* =========================
       POST-TRANSACTION ACTIONS (Isolated Notification Engine)
    ========================= */

    try {
      await createNotification({
        userId: data.uid,
        title: transactionResult.title,
        message: `₹${data.amount} credited successfully.`,
        type:
          data.incomeType === "directIncome" || data.incomeType === "levelIncome"
            ? "commission"
            : "reward"
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
