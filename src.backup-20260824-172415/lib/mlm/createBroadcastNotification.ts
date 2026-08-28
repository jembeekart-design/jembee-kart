import {
  addDoc,
  collection,
  serverTimestamp
} from "firebase/firestore";

import { db } from "@/firebase/config";

interface BroadcastNotificationData {
  title: string;
  message: string;
  adminId?: string;
  type:
    | "commission"
    | "withdraw"
    | "rank"
    | "package"
    | "system"
    | "reward";
}

export async function createBroadcastNotification(
  data: BroadcastNotificationData
) {
  try {

    /* ======================================================
       VALIDATION
    ====================================================== */

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
       CREATE BROADCAST NOTIFICATION
    ====================================================== */

    const broadcastRef =
      await addDoc(
        collection(
          db,
          "broadcast_notifications"
        ),
        {
          title:
            data.title.trim(),

          message:
            data.message.trim(),

          type:
            data.type,

          isActive:
            true,

          createdBy:
            data.adminId || null,

          createdAt:
            serverTimestamp()
        }
      );

    /* ======================================================
       ADMIN LOG
    ====================================================== */

    await addDoc(
      collection(
        db,
        "admin_logs"
      ),
      {
        action:
          "broadcast_notification",

        broadcastId:
          broadcastRef.id,

        adminId:
          data.adminId || null,

        title:
          data.title.trim(),

        type:
          data.type,

        createdAt:
          serverTimestamp()
      }
    );

    return {
      success: true,
      broadcastId:
        broadcastRef.id,
      message:
        "Broadcast Notification Created Successfully"
    };

  } catch (error) {

    console.error(
      "BROADCAST NOTIFICATION ERROR:",
      error
    );

    return {
      success: false,
      message:
        "Something went wrong"
    };
  }
}
