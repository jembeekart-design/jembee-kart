import {
  doc,
  getDoc,
  increment,
  updateDoc
} from "firebase/firestore";

import { db }
from "@/firebase/config";

interface CancelOrderData {
  orderId: string;
}

export async function
cancelOrder(
  data: CancelOrderData
) {

  try {

    const orderRef =
      doc(
        db,
        "orders",
        data.orderId
      );

    const orderSnap =
      await getDoc(
        orderRef
      );

    if (
      !orderSnap.exists()
    ) {

      return {
        success: false
      };
    }

    const orderData =
      orderSnap.data();

    if (
      orderData.status ===
      "cancelled"
    ) {

      return {
        success: false
      };
    }

    await updateDoc(
      orderRef,
      {
        status:
          "cancelled",

        cancelledAt:
          Date.now()
      }
    );

    /* =========================
       REFUND USER WALLET
    ========================= */

    await updateDoc(
      doc(
        db,
        "users",
        orderData.userId
      ),
      {
        walletBalance:
          increment(
            orderData.totalAmount
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
