import QRCode from "qrcode";

import {
  doc,
  getDoc
} from "firebase/firestore";

import { db } from "@/firebase/config";

interface ReferralQRCodeData {
  userId: string;
  baseUrl?: string;
}

export async function generateReferralQRCode(
  data: ReferralQRCodeData
) {
  try {
    /* ======================================================
       GET USER
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
       CHECK REFERRAL CODE
    ====================================================== */

    if (!userData.referralCode) {
      return {
        success: false,
        message: "Referral Code Missing"
      };
    }

    /* ======================================================
       APP URL
    ====================================================== */

    const appUrl =
      data.baseUrl ||
      (typeof window !== "undefined"
        ? window.location.origin
        : "");

    if (!appUrl) {
      return {
        success: false,
        message: "Base URL Missing"
      };
    }

    /* ======================================================
       REFERRAL LINK
    ====================================================== */

    const referralLink =
      `${appUrl}/login?ref=${userData.referralCode}`;

    /* ======================================================
       GENERATE QR CODE
    ====================================================== */

    const qrCodeImage =
      await QRCode.toDataURL(
        referralLink,
        {
          width: 500,
          margin: 2
        }
      );

    /* ======================================================
       RETURN
    ====================================================== */

    return {
      success: true,
      referralCode:
        userData.referralCode,
      referralLink,
      qrCodeImage
    };

  } catch (error) {
    console.error(
      "QR CODE ERROR:",
      error
    );

    return {
      success: false,
      message:
        "Something went wrong"
    };
  }
}
