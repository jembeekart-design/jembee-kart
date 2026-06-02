import {
  doc,
  getDoc
} from "firebase/firestore";

import { db } from "@/firebase/config";

interface ReferralLinkData {
  userId: string;
  baseUrl?: string;
}

export async function createReferralLink(
  data: ReferralLinkData
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
       REFERRAL CODE
    ====================================================== */

    const referralCode =
      userData?.referralCode;

    if (!referralCode) {
      return {
        success: false,
        message:
          "Referral Code Missing"
      };
    }

    /* ======================================================
       BASE URL
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
       SHARE MESSAGE
    ====================================================== */

    const shareMessage = `
🚀 Join JembeeKart & Start Earning

✅ MLM Income
✅ Reseller Income
✅ Affiliate Rewards
✅ Daily Rewards
✅ Team Commission

Use my referral link 👇

${referralLink}

Referral Code: ${referralCode}
    `.trim();

    /* ======================================================
       RETURN
    ====================================================== */

    return {
      success: true,

      referralCode,

      referralLink,

      shareMessage
    };

  } catch (error) {

    console.error(
      "REFERRAL LINK ERROR:",
      error
    );

    return {
      success: false,
      message:
        "Something went wrong"
    };
  }
}
