import { doc, runTransaction, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/config";
import { generateReferralCode } from "../generateReferralCode";
import { updateReferralTree } from "../updateReferralTree";

export async function autoJoinMLMOnPurchase(userId: string, sponsorId?: string) {
  try {
    // 1. Transactional Update (Single Source of Truth)
    const result = await runTransaction(db, async (transaction) => {
      const userRef = doc(db, "users", userId);
      const mlmUserRef = doc(db, "mlmUsers", userId);
      
      const userSnap = await transaction.get(userRef);
      if (!userSnap.exists() || userSnap.data().mlmJoined) {
        throw new Error("USER_NOT_ELIGIBLE_OR_ALREADY_JOINED");
      }

      const referralCode = generateReferralCode(userId);

      // Atomic Update with fully initialized schema
      transaction.update(userRef, {
        mlmJoined: true,
        referralCode,
        sponsorId: sponsorId || null,
        mlmJoinedAt: serverTimestamp(),
        currentRankId: "Starter",
        totalIncome: 0,
        todayIncome: 0,
        walletBalance: 0,
        pendingWithdrawal: 0,
        commissionWallet: 0,
        rewardWallet: 0,
        cashbackWallet: 0,
        isActive: true,
        // Referral Counters Initialized
        totalReferrals: 0,
        directReferrals: 0,
        teamSize: 0,
        teamBusiness: 0,
        level1Count: 0,
        level2Count: 0,
        level3Count: 0,
        level4Count: 0,
        updatedAt: serverTimestamp()
      });

      transaction.set(mlmUserRef, {
        userId,
        sponsorId: sponsorId || null,
        referralCode,
        isActive: true,
        joinedFrom: "product-purchase",
        createdAt: serverTimestamp()
      });

      return { success: true };
    });

    // 2. Tree Update (Outside Transaction - Safe & Decoupled)
    // Verification: Sponsor exists and is not the user themselves
    if (result.success && sponsorId && sponsorId !== userId) {
      await updateReferralTree(sponsorId, userId);
    }

    return { success: true };
  } catch (error: any) {
    console.error("MLM_JOIN_ERROR:", error.message);
    return { success: false, message: error.message };
  }
}
