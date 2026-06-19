import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/firebase/config";

export interface CreateWatchTransactionData {
  userId: string;

  videoId?: string;

  amount: number;

  cycleNumber: number;

  type:
    | "reward_locked"
    | "reward_unlocked";

  status:
    | "pending"
    | "completed";
}

export async function createWatchTransaction({
  userId,
  videoId,
  amount,
  cycleNumber,
  type,
  status,
}: CreateWatchTransactionData) {
  try {
    if (!userId) {
      throw new Error(
        "User ID is required"
      );
    }

    if (amount <= 0) {
      throw new Error(
        "Amount must be greater than 0"
      );
    }

    const docRef = await addDoc(
      collection(
        db,
        "watchTransactions"
      ),
      {
        userId,

        videoId:
          videoId ?? null,

        amount,

        cycleNumber,

        type,

        status,

        source:
          "watch-earn",

        createdAt:
          serverTimestamp(),
      }
    );

    return {
      success: true,
      transactionId:
        docRef.id,
    };
  } catch (error) {
    console.error(
      "WATCH TRANSACTION ERROR:",
      error
    );

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to create watch transaction",
    };
  }
}
