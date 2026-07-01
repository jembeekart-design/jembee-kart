import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";

export async function validateOrder(orderId: string) {
  if (!orderId?.trim()) {
    return {
      success: false,
      message: "Order ID Required",
    };
  }

  const orderRef = doc(db, "orders", orderId);
  const orderSnap = await getDoc(orderRef);

  if (!orderSnap.exists()) {
    return {
      success: false,
      message: "Order not found",
    };
  }

  return {
    success: true,
    orderRef,
    order: orderSnap.data(),
  };
}
