import {
  doc,
  getDoc,
  increment,
  updateDoc
} from "firebase/firestore";

import { db }
from "@/firebase/config";

interface RefundOrderCommissionData {
  orderId: string;
}

export async function
refundOrderCommission(
  data:
  RefundOrderCommissionData
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

    let currentUserId =
      orderData.userId;

    const commission =
      orderData.totalAmount *
      0.1;

    for (
      let level = 0;
      level < 10;
      level++
    ) {

      const userRef =
        doc(
          db,
          "users",
          currentUserId
        );

      const userSnap =
        await getDoc(
          userRef
        );

      if (
        !userSnap.exists()
      ) {
        break;
      }

      const userData =
        userSnap.data();

      const sponsorId =
        userData.sponsorId;

      if (!sponsorId) {
        break;
      }

      await updateDoc(
        doc(
          db,
          "users",
          sponsorId
        ),
        {
          walletBalance:
            increment(
              -commission
            ),

          totalIncome:
            increment(
              -commission
            )
        }
      );

      currentUserId =
        sponsorId;
    }

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
