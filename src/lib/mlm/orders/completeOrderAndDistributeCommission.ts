import {
doc,
getDoc,
updateDoc,
increment,
serverTimestamp,
setDoc,
collection
} from "firebase/firestore";

import { db } from "@/firebase/config";

import { createNotification } from "./createNotification";

interface CreditWalletData {
uid: string;

amount: number;

incomeType:
| "cashback"
| "directIncome"
| "levelIncome"
| "rankIncome";
}

export async function creditWallet(
data: CreditWalletData
) {
try {
/* =========================
VALIDATION
========================= */

if (!data.uid?.trim()) {
  return {
    success: false,
    message: "User ID Required"
  };
}

if (
  !data.amount ||
  data.amount <= 0
) {
  return {
    success: false,
    message: "Invalid Amount"
  };
}

/* =========================
   USER CHECK
========================= */

const userRef = doc(
  db,
  "users",
  data.uid
);

const userSnap =
  await getDoc(userRef);

if (!userSnap.exists()) {
  return {
    success: false,
    message: "User Not Found"
  };
}

/* =========================
   UPDATE DATA
========================= */

const updateData: Record<
  string,
  any
> = {
  totalIncome:
    increment(data.amount),

  todayIncome:
    increment(data.amount),

  updatedAt:
    serverTimestamp()
};

let walletType =
  "";

let title =
  "";

/* =========================
   CASHBACK
========================= */

if (
  data.incomeType ===
  "cashback"
) {
  updateData.cashbackWallet =
    increment(data.amount);

  walletType =
    "cashbackWallet";

  title =
    "Cashback Credited";
}

/* =========================
   DIRECT INCOME
========================= */

if (
  data.incomeType ===
  "directIncome"
) {
  updateData.commissionWallet =
    increment(data.amount);

  updateData.walletBalance =
    increment(data.amount);

  walletType =
    "commissionWallet";

  title =
    "Direct Income Credited";
}

/* =========================
   LEVEL INCOME
========================= */

if (
  data.incomeType ===
  "levelIncome"
) {
  updateData.commissionWallet =
    increment(data.amount);

  updateData.walletBalance =
    increment(data.amount);

  walletType =
    "commissionWallet";

  title =
    "Level Income Credited";
}

/* =========================
   RANK INCOME
========================= */

if (
  data.incomeType ===
  "rankIncome"
) {
  updateData.rewardWallet =
    increment(data.amount);

  updateData.walletBalance =
    increment(data.amount);

  walletType =
    "rewardWallet";

  title =
    "Rank Reward Credited";
}

/* =========================
   UPDATE USER
========================= */

await updateDoc(
  userRef,
  updateData
);

/* =========================
   WALLET TRANSACTION
========================= */

const txRef = doc(
  collection(
    db,
    "users",
    data.uid,
    "walletTransactions"
  )
);

await setDoc(
  txRef,
  {
    transactionId:
      txRef.id,

    userId:
      data.uid,

    title,

    amount:
      data.amount,

    type:
      data.incomeType,

    status:
      "success",

    walletType,

    createdAt:
      serverTimestamp()
  }
);

/* =========================
   NOTIFICATION
========================= */

await createNotification({
  userId:
    data.uid,

  title,

  message:
    `₹${data.amount} credited successfully.`,

  type:
    data.incomeType ===
    "rankIncome"
      ? "reward"
      : "commission"
});

return {
  success: true
};

} catch (error) {

console.error(
  "creditWallet Error:",
  error
);

return {
  success: false,
  message:
    "Wallet credit failed"
};

}
}
