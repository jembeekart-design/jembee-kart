import {
  addDoc,
  collection,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp
} from "firebase/firestore";

import { db } from "@/firebase/config";

import { createNotification } from "./createNotification";

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
       BASIC VALIDATION
    ====================================================== */

    if (!data.userId) {
      return {
        success: false,
        message: "User ID Required"
      };
    }

    if (!data.fullName.trim()) {
      return {
        success: false,
        message: "Full Name Required"
      };
    }

    if (!/^\d{12}$/.test(data.aadhaarNumber)) {
      return {
        success: false,
        message: "Invalid Aadhaar Number"
      };
    }

    if (
      !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(
        data.panNumber
      )
    ) {
      return {
        success: false,
        message: "Invalid PAN Number"
      };
    }

    if (!data.accountNumber.trim()) {
      return {
        success: false,
        message: "Account Number Required"
      };
    }

    if (!data.ifscCode.trim()) {
      return {
        success: false,
        message: "IFSC Code Required"
      };
    }

    if (!data.aadhaarFrontImage) {
      return {
        success: false,
        message: "Aadhaar Front Image Required"
      };
    }

    if (!data.aadhaarBackImage) {
      return {
        success: false,
        message: "Aadhaar Back Image Required"
      };
    }

    if (!data.panImage) {
      return {
        success: false,
        message: "PAN Image Required"
      };
    }

    if (!data.selfieImage) {
      return {
        success: false,
        message: "Selfie Image Required"
      };
    }

    /* ======================================================
       CHECK USER
    ====================================================== */

    const userRef = doc(
      db,
      "users",
      data.userId
    );

    const userSnapshot =
      await getDoc(userRef);

    if (!userSnapshot.exists()) {
      return {
        success: false,
        message: "User Not Found"
      };
    }

    const userData =
      userSnapshot.data();

    /* ======================================================
       KYC STATUS CHECK
    ====================================================== */

    if (
      userData.kycStatus === "pending"
    ) {
      return {
        success: false,
        message: "KYC Already Pending"
      };
    }

    if (
      userData.kycStatus === "verified"
    ) {
      return {
        success: false,
        message: "KYC Already Verified"
      };
    }

    /* ======================================================
       CREATE KYC REQUEST
    ====================================================== */

    const kycRef =
      await addDoc(
        collection(
          db,
          "kyc_requests"
        ),
        {
          userId: data.userId,

          fullName:
            data.fullName.trim(),

          aadhaarNumber:
            data.aadhaarNumber,

          panNumber:
            data.panNumber.toUpperCase(),

          bankName:
            data.bankName.trim(),

          accountNumber:
            data.accountNumber.trim(),

          ifscCode:
            data.ifscCode.toUpperCase(),

          upiId:
            data.upiId.trim(),

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
            serverTimestamp()
        }
      );

    /* ======================================================
       UPDATE USER
    ====================================================== */

    await updateDoc(
      userRef,
      {
        kycStatus:
          "pending",

        kycRequestId:
          kycRef.id,

        kycSubmittedAt:
          serverTimestamp()
      }
    );

    /* ======================================================
       NOTIFICATION
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
      kycRequestId:
        kycRef.id,
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
