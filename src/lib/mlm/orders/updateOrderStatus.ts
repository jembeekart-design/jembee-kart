import {
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/firebase/config";

import { completeOrderAndDistributeCommission }
  from "@/lib/mlm/orders/completeOrderAndDistributeCommission";

interface UpdateOrderStatusData {
  orderId: string;

  status:
    | "placed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
}

export async function updateOrderStatus(
  data: UpdateOrderStatusData
) {
  try {
    /* =========================
       VALIDATION
    ========================= */

    if (!data.orderId?.trim()) {
      return {
        success: false,
        message: "Order ID Required",
      };
    }

    /* =========================
       ORDER CHECK
    ========================= */

    const orderRef = doc(
      db,
      "orders",
      data.orderId
    );

    const orderSnap =
      await getDoc(orderRef);

    if (!orderSnap.exists()) {
      return {
        success: false,
        message: "Order Not Found",
      };
    }

    const order =
      orderSnap.data();

    /* =========================
       PREVENT DUPLICATE
       DELIVERED PROCESSING
    ========================= */

    if (
      order.status === "delivered" &&
      data.status === "delivered"
    ) {
      return {
        success: true,
        message:
          "Order already delivered",
      };
    }

    /* =========================
       UPDATE STATUS
    ========================= */

    await updateDoc(orderRef, {
      status: data.status,
      updatedAt:
        serverTimestamp(),
    });

    /* =========================
       MLM + WATCH REWARD
       ONLY ON DELIVERED
    ========================= */

    if (
      data.status ===
      "delivered"
    ) {
      await completeOrderAndDistributeCommission(
        data.orderId
      );
    }

    return {
      success: true,
      message:
        "Order status updated successfully",
    };
  } catch (error) {
    console.error(
      "UPDATE ORDER STATUS ERROR:",
      error
    );

    return {
      success: false,
      message:
        "Failed to update order status",
    };
  }
}
