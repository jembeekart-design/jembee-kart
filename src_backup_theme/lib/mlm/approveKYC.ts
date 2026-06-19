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

interface ApproveKYCData {
  kycRequestId: string;
  adminId: string;
}

export async function approveKYC(
  data: ApproveKYCData
) {
  try {

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
        message: "KYC Request Not Found"
      };
    }

    const kycData =
      kycSnapshot.data();

    if (
      kycData.status !==
      "pending"
    ) {
      return {
        success: false,
        message:
          "KYC Request Already Processed"
      };
    }

    const userRef = doc(
      db,
      "users",
      kycData.userId
    );

    const userSnapshot =
      await getDoc(userRef);

    if (!userSnapshot.exists()) {
      return {
        success: false,
        message: "User Not Found"
      };
    }

    await updateDoc(
      kycRef,
      {
        status: "approved",
        approvedBy:
          data.adminId,
        approvedAt:
          serverTimestamp()
      }
    );

    await updateDoc(
      userRef,
      {
        kycStatus:
          "verified",
        isKYCVerified:
          true,
        kycVerifiedAt:
          serverTimestamp()
      }
    );

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
          serverTimestamp()
      }
    );

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
