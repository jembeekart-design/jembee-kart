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
    GET USER
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

    const userData =
      userSnapshot.data();

    /* ======================================================
    CHECK REFERRAL CODE
    ====================================================== */

    if (
      !userData.referralCode
    ) {

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
      data.baseUrl ||
      "https://jembeekart.com";

    /* ======================================================
    CREATE LINK
    ====================================================== */

    const referralLink =
      `${appUrl}/register?ref=${userData.referralCode}`;

    /* ======================================================
    CREATE SHARE MESSAGE
    ====================================================== */

    const shareMessage =
      `
🚀 Join JembeeKart MLM & Earn Online

✅ MLM Income
✅ Reseller Income
✅ Affiliate Rewards
✅ Daily Rewards
✅ Team Commission

Use My Referral Link 👇

${referralLink}
      `.trim();

    return {

      success: true,

      referralCode:
        userData.referralCode,

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
