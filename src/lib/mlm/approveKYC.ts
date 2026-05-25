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

interface ApproveKYCData {

  kycRequestId: string;

  adminId: string;

}

export async function approveKYC(
  data: ApproveKYCData
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
    ALREADY APPROVED
    ====================================================== */

    if (
      kycData.status ===
      "approved"
    ) {

      return {

        success: false,

        message:
          "KYC Already Approved"

      };

    }

    /* ======================================================
    UPDATE KYC STATUS
    ====================================================== */

    await updateDoc(
      kycRef,
      {
        status:
          "approved",

        approvedBy:
          data.adminId,

        approvedAt:
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
          "verified",

        isKYCVerified:
          true
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
          "kyc_approved",

        status:
          "success",

        approvedBy:
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
        "KYC Approved",

      message:
        "Congratulations! Your KYC has been verified successfully.",

      type:
        "system"
    });

    return {

      success: true,

      message:
        "KYC Approved Successfully"

    };

  } catch (error) {

    console.error(
      "APPROVE KYC ERROR:",
      error
    );

    return {

      success: false,

      message:
        "Something went wrong"

    };

  }

}
