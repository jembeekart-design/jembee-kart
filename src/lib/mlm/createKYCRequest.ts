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

interface KYCRequestData {

  userId: string;

  fullName: string;

  aadhaarNumber: string;

  panNumber: string;

  bankName: string;

  accountNumber: string;

  ifscCode: string;

  upiId: string;

  aadhaarFrontImage: string;

  aadhaarBackImage: string;

  panImage: string;

  selfieImage: string;

}

export async function createKYCRequest(
  data: KYCRequestData
) {

  try {

    /* ======================================================
    CHECK USER
    ====================================================== */

    const userRef =
      doc(
        db,
        "users",
        data.userId
      );

    const userSnapshot =
      await getDoc(
        userRef
      );

    if (
      !userSnapshot.exists()
    ) {

      return {

        success: false,

        message:
          "User Not Found"

      };

    }

    /* ======================================================
    CHECK EXISTING KYC
    ====================================================== */

    const userData =
      userSnapshot.data();

    if (
      userData.kycStatus ===
      "pending"
    ) {

      return {

        success: false,

        message:
          "KYC Already Pending"

      };

    }

    /* ======================================================
    SAVE KYC REQUEST
    ====================================================== */

    await addDoc(
      collection(
        db,
        "kyc_requests"
      ),
      {
        userId:
          data.userId,

        fullName:
          data.fullName,

        aadhaarNumber:
          data.aadhaarNumber,

        panNumber:
          data.panNumber,

        bankName:
          data.bankName,

        accountNumber:
          data.accountNumber,

        ifscCode:
          data.ifscCode,

        upiId:
          data.upiId,

        aadhaarFrontImage:
          data.aadhaarFrontImage,

        aadhaarBackImage:
          data.aadhaarBackImage,

        panImage:
          data.panImage,

        selfieImage:
          data.selfieImage,

        status:
          "pending",

        adminRemark:
          "",

        createdAt:
          Date.now()
      }
    );

    /* ======================================================
    UPDATE USER
    ====================================================== */

    await updateDoc(
      userRef,
      {
        kycStatus:
          "pending"
      }
    );

    /* ======================================================
    CREATE NOTIFICATION
    ====================================================== */

    await createNotification({
      userId:
        data.userId,

      title:
        "KYC Submitted",

      message:
        "Your KYC verification request has been submitted successfully.",

      type:
        "system"
    });

    return {

      success: true,

      message:
        "KYC Submitted Successfully"

    };

  } catch (error) {

    console.error(
      "KYC REQUEST ERROR:",
      error
    );

    return {

      success: false,

      message:
        "Something went wrong"

    };

  }

}
