import {
  addDoc,
  collection,
  doc,
  getDoc,
  increment,
  updateDoc
} from "firebase/firestore";

import { db } from "@/firebase/config";

import { createNotification }
from "./createNotification";

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
    CHECK USER
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

    /* ======================================================
    CHECK WALLET
    ====================================================== */

    const walletRef =
      doc(
        db,
        "wallets",
        data.userId
      );

    const walletSnapshot =
      await getDoc(
        walletRef
      );

    if (
      !walletSnapshot.exists()
    ) {

      return {

        success: false,

        message:
          "Wallet Not Found"

      };

    }

    /* ======================================================
    UPDATE WALLET
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
          )
      }
    );

    /* ======================================================
    SAVE TASK REWARD
    ====================================================== */

    await addDoc(
      collection(
        db,
        "task_rewards"
      ),
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
          "task_reward",

        amount:
          data.rewardAmount,

        taskTitle:
          data.taskTitle,

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
        "Task Reward Added",

      message:
        `You earned ₹${data.rewardAmount} from ${data.taskTitle}.`,

      type:
        "reward"
    });

    return {

      success: true,

      message:
        "Task Reward Added"

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
