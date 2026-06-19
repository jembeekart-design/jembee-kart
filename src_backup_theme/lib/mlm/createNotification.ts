import {
  addDoc,
  collection,
  serverTimestamp
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
       VALIDATION
    ====================================================== */

    if (!data.userId?.trim()) {
      return {
        success: false,
        message: "User ID Required"
      };
    }

    if (!data.title?.trim()) {
      return {
        success: false,
        message: "Title Required"
      };
    }

    if (!data.message?.trim()) {
      return {
        success: false,
        message: "Message Required"
      };
    }

    /* ======================================================
       CREATE NOTIFICATION
    ====================================================== */

    const notificationRef =
      await addDoc(
        collection(
          db,
          "notifications"
        ),
        {
          userId:
            data.userId,

          title:
            data.title.trim(),

          message:
            data.message.trim(),

          type:
            data.type,

          isRead:
            false,

          isDeleted:
            false,

          createdAt:
            serverTimestamp(),

          updatedAt:
            serverTimestamp()
        }
      );

    return {
      success: true,
      notificationId:
        notificationRef.id,
      message:
        "Notification Created Successfully"
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
