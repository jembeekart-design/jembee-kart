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
       VALIDATION
    ====================================================== */

    if (!data.userId?.trim()) {
      return {
        success: false,
        message: "User ID Required"
      };
    }

    /* ======================================================
       USER
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

    if (userData.isBlocked) {
      return {
        success: false,
        message: "Account Blocked"
      };
    }

    /* ======================================================
       REFERRAL CODE
    ====================================================== */

    const referralCode =
      userData.referralCode;

    if (!referralCode) {
      return {
        success: false,
        message:
          "Referral Code Missing"
      };
    }

    /* ======================================================
       APP URL
    ====================================================== */

    const appUrl =
      (
        data.baseUrl ||
        "https://jembeekart.com"
      ).replace(/\/$/, "");

    /* ======================================================
       REFERRAL LINK
    ====================================================== */

    const referralLink =
      `${appUrl}/register?ref=${encodeURIComponent(
        referralCode
      )}`;

    /* ======================================================
       QR CODE
    ====================================================== */

    const qrCodeImage =
      await QRCode.toDataURL(
        referralLink,
        {
          width: 500,
          margin: 2,

          errorCorrectionLevel:
            "H"
        }
      );

    /* ======================================================
       RETURN
    ====================================================== */

    return {
      success: true,

      referralCode,

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
