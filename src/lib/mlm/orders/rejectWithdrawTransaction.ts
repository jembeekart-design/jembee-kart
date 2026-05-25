import {
  doc,
  getDoc,
  updateDoc
} from "firebase/firestore";

import { db }
from "@/firebase/config";

interface RejectWithdrawTransactionData {
  withdrawId: string;

  reason?: string;
}

export async function
rejectWithdrawTransaction(
  data:
  RejectWithdrawTransactionData
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
      "rejected"
    ) {

      return {
        success: false
      };
    }

    await updateDoc(
      withdrawRef,
      {
        status:
          "rejected",

        rejectReason:
          data.reason ||
          "Rejected by admin",

        rejectedAt:
          Date.now()
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
