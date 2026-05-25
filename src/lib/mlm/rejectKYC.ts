import {
  addDoc,
  collection,
  doc,
  getDoc,
  updateDoc
} from "firebase/firestore";

import { db } from "@/firebase/config";

import { createNotification }
from "./createNotification";

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
    GET KYC REQUEST
    ====================================================== */

    const kycRef =
      doc(
        db,
        "kyc_requests",
        data.kycRequestId
      );

    const kycSnapshot =
      await getDoc(
        kycRef
      );

    if (
      !kycSnapshot.exists()
    ) {

      return {

        success: false,

        message:
          "KYC Request Not Found"

      };

    }

    const kycData =
      kycSnapshot.data();

    /* ======================================================
    ALREADY REJECTED
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

    /* ======================================================
    UPDATE KYC STATUS
    ====================================================== */

    await updateDoc(
      kycRef,
      {
        status:
          "rejected",

        rejectedBy:
          data.adminId,

        rejectedReason:
          data.reason,

        rejectedAt:
          Date.now()
      }
    );

    /* ======================================================
    UPDATE USER
    ====================================================== */

    const userRef =
      doc(
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
          false
      }
    );

    /* ======================================================
    SAVE TRANSACTION
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
          data.reason,

        status:
          "rejected",

        rejectedBy:
          data.adminId,

        createdAt:
          Date.now()
      }
    );

    /* ======================================================
    CREATE NOTIFICATION
    ====================================================== */

    await createNotification({
      userId:
        kycData.userId,

      title:
        "KYC Rejected",

      message:
        `Your KYC request was rejected. Reason: ${data.reason}`,

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
