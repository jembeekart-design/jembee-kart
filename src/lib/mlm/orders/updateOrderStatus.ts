import {
  doc,
  updateDoc
} from "firebase/firestore";

import { db }
from "@/firebase/config";

interface UpdateOrderStatusData {
  orderId: string;

  status:
    | "placed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
}

export async function
updateOrderStatus(
  data: UpdateOrderStatusData
) {

  try {

    await updateDoc(
      doc(
        db,
        "orders",
        data.orderId
      ),
      {
        status:
          data.status,

        updatedAt:
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
