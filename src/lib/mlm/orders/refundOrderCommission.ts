import {
doc,
getDoc,
updateDoc,
increment,
setDoc,
serverTimestamp,
collection
} from "firebase/firestore";

import { db } from "@/firebase/config";

interface RefundOrderCommissionData {
orderId: string;
}

export async function refundOrderCommission(
data: RefundOrderCommissionData
) {
try {
const orderRef = doc(
db,
"orders",
data.orderId
);

const orderSnap =
  await getDoc(orderRef);

if (!orderSnap.exists()) {
  return {
    success: false,
    message: "Order not found"
  };
}

const order =
  orderSnap.data();

if (
  order.commissionRefunded === true
) {
  return {
    success: false,
    message:
      "Commission already refunded"
  };
}

const buyerId =
  order.userId;

const amount =
  Number(
    order.totalAmount || 0
  );

/* =========================
   MLM REVERSE
========================= */

const levels = [
  { level: 1, amount: 20 },
  { level: 2, amount: 10 },
  { level: 3, amount: 5 },
  { level: 4, amount: 5 }
];

let currentUserId =
  buyerId;

for (const item of levels) {

  const userRef = doc(
    db,
    "users",
    currentUserId
  );

  const userSnap =
    await getDoc(userRef);

  if (!userSnap.exists()) {
    break;
  }

  const userData =
    userSnap.data();

  const sponsorId =
    userData.sponsorId;

  if (!sponsorId) {
    break;
  }

  await updateDoc(
    doc(
      db,
      "users",
      sponsorId
    ),
    {
      walletBalance:
        increment(
          -item.amount
        ),

      commissionWallet:
        increment(
          -item.amount
        ),

      totalIncome:
        increment(
          -item.amount
        )
    }
  );

  const txRef = doc(
    collection(
      db,
      "users",
      sponsorId,
      "walletTransactions"
    )
  );

  await setDoc(
    txRef,
    {
      transactionId:
        txRef.id,

      userId:
        sponsorId,

      orderId:
        data.orderId,

      amount:
        item.amount,

      type:
        "commission_refund",

      status:
        "success",

      title:
        `Level ${item.level} Commission Reversed`,

      createdAt:
        serverTimestamp()
    }
  );

  currentUserId =
    sponsorId;
}

/* =========================
   CASHBACK REVERSE
========================= */

if (amount >= 1000) {

  await updateDoc(
    doc(
      db,
      "users",
      buyerId
    ),
    {
      cashbackWallet:
        increment(-50),

      totalIncome:
        increment(-50)
    }
  );
}

/* =========================
   ORDER UPDATE
========================= */

await updateDoc(
  orderRef,
  {
    commissionRefunded:
      true,

    refundedAt:
      serverTimestamp()
  }
);

return {
  success: true
};

} catch (error) {

console.error(
  "refundOrderCommission Error:",
  error
);

return {
  success: false,
  message:
    "Refund failed"
};

}
}
