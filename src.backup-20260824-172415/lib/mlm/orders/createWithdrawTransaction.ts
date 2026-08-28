import {
  collection,
  doc,
  runTransaction,
  Timestamp
} from "firebase/firestore";

import { db }
from "@/firebase/config";

interface CreateWithdrawTransactionData {
  userId: string;

  amount: number;

  method: string;

  accountNumber?: string;

  upiId?: string;
}

export async function
createWithdrawTransaction(
  data:
  CreateWithdrawTransactionData
) {

  try {

    const userRef =
      doc(
        db,
        "users",
        data.userId
      );

    await runTransaction(
      db,
      async (
        transaction
      ) => {

        const userSnap =
          await transaction.get(
            userRef
          );

        if (
          !userSnap.exists()
        ) {
          throw new Error(
            "User not found"
          );
        }

        const userData =
          userSnap.data();

        const walletBalance =
          typeof userData.walletBalance ===
          "number"
            ? userData.walletBalance
            : 0;

        const pendingWithdrawal =
          typeof userData.pendingWithdrawal ===
          "number"
            ? userData.pendingWithdrawal
            : 0;

        if (
          data.amount <= 0
        ) {
          throw new Error(
            "Invalid withdrawal amount"
          );
        }

        if (
          walletBalance <
          data.amount
        ) {
          throw new Error(
            "Insufficient wallet balance"
          );
        }

        const updatedWalletBalance =
          walletBalance -
          data.amount;

        const updatedPendingWithdrawal =
          pendingWithdrawal +
          data.amount;

        transaction.update(
          userRef,
          {
            walletBalance:
              updatedWalletBalance,

            pendingWithdrawal:
              updatedPendingWithdrawal
          }
        );

        const withdrawRef =
          doc(
            collection(
              db,
              "users",
              data.userId,
              "withdrawTransactions"
            )
          );

        transaction.set(
          withdrawRef,
          {
            withdrawalId:
              withdrawRef.id,

            userId:
              data.userId,

            type:
              "withdrawal",

            amount:
              data.amount,

            method:
              data.method,

            accountNumber:
              data.accountNumber ||
              null,

            upiId:
              data.upiId ||
              null,

            status:
              "pending",

            beforeWalletBalance:
              walletBalance,

            afterWalletBalance:
              updatedWalletBalance,

            createdAt:
              Timestamp.now()
          }
        );

        const adminWithdrawRef =
          doc(
            collection(
              db,
              "withdrawTransactions"
            )
          );

        transaction.set(
          adminWithdrawRef,
          {
            withdrawalId:
              adminWithdrawRef.id,

            userId:
              data.userId,

            type:
              "withdrawal",

            amount:
              data.amount,

            method:
              data.method,

            accountNumber:
              data.accountNumber ||
              null,

            upiId:
              data.upiId ||
              null,

            status:
              "pending",

            beforeWalletBalance:
              walletBalance,

            afterWalletBalance:
              updatedWalletBalance,

            createdAt:
              Timestamp.now()
          }
        );

        const walletTxRef =
          doc(
            collection(
              db,
              "users",
              data.userId,
              "walletTransactions"
            )
          );

        transaction.set(
          walletTxRef,
          {
            transactionId:
              walletTxRef.id,

            userId:
              data.userId,

            title:
              "Withdrawal Request",

            type:
              "withdrawal",

            amount:
              data.amount,

            status:
              "pending",

            walletType:
              "walletBalance",

            destinationWallet:
              "bank_account",

            beforeWalletBalance:
              walletBalance,

            afterWalletBalance:
              updatedWalletBalance,

            createdAt:
              Timestamp.now()
          }
        );
      }
    );

    return {
      success: true,

      message:
        "Withdrawal request submitted successfully"
    };

  } catch (error: any) {

    console.error(
      "Withdrawal Error:",
      error
    );

    return {
      success: false,

      message:
        error?.message ||
        "Withdrawal request failed"
    };
  }
}
