import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc
} from "firebase/firestore";

import { db } from "@/firebase/config";

import { createNotification } from "./createNotification";

interface RejectKYCData {
  kycRequestId: string;
  adminId: string;
  reason: string;
}

export async function rejectKYC(
  data: RejectKYCData
) {
  try {

    /* ======================================================
       VALIDATION
    ====================================================== */

    if (!data.kycRequestId?.trim()) {
      return {
        success: false,
        message: "KYC Request ID Required"
      };
    }

    if (!data.adminId?.trim()) {
      return {
        success: false,
        message: "Admin ID Required"
      };
    }

    if (!data.reason?.trim()) {
      return {
        success: false,
        message: "Rejection Reason Required"
      };
    }

    /* ======================================================
       GET KYC REQUEST
    ====================================================== */

    const kycRef = doc(
      db,
      "kyc_requests",
      data.kycRequestId
    );

    const kycSnapshot =
      await getDoc(kycRef);

    if (!kycSnapshot.exists()) {
      return {
        success: false,
        message:
          "KYC Request Not Found"
      };
    }

    const kycData =
      kycSnapshot.data();

    /* ======================================================
       STATUS CHECK
    ====================================================== */

    if (
      kycData.status ===
      "rejected"
    ) {
      return {
        success: false,
        message:
          "KYC Already Rejected"
      };
    }

    if (
      kycData.status ===
      "approved"
    ) {
      return {
        success: false,
        message:
          "Approved KYC Cannot Be Rejected"
      };
    }

    /* ======================================================
       UPDATE KYC
    ====================================================== */

    await updateDoc(
      kycRef,
      {
        status:
          "rejected",

        rejectedBy:
          data.adminId,

        rejectedReason:
          data.reason.trim(),

        rejectedAt:
          serverTimestamp(),

        updatedAt:
          serverTimestamp()
      }
    );

    /* ======================================================
       UPDATE USER
    ====================================================== */

    const userRef = doc(
      db,
      "users",
      kycData.userId
    );

    await updateDoc(
      userRef,
      {
        kycStatus:
          "rejected",

        isKYCVerified:
          false,

        updatedAt:
          serverTimestamp()
      }
    );

    /* ======================================================
       TRANSACTION LOG
    ====================================================== */

    await addDoc(
      collection(
        db,
        "transactions"
      ),
      {
        userId:
          kycData.userId,

        type:
          "kyc_rejected",

        reason:
          data.reason.trim(),

        status:
          "rejected",

        rejectedBy:
          data.adminId,

        createdAt:
          serverTimestamp()
      }
    );

    /* ======================================================
       ADMIN LOG
    ====================================================== */

    await addDoc(
      collection(
        db,
        "admin_logs"
      ),
      {
        action:
          "reject_kyc",

        kycRequestId:
          data.kycRequestId,

        userId:
          kycData.userId,

        adminId:
          data.adminId,

        reason:
          data.reason.trim(),

        createdAt:
          serverTimestamp()
      }
    );

    /* ======================================================
       NOTIFICATION
    ====================================================== */

    await createNotification({
      userId:
        kycData.userId,

      title:
        "KYC Rejected",

      message:
        `Your KYC request was rejected. Reason: ${data.reason.trim()}`,

      type:
        "system"
    });

    return {
      success: true,
      message:
        "KYC Rejected Successfully"
    };

  } catch (error) {

    console.error(
      "REJECT KYC ERROR:",
      error
    );

    return {
      success: false,
      message:
        "Something went wrong"
    };
  }
}
