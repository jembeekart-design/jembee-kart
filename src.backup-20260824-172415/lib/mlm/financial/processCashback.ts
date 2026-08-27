import { db } from "@/firebase/config";
import { doc, runTransaction, serverTimestamp, increment } from "firebase/firestore";

/**
 * Enterprise-Grade Cashback Processor
 * Uses Firestore Atomic Transactions & Increments for 100% Data Integrity
 */
export async function processCashback(userId: string, amount: number) {
  try {
    if (amount <= 0) {
      return { success: true, message: "No amount to process" };
    }

    const userRef = doc(db, "users", userId);

    // Atomic Transaction ensures total consistency
    await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userRef);
      
      if (!userDoc.exists()) {
        throw new Error("User document does not exist!");
      }

      // Using increment() for atomic, scalable updates
      transaction.update(userRef, {
        walletBalance: increment(amount),
        cashbackWallet: increment(amount),
        updatedAt: serverTimestamp()
      });
    });

    console.log(`✅ Enterprise Cashback processed for ${userId}: ${amount}`);
    return { success: true };

  } catch (error: any) {
    console.error("❌ Critical Failure in Cashback Transaction:", error.message);
    return { success: false, error: error.message };
  }
}
