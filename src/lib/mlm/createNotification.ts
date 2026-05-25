import {
  addDoc,
  collection
} from "firebase/firestore";

import { db } from "@/firebase/config";

interface NotificationData {

  userId: string;

  title: string;

  message: string;

  type:
    | "commission"
    | "withdraw"
    | "rank"
    | "package"
    | "system"
    | "reward";

}

export async function createNotification(
  data: NotificationData
) {

  try {

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
          data.userId,

        title:
          data.title,

        message:
          data.message,

        type:
          data.type,

        isRead:
          false,

        createdAt:
          Date.now()
      }
    );

    return {

      success: true,

      message:
        "Notification Created"

    };

  } catch (error) {

    console.error(
      "NOTIFICATION ERROR:",
      error
    );

    return {

      success: false,

      message:
        "Something went wrong"

    };

  }

}
