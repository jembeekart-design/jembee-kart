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

interface UnblockUserData {

  userId: string;

  adminId: string;

}

export async function unblockUser(
  data: UnblockUserData
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
    USER NOT BLOCKED
    ====================================================== */

    if (
      !userData.isBlocked
    ) {

      return {

        success: false,

        message:
          "User Already Active"

      };

    }

    /* ======================================================
    UPDATE USER
    ====================================================== */

    await updateDoc(
      userRef,
      {
        isBlocked:
          false,

        blockedBy:
          "",

        blockedReason:
          "",

        blockedAt:
          null,

        unblockedBy:
          data.adminId,

        unblockedAt:
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
          "unblock_user",

        targetUserId:
          data.userId,

        adminId:
          data.adminId,

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
          "account_unblocked",

        status:
          "success",

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
        "Account Activated",

      message:
        "Your account has been activated successfully.",

      type:
        "system"
    });

    return {

      success: true,

      message:
        "User Unblocked Successfully"

    };

  } catch (error) {

    console.error(
      "UNBLOCK USER ERROR:",
      error
    );

    return {

      success: false,

      message:
        "Something went wrong"

    };

  }

}
