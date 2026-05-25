import {
  addDoc,
  collection,
  doc,
  getDoc,
  increment,
  updateDoc
} from "firebase/firestore";

import { db } from "@/firebase/config";

interface GiveCommissionData {

  sponsorId: string;

  amount: number;

  level: number;

  sourceUserId: string;

}

export async function giveCommission(
  data: GiveCommissionData
) {

  try {

    /* ======================================================
    GET SPONSOR USER
    ====================================================== */

    const sponsorRef =
      doc(
        db,
        "users",
        data.sponsorId
      );

    const sponsorSnapshot =
      await getDoc(
        sponsorRef
      );

    if (
      !sponsorSnapshot.exists()
    ) {

      console.log(
        "Sponsor Not Found"
      );

      return;
    }

    const sponsorData =
      sponsorSnapshot.data();

    /* ======================================================
    CHECK USER BLOCKED
    ====================================================== */

    if (
      sponsorData.isBlocked
    ) {

      console.log(
        "Blocked User"
      );

      return;
    }

    /* ======================================================
    UPDATE WALLET
    ====================================================== */

    const walletRef =
      doc(
        db,
        "wallets",
        data.sponsorId
      );

    await updateDoc(
      walletRef,
      {
        totalBalance:
          increment(
            data.amount
          ),

        withdrawableBalance:
          increment(
            data.amount
          ),

        totalEarnings:
          increment(
            data.amount
          )
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
          data.sponsorId,

        amount:
          data.amount,

        level:
          data.level,

        type:
          "commission",

        sourceUserId:
          data.sourceUserId,

        status:
          "success",

        createdAt:
          Date.now()
      }
    );

    /* ======================================================
    SAVE NOTIFICATION
    ====================================================== */

    await addDoc(
      collection(
        db,
        "notifications"
      ),
      {
        userId:
          data.sponsorId,

        title:
          `Level ${data.level} Commission`,

        message:
          `You received ₹${data.amount} commission income.`,

        type:
          "commission",

        isRead:
          false,

        createdAt:
          Date.now()
      }
    );

    console.log(
      "Commission Added Successfully"
    );

  } catch (error) {

    console.error(
      "COMMISSION ERROR:",
      error
    );

  }

}
