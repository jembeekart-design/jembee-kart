import {
  runTransaction,
  collection,
  doc,
  increment,
  serverTimestamp
} from "firebase/firestore";

import { db } from "@/firebase/config";

interface CreateDailyPassiveIncomeData {
  userId: string;
  amount: number;
}

export async function createDailyPassiveIncome(
  data: CreateDailyPassiveIncomeData
) {
  try {
    const date = new Date().toISOString().split('T')[0];
    const historyId = `${data.userId}_${date}`;
    const historyRef = doc(db, "dailyPassiveIncomeHistory", historyId);
    const userRef = doc(db, "users", data.userId);

    await runTransaction(db, async (transaction) => {
      const historySnap = await transaction.get(historyRef);
      if (historySnap.exists()) {
        throw new Error("Payout already processed for today.");
      }

      transaction.update(userRef, {
        walletBalance: increment(data.amount),
        totalIncome: increment(data.amount),
        passiveIncome: increment(data.amount)
      });

      transaction.set(historyRef, {
        userId: data.userId,
        amount: data.amount,
        createdAt: serverTimestamp()
      });
    });

    return {
      success: true
    };

  } catch (error) {
    console.error("Passive Income Error:", error);

    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed"
    };
  }
}
