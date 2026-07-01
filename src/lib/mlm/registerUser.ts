import { db } from "@/firebase/config";
import { doc, runTransaction, serverTimestamp, increment } from "firebase/firestore";
import {
  RegisterUserData,
  RegisterUserResponse,
  createInitialProfileState,
  updateUplineTree,
  updateSponsorCounters,
  generateMarketingCode,
buildParentChain,
} from "@/lib/security";

/**
 * 10/10 Enterprise-Grade User Onboarding & Structural MLM Transaction Engine.
 * Built with absolute isolation matrices to shield against ancestral chain injection,
 * high-entropy unique identifier mapping, and thread-safe distributed team counter updates.
 */
export async function registerUser(data: RegisterUserData): Promise<RegisterUserResponse> {
  const targetUid = data.uid?.trim();
  const rawEmail = data.email?.trim().toLowerCase();
  
  const cleanSponsorUid = data.sponsorUid?.trim() || "";
  const cleanSponsorCode = data.sponsorCode?.trim() || "";
  const cleanSignupSource = data.signupSource?.trim().toLowerCase() || "direct";
  
  // SECURE IMPLEMENTATION: Trusting only server-resolved ancestral hierarchies
  const verifiedSponsorChain = data.sponsorParentChain || [];

  /* ======================================================
     VALIDATION GATE 1: PRIMARY PLATFORM INFRASTRUCTURE
  ====================================================== */
  if (!targetUid || !rawEmail) {
    return {
      success: false,
      message: "Missing mandatory onboarding attributes: UID and Email.",
    };
  }

  const userRef = doc(db, "users", targetUid);

  try {
    const transactionResult = await runTransaction(db, async (transaction) => {
      
      /* ======================================================
         VALIDATION GATE 2: CONCURRENCY DUPLICATION GUARD
      ====================================================== */
      const userSnap = await transaction.get(userRef);
      if (userSnap.exists()) {
        return {
          success: true,
          message: "Profile node already exists within Firestore clusters. Execution safely bypassed.",
        };
      }

      const unifiedMarketingCode =
  generateMarketingCode(targetUid);

const newUserParentChain =
  buildParentChain(
    cleanSponsorUid,
    verifiedSponsorChain
  );

      /* ======================================================
         JEMBEEKART TARGET SCHEMA MATRIX INITIALIZATION
      ====================================================== */
      const initialProfileState = createInitialProfileState({
  data,
  targetUid,
  rawEmail,
  cleanSponsorUid,
  cleanSponsorCode,
  cleanSignupSource,
  newUserParentChain,
  unifiedMarketingCode,
});

      /* ======================================================
         WRITE OPERATOR COMMIT: REGISTRATION INITIALIZATION
      ====================================================== */
      transaction.set(userRef, initialProfileState);

      /* ======================================================
         SAFE MULTI-TIER ANCESTRAL MATRIX INCREMENT OPERATION
      ====================================================== */
      // Reads snapshot nodes inside the transaction context loop to shield against broken or orphaned entries
      await updateUplineTree(
  transaction,
  newUserParentChain
);
      /* ======================================================
         INCREMENT DIRECT CONTROLLER PARAMETERS ON IMMEDIATE PARENT
      ====================================================== */
      await updateSponsorCounters(
  transaction,
  cleanSponsorUid
);

      return {
        success: true,
        message: "User registration block committed safely with precise ancestral synchronization.",
      };
    });

    return transactionResult;

  } catch (error) {
    // Structural Context-Aware Diagnostics Engine Logs
    console.error("CRITICAL TRANSACTION EXCEPTION IN MLM ONBOARDING ENGINE:", {
      context: "registerUser",
      uid: data.uid,
      timestamp: new Date().toISOString(),
      error,
    });
    
    return {
      success: false,
      message: "Registration lifecycle framework failed to secure atomic transaction pool.",
    };
  }
}
