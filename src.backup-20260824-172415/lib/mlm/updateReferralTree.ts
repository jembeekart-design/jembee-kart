import { doc, runTransaction, serverTimestamp, increment } from "firebase/firestore";
import { db } from "@/firebase/config";
import { MLM_CONFIG } from "@/lib/mlm/config";

/**
 * Enterprise Referral Engine v3.0
 * Optimized for scalability using 'users' collection as Single Source of Truth.
 */
export async function updateReferralTree(sponsorId: string, newUserId: string) {
  // 1. Mandatory Input Validation
  if (!sponsorId?.trim() || !newUserId?.trim()) {
    throw new Error("INVALID_REFERRAL_DATA: IDs required");
  }
  if (sponsorId === newUserId) {
    throw new Error("INVALID_REFERRAL_RELATIONSHIP: Self-referral forbidden");
  }

  try {
    return await runTransaction(db, async (transaction) => {
      let currentSponsorId = sponsorId;
      let level = 1;
      const MAX_LEVELS = MLM_CONFIG.maxReferralLevels ?? 4;

      while (currentSponsorId && level <= MAX_LEVELS) {
        const userRef = doc(db, "users", currentSponsorId);
        const userSnap = await transaction.get(userRef);

        if (!userSnap.exists()) break; // If sponsor doc missing, stop traversal

        // 2. Atomic Update (Single Source of Truth)
        transaction.update(userRef, {
          teamSize: increment(1),
          totalReferrals: increment(1),
          ...(level === 1 ? { directReferrals: increment(1) } : {}),
          [`level${level}Count`]: increment(1),
          updatedAt: serverTimestamp(),
        });

        // 3. Traverse Upward
        currentSponsorId = userSnap.data().sponsorId;
        level++;
      }

      return { success: true };
    });
  } catch (error: any) {
    console.error("REFERRAL_ENGINE_V3_FAILED:", error.message);
    throw new Error(`REFERRAL_UPDATE_FAILED: ${error.message}`);
  }
}
