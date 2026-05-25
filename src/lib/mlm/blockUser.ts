import {
  addDoc,
  collection,
  doc,
  getDoc,
  updateDoc
} from "firebase/firestore";

import { db } from "@/firebase/config";

import { createNotification }
from "./createNotification";

interface BlockUserData {

  userId: string;

  adminId: string;

  reason: string;

}

export async function blockUser(
  data: BlockUserData
) {

  try {

    /* ======================================================
    GET USER
    ====================================================== */

    const userRef =
      doc(
        db,
        "users",
        data.userId
      );

    const userSnapshot =
      await getDoc(
        userRef
      );

    if (
      !userSnapshot.exists()
    ) {

      return {

        success: false,

        message:
          "User Not Found"

      };

    }

    const userData =
      userSnapshot.data();

    /* ======================================================
    ALREADY BLOCKED
    ====================================================== */

    if (
      userData.isBlocked
    ) {

      return {

        success: false,

        message:
          "User Already Blocked"

      };

    }

    /* ======================================================
    UPDATE USER
    ====================================================== */

    await updateDoc(
      userRef,
      {
        isBlocked:
          true,

        blockedBy:
          data.adminId,

        blockedReason:
          data.reason,

        blockedAt:
          Date.now()
      }
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
          "block_user",

        targetUserId:
          data.userId,

        adminId:
          data.adminId,

        reason:
          data.reason,

        createdAt:
          Date.now()
      }
    );

    /* ======================================================
    SAVE TRANSACTION
    ====================================================== */

    await addDoc(
      collection(
        db,
        "transactions"
      ),
      {
        userId:
          data.userId,

        type:
          "account_blocked",

        reason:
          data.reason,

        status:
          "blocked",

        createdAt:
          Date.now()
      }
    );

    /* ======================================================
    CREATE NOTIFICATION
    ====================================================== */

    await createNotification({
      userId:
        data.userId,

      title:
        "Account Blocked",

      message:
        `Your account has been blocked. Reason: ${data.reason}`,

      type:
        "system"
    });

    return {

      success: true,

      message:
        "User Blocked Successfully"

    };

  } catch (error) {

    console.error(
      "BLOCK USER ERROR:",
      error
    );

    return {

      success: false,

      message:
        "Something went wrong"

    };

  }

}
