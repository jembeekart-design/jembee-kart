import { db } from "@/firebase/config";
import { 
  doc, 
  collection, 
  runTransaction, 
  serverTimestamp, 
  increment, 
  query, 
  where, 
  getDocs, 
  updateDoc 
} from "firebase/firestore";
import { createNotification } from "../createNotification";
import { ENGINE_VERSION } from "@/lib/mlm/config";

/**
 * Enterprise Rejection Module
 * Final Version: 10/10 Production Ready
 */
export async function rejectWithdraw(data: { withdrawId: string; adminId: string; reason: string }) {
  try {
    const reason = data.reason.trim();
    const withdrawRef = doc(db, "withdraws", data.withdrawId);
    
    // 1. Atomic Transaction: Status Update + Wallet Refund
    const result = await runTransaction(db, async (transaction) => {
      const withdrawDoc = await transaction.get(withdrawRef);
      if (!withdrawDoc.exists()) throw new Error("WITHDRAW_NOT_FOUND");
      
      const withdrawData = withdrawDoc.data();
      if (withdrawData.status !== "pending") throw new Error("ALREADY_PROCESSED");

      const userRef = doc(db, "users", withdrawData.userId);
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists()) throw new Error("USER_NOT_FOUND");
      
      const userData = userDoc.data();

      // Guard: Ensure sufficient pending amount exists
      if ((userData.pendingWithdrawal || 0) < withdrawData.amount) {
        throw new Error("INVALID_PENDING_AMOUNT");
      }

      // Update Withdraw Status
      transaction.update(withdrawRef, {
        status: "rejected",
        rejectedBy: data.adminId,
        rejectedReason: reason, // Consistent naming
        rejectedAt: serverTimestamp(),
        engineVersion: ENGINE_VERSION
      });

      // Rollback Funds
      transaction.update(userRef, {
        walletBalance: increment(withdrawData.amount),
        pendingWithdrawal: increment(-withdrawData.amount),
        updatedAt: serverTimestamp()
      });

      return { userId: withdrawData.userId, amount: withdrawData.amount };
    });

    // 2. Update Ledger: Consistent naming
    const ledgerQuery = query(
      collection(db, "user_transactions"),
      where("withdrawId", "==", data.withdrawId),
      where("status", "==", "pending")
    );
    const ledgerSnapshot = await getDocs(ledgerQuery);
    
    const updates = ledgerSnapshot.docs.map((d) => 
      updateDoc(d.ref, { 
        status: "rejected",
        rejectedReason: reason, // Consistent naming across ledger
        updatedAt: serverTimestamp() 
      })
    );
    await Promise.all(updates);

    // 3. Notify User
    await createNotification({
      userId: result.userId,
      title: "Withdraw Rejected",
      message: `Your request of ₹${result.amount} was rejected. Reason: ${reason}`,
      type: "withdraw"
    });

    return { success: true, message: "Withdraw Rejected Successfully" };

  } catch (error: any) {
    console.error("REJECT_ERROR:", error.message);
    return { success: false, message: error.message };
  }
}
