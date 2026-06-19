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

const VALID_TRANSITIONS: Record<
  string,
  string[]
> = {
  placed: [
    "processing",
    "cancelled",
  ],

  processing: [
    "shipped",
    "cancelled",
  ],

  shipped: [
    "delivered",
  ],

  delivered: [],

  cancelled: [],
};

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

    const currentStatus =
      order.status || "placed";

    /* =========================
       FINAL STATES
    ========================= */

    if (
      currentStatus ===
        "delivered" ||
      currentStatus ===
        "cancelled"
    ) {
      return {
        success: false,
        message:
          `Order already ${currentStatus}`,
      };
    }

    /* =========================
       VALID TRANSITION
    ========================= */

    const allowedStatuses =
      VALID_TRANSITIONS[
        currentStatus
      ] || [];

    if (
      !allowedStatuses.includes(
        data.status
      )
    ) {
      return {
        success: false,
        message:
          `Invalid status transition from ${currentStatus} to ${data.status}`,
      };
    }

    /* =========================
       DELIVERED FLOW
    ========================= */

    if (
      data.status ===
      "delivered"
    ) {
      const result =
        await completeOrderAndDistributeCommission(
          data.orderId
        );

      if (!result.success) {
        return {
          success: false,
          message:
            result.message ||
            "Failed to complete order",
        };
      }
    }

    /* =========================
       UPDATE ORDER
    ========================= */

    await updateDoc(orderRef, {
      status: data.status,

      updatedAt:
        serverTimestamp(),

      ...(data.status ===
      "delivered"
        ? {
            deliveredAt:
              serverTimestamp(),
          }
        : {}),

      ...(data.status ===
      "cancelled"
        ? {
            cancelledAt:
              serverTimestamp(),
          }
        : {}),
    });

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
