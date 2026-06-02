import {
  addDoc,
  collection,
  doc,
  getDoc,
  increment,
  serverTimestamp,
  setDoc,
  updateDoc
} from "firebase/firestore";

import { db } from "@/firebase/config";

import { createNotification } from "./createNotification";

interface TaskRewardData {
  userId: string;

  taskId: string;

  taskTitle: string;

  rewardAmount: number;
}

export async function createTaskReward(
  data: TaskRewardData
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

    if (!data.taskId?.trim()) {
      return {
        success: false,
        message: "Task ID Required"
      };
    }

    if (!data.taskTitle?.trim()) {
      return {
        success: false,
        message: "Task Title Required"
      };
    }

    if (
      !data.rewardAmount ||
      data.rewardAmount <= 0
    ) {
      return {
        success: false,
        message: "Invalid Reward Amount"
      };
    }

    /* ======================================================
       DUPLICATE REWARD CHECK
    ====================================================== */

    const rewardDocId =
      `${data.userId}_${data.taskId}`;

    const rewardRef = doc(
      db,
      "task_rewards",
      rewardDocId
    );

    const rewardSnapshot =
      await getDoc(
        rewardRef
      );

    if (rewardSnapshot.exists()) {
      return {
        success: false,
        message:
          "Task Reward Already Claimed"
      };
    }

    /* ======================================================
       USER
    ====================================================== */

    const userRef = doc(
      db,
      "users",
      data.userId
    );

    const userSnapshot =
      await getDoc(
        userRef
      );

    if (!userSnapshot.exists()) {
      return {
        success: false,
        message:
          "User Not Found"
      };
    }

    const userData =
      userSnapshot.data();

    if (userData.isBlocked) {
      return {
        success: false,
        message:
          "Account Blocked"
      };
    }

    /* ======================================================
       WALLET
    ====================================================== */

    const walletRef = doc(
      db,
      "wallets",
      data.userId
    );

    const walletSnapshot =
      await getDoc(
        walletRef
      );

    if (!walletSnapshot.exists()) {
      return {
        success: false,
        message:
          "Wallet Not Found"
      };
    }

    /* ======================================================
       CREDIT WALLET
    ====================================================== */

    await updateDoc(
      walletRef,
      {
        totalBalance:
          increment(
            data.rewardAmount
          ),

        bonusBalance:
          increment(
            data.rewardAmount
          ),

        totalEarnings:
          increment(
            data.rewardAmount
          ),

        updatedAt:
          serverTimestamp()
      }
    );

    /* ======================================================
       SAVE TASK REWARD
    ====================================================== */

    await setDoc(
      rewardRef,
      {
        userId:
          data.userId,

        taskId:
          data.taskId,

        taskTitle:
          data.taskTitle,

        rewardAmount:
          data.rewardAmount,

        status:
          "success",

        createdAt:
          serverTimestamp()
      }
    );

    /* ======================================================
       TRANSACTION
    ====================================================== */

    await addDoc(
      collection(
        db,
        "transactions"
      ),
      {
        userId:
          data.userId,

        taskId:
          data.taskId,

        type:
          "task_reward",

        amount:
          data.rewardAmount,

        taskTitle:
          data.taskTitle,

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
        "Task Reward Added",

      message:
        `You earned ₹${data.rewardAmount} from ${data.taskTitle}.`,

      type:
        "reward"
    });

    return {
      success: true,

      rewardAmount:
        data.rewardAmount,

      message:
        "Task Reward Added Successfully"
    };

  } catch (error) {

    console.error(
      "TASK REWARD ERROR:",
      error
    );

    return {
      success: false,

      message:
        "Something went wrong"
    };
  }
}
