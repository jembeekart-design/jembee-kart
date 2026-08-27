import {
  addDoc,
  collection
} from "firebase/firestore";

import { db }
from "@/firebase/config";

interface CreateOrderNotificationData {
  userId: string;

  title: string;

  message: string;
}

export async function
createOrderNotification(
  data:
  CreateOrderNotificationData
) {

  try {

    await addDoc(
      collection(
        db,
        "notifications"
      ),
      {
        userId:
          data.userId,

        title:
          data.title,

        message:
          data.message,

        read: false,

        createdAt:
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
