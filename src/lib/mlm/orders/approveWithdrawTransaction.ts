import {
  doc,
  getDoc,
  increment,
  updateDoc
} from "firebase/firestore";

import { db }
from "@/firebase/config";

interface ApproveWithdrawTransactionData {
  withdrawId: string;
}

export async function
approveWithdrawTransaction(
  data:
  ApproveWithdrawTransactionData
) {

  try {

    const withdrawRef =
      doc(
        db,
        "withdrawTransactions",
        data.withdrawId
      );

    const withdrawSnap =
      await getDoc(
        withdrawRef
      );

    if (
      !withdrawSnap.exists()
    ) {

      return {
        success: false
      };
    }

    const withdrawData =
      withdrawSnap.data();

    if (
      withdrawData.status ===
      "approved"
    ) {

      return {
        success: false
      };
    }

    /* =========================
       UPDATE STATUS
    ========================= */

    await updateDoc(
      withdrawRef,
      {
        status:
          "approved",

        approvedAt:
          Date.now()
      }
    );

    /* =========================
       DEDUCT WALLET
    ========================= */

    await updateDoc(
      doc(
        db,
        "users",
        withdrawData.userId
      ),
      {
        walletBalance:
          increment(
            -withdrawData.amount
          )
      }
    );

    return {
      success: true
    };

  } catch (error) {

    console.error(error);

    return {
      success: false
    };
  }
}
