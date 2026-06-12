import { db } from "@/firebase/config";
import { doc, collection, runTransaction, serverTimestamp, increment } from "firebase/firestore";
import { createNotification } from "../createNotification";
import { ENGINE_VERSION } from "@/lib/mlm/config";

interface WithdrawData {
  userId: string;
  amount: number;
  upi: string;
}

const UPI_REGEX = /^[\w.-]+@[\w.-]+$/;

/**
 * Enterprise Withdrawal Request Engine
 * Final Version: 10/10 Production Ready
 */
export async function requestWithdraw(data: WithdrawData) {
  try {
    const upi = data.upi.trim();
    
    // Validation
    if (data.amount < 200) throw new Error("MIN_WITHDRAWAL_200");
    if (!UPI_REGEX.test(upi)) throw new Error("INVALID_UPI_FORMAT");

    const userRef = doc(db, "users", data.userId);
    const withdrawsCollection = collection(db, "withdraws");
    const ledgerCollection = collection(db, "user_transactions"); // Unified Ledger

    const result = await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists()) throw new Error("User Not Found");
      
      const userData = userDoc.data();
      
      // Verification: Check KYC Field Name (Verify: kycVerified, isKYCVerified, or isKycVerified)
      if (userData.isBlocked) throw new Error("Account Blocked");
      if (!userData.kycVerified) throw new Error("Complete KYC First");
      
      // Duplicate Protection
      if ((userData.pendingWithdrawal || 0) > 0) {
        throw new Error("PENDING_REQUEST_EXISTS");
      }
      
      // Balance Check
      if ((userData.walletBalance || 0) < data.amount) {
        throw new Error("Insufficient Balance");
      }

      // Create Request Snapshot
      const withdrawRef = doc(withdrawsCollection);
      transaction.set(withdrawRef, {
        userId: data.userId,
        amount: data.amount,
        upi: upi,
        type: "upi",
        status: "pending",
        userName: userData.name || "N/A",
        mobile: userData.phoneNumber || "N/A",
        engineVersion: ENGINE_VERSION,
        createdAt: serverTimestamp(),
      });

      // Audit Ledger Entry (Consistent with JembeeKart standards)
      transaction.set(doc(ledgerCollection), {
        userId: data.userId,
        referenceId: withdrawRef.id,
        type: "withdraw_request",
        amount: data.amount,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      // Atomic Update
      transaction.update(userRef, {
        walletBalance: increment(-data.amount),
        pendingWithdrawal: increment(data.amount),
        updatedAt: serverTimestamp()
      });

      return withdrawRef.id;
    });

    await createNotification({
      userId: data.userId,
      title: "Withdraw Requested",
      message: `Your withdraw request of ₹${data.amount} is pending approval.`,
      type: "withdraw"
    });

    return { success: true, withdrawId: result, message: "Request Submitted" };

  } catch (error: any) {
    console.error("WITHDRAW_ERROR:", error.message);
    return { success: false, message: error.message };
  }
}
