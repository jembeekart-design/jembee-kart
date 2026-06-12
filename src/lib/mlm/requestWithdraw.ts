import { db } from "@/firebase/config";
import { doc, collection, runTransaction, serverTimestamp, increment } from "firebase/firestore";
import { createNotification } from "./createNotification";

interface WithdrawData {
  userId: string;
  amount: number;
  upi: string;
}

const UPI_REGEX = /^[\w.-]+@[\w.-]+$/;
const ENGINE_VERSION = "3.0.0";

export async function requestWithdraw(data: WithdrawData) {
  try {
    // Validation
    if (data.amount < 200) throw new Error("MIN_WITHDRAWAL_200");
    if (!UPI_REGEX.test(data.upi)) throw new Error("INVALID_UPI_FORMAT");

    const userRef = doc(db, "users", data.userId);
    const withdrawsCollection = collection(db, "withdraws");

    const result = await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists()) throw new Error("User Not Found");
      
      const userData = userDoc.data();
      
      // Verification: Check schema for field 'isKYCVerified' 
      // (Ensure this matches your actual Firestore field!)
      if (userData.isBlocked) throw new Error("Account Blocked");
      if (!userData.isKYCVerified) throw new Error("Complete KYC First");
      
      // Duplicate Protection
      if ((userData.pendingWithdrawal || 0) > 0) {
        throw new Error("PENDING_REQUEST_EXISTS");
      }
      
      // Balance Check
      if ((userData.walletBalance || 0) < data.amount) {
        throw new Error("Insufficient Balance");
      }

      // Create Request with Snapshot Data (For Audit)
      const withdrawRef = doc(withdrawsCollection);
      transaction.set(withdrawRef, {
        userId: data.userId,
        amount: data.amount,
        upi: data.upi.trim(),
        type: "upi",
        status: "pending",
        userName: userData.name || "N/A",
        mobile: userData.phoneNumber || "N/A",
        engineVersion: ENGINE_VERSION,
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
