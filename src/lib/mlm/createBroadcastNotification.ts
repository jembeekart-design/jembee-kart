import {
  addDoc,
  collection,
  getDocs
} from "firebase/firestore";

import { db } from "@/firebase/config";

interface BroadcastNotificationData {

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

export async function createBroadcastNotification(
  data: BroadcastNotificationData
) {

  try {

    /* ======================================================
    GET ALL USERS
    ====================================================== */

    const usersSnapshot =
      await getDocs(
        collection(
          db,
          "users"
        )
      );

    if (
      usersSnapshot.empty
    ) {

      return {

        success: false,

        message:
          "No Users Found"

      };

    }

    /* ======================================================
    SEND NOTIFICATION TO ALL USERS
    ====================================================== */

    const notificationPromises =
      usersSnapshot.docs.map(
        async (
          userDoc
        ) => {

          const userData =
            userDoc.data();

          /* SKIP BLOCKED USERS */

          if (
            userData.isBlocked
          ) {

            return;

          }

          return addDoc(
            collection(
              db,
              "notifications"
            ),
            {
              userId:
                userDoc.id,

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

        }
      );

    await Promise.all(
      notificationPromises
    );

    /* ======================================================
    SAVE ADMIN LOG
    ====================================================== */

    await addDoc(
      collection(
        db,
        "admin_logs"
      ),
      {
        action:
          "broadcast_notification",

        title:
          data.title,

        message:
          data.message,

        type:
          data.type,

        totalUsers:
          usersSnapshot.size,

        createdAt:
          Date.now()
      }
    );

    return {

      success: true,

      totalUsers:
        usersSnapshot.size,

      message:
        "Broadcast Notification Sent Successfully"

    };

  } catch (error) {

    console.error(
      "BROADCAST ERROR:",
      error
    );

    return {

      success: false,

      message:
        "Something went wrong"

    };

  }

}
