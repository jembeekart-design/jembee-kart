import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc
} from "firebase/firestore";

import { db } from "@/firebase/config";

import { createNotification } from "./createNotification";

interface UnblockUserData {
  userId: string;
  adminId: string;
}

export async function unblockUser(
  data: UnblockUserData
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

    if (!data.adminId?.trim()) {
      return {
        success: false,
        message: "Admin ID Required"
      };
    }

    /* ======================================================
       GET USER
    ====================================================== */

    const userRef = doc(
      db,
      "users",
      data.userId
    );

    const userSnapshot =
      await getDoc(userRef);

    if (!userSnapshot.exists()) {
      return {
        success: false,
        message: "User Not Found"
      };
    }

    const userData =
      userSnapshot.data();

    /* ======================================================
       STATUS CHECK
    ====================================================== */

    if (!userData.isBlocked) {
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
        isBlocked: false,

        blockedBy: null,

        blockedReason: null,

        blockedAt: null,

        unblockedBy:
          data.adminId,

        unblockedAt:
          serverTimestamp(),

        updatedAt:
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
          "unblock_user",

        targetUserId:
          data.userId,

        adminId:
          data.adminId,

        createdAt:
          serverTimestamp()
      }
    );

    /* ======================================================
       ACCOUNT HISTORY
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
          serverTimestamp()
      }
    );

    /* ======================================================
       NOTIFICATION
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
