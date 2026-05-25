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

interface DailyRewardData {

  userId: string;

}

export async function claimDailyReward(
  data: DailyRewardData
) {

  try {

    /* ======================================================
    TODAY DATE
    ====================================================== */

    const today =
      new Date()
        .toISOString()
        .split("T")[0];

    /* ======================================================
    CHECK EXISTING CLAIM
    ====================================================== */

    const rewardRef =
      doc(
        db,
        "daily_rewards",
        `${data.userId}_${today}`
      );

    const rewardSnapshot =
      await getDoc(
        rewardRef
      );

    if (
      rewardSnapshot.exists()
    ) {

      return {

        success: false,

        message:
          "Daily reward already claimed"

      };

    }

    /* ======================================================
    RANDOM REWARD
    ====================================================== */

    const rewardAmount =
      Math.floor(
        Math.random() * 91
      ) + 10;

    /* ======================================================
    GET WALLET
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
            rewardAmount
          ),

        bonusBalance:
          increment(
            rewardAmount
          ),

        totalEarnings:
          increment(
            rewardAmount
          )
      }
    );

    /* ======================================================
    SAVE DAILY REWARD
    ====================================================== */

    await addDoc(
      collection(
        db,
        "daily_rewards"
      ),
      {
        userId:
          data.userId,

        rewardAmount,

        rewardDate:
          today,

        status:
          "claimed",

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
          "daily_reward",

        amount:
          rewardAmount,

        status:
          "success",

        createdAt:
          Date.now()
      }
    );

    /* ======================================================
    NOTIFICATION
    ====================================================== */

    await createNotification({
      userId:
        data.userId,

      title:
        "Daily Reward Claimed",

      message:
        `You received ₹${rewardAmount} daily reward.`,

      type:
        "reward"
    });

    return {

      success: true,

      rewardAmount,

      message:
        "Daily reward claimed"

    };

  } catch (error) {

    console.error(
      "DAILY REWARD ERROR:",
      error
    );

    return {

      success: false,

      message:
        "Something went wrong"

    };

  }

}
