import {
  doc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp
} from "firebase/firestore";

import { db } from "@/firebase/config";
import { creditWallet } from "./creditWallet";

// ✅ 1. Replaced Interface Matrix with orderId Hook Tracking
interface DistributeLevelCommissionData {
  userId: string;
  amount: number;
  orderId: string;
}

export async function distributeLevelCommission(
  data: DistributeLevelCommissionData
) {
  try {
    /* ======================================================
       TARGET ACTION NODE ROOT USER IDENTIFICATION
    ====================================================== */
    const userRef = doc(db, "users", data.userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return { success: false };
    }

    const userData = userSnap.data();
    const sponsorId = userData.sponsorId;

    /* ======================================================
       LEVEL 1 DISTRIBUTION ENGINE BLOCK (Direct Income)
    ====================================================== */
    if (sponsorId) {
      // Lifted Level 1 Verification Layer ahead of distribution execution path
      const level1UserRef = doc(db, "users", sponsorId);
      const level1UserSnap = await getDoc(level1UserRef);

      if (!level1UserSnap.exists()) {
        return { success: false };
      }

      // ✅ 3. Level 1 Security validation checks before executing payout loops
      if (
        !level1UserSnap.data()?.mlmActive ||
        !level1UserSnap.data()?.joinedPackage
      ) {
        return { success: true }; // Short circuit without execution, gracefully exiting
      }

      const level1Commission = Math.floor(data.amount * 0.10);

      // Execute actual account balance top-up
      await creditWallet({
        uid: sponsorId,
        amount: level1Commission,
        incomeType: "directIncome"
      });

      // ✅ 6. Level 1 Audit Ledger Logger Tracking Integration
      await addDoc(collection(db, "commissionLogs"), {
        userId: sponsorId,
        fromUserId: data.userId,
        orderId: data.orderId,
        level: 1,
        amount: level1Commission,
        incomeType: "directIncome",
        createdAt: serverTimestamp()
      });

      /* ======================================================
         LEVEL 2 DISTRIBUTION ENGINE BLOCK (Level Income)
      ====================================================== */
      const level1Data = level1UserSnap.data();
      const level2SponsorId = level1Data.sponsorId;

      if (level2SponsorId) {
        const level2UserRef = doc(db, "users", level2SponsorId);
        const level2UserSnap = await getDoc(level2UserRef);

        if (level2UserSnap.exists()) {
          // ✅ 4. Level 2 Security validation checks before executing payout loops
          if (
            !level2UserSnap.data()?.mlmActive ||
            !level2UserSnap.data()?.joinedPackage
          ) {
            return { success: true };
          }

          const level2Commission = Math.floor(data.amount * 0.05);

          // Execute actual account balance top-up
          await creditWallet({
            uid: level2SponsorId,
            amount: level2Commission,
            incomeType: "levelIncome"
          });

          // ✅ 6. Level 2 Audit Ledger Logger Tracking Integration
          await addDoc(collection(db, "commissionLogs"), {
            userId: level2SponsorId,
            fromUserId: data.userId,
            orderId: data.orderId,
            level: 2,
            amount: level2Commission,
            incomeType: "levelIncome",
            createdAt: serverTimestamp()
          });

          /* ======================================================
             LEVEL 3 DISTRIBUTION ENGINE BLOCK (Level Income)
          ====================================================== */
          const level2Data = level2UserSnap.data();
          const level3SponsorId = level2Data.sponsorId;

          if (level3SponsorId) {
            const level3UserRef = doc(db, "users", level3SponsorId);
            const level3UserSnap = await getDoc(level3UserRef);

            if (level3UserSnap.exists()) {
              // ✅ 5. Level 3 Security validation checks before executing payout loops
              if (
                !level3UserSnap.data()?.mlmActive ||
                !level3UserSnap.data()?.joinedPackage
              ) {
                return { success: true };
              }

              const level3Commission = Math.floor(data.amount * 0.02);

              // Execute actual account balance top-up
              await creditWallet({
                uid: level3SponsorId,
                amount: level3Commission,
                incomeType: "levelIncome"
              });

              // ✅ 6. Level 3 Audit Ledger Logger Tracking Integration
              await addDoc(collection(db, "commissionLogs"), {
                userId: level3SponsorId,
                fromUserId: data.userId,
                orderId: data.orderId,
                level: 3,
                amount: level3Commission,
                incomeType: "levelIncome",
                createdAt: serverTimestamp()
              });
            }
          }
        }
      }
    }

    return { success: true };

  } catch (error) {
    console.error("Critical engine disruption inside distributeLevelCommission pipeline:", error);
    return { success: false };
  }
}
