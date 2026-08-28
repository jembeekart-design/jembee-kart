// Proposed src/scripts/test-mlm.ts

import { 
  connectFirestoreEmulator, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getCountFromServer,
  query,
  where
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { createDailyPassiveIncome } from "@/lib/mlm/orders/createDailyPassiveIncome";
import { creditWallet } from "@/lib/mlm/creditWallet";

// Connect to local emulator
connectFirestoreEmulator(db, "127.0.0.1", 8080);

async function runTest() {
  console.log("Starting emulator test...");
  const userId = "emulator-user-001";
  const userRef = doc(db, "users", userId);

  try {
    // 1. Seed user in emulator
    await setDoc(userRef, { 
      walletBalance: 0, 
      isActive: true, 
      joinedPackage: true 
    });
    console.log("Seeded user.");

    // 2. Test createDailyPassiveIncome Idempotency
    console.log("Testing createDailyPassiveIncome...");
    await createDailyPassiveIncome({ userId, amount: 100 });
    await createDailyPassiveIncome({ userId, amount: 100 }); // Second call, should fail silently (or return success:false)

    const userSnap = await getDoc(userRef);
    const balance = userSnap.data()?.walletBalance;
    if (balance !== 100) throw new Error(`Balance mismatch after passive income: expected 100, got ${balance}`);

    const historyRef = collection(db, "dailyPassiveIncomeHistory");
    const qHistory = query(historyRef, where("userId", "==", userId));
    const historySnap = await getCountFromServer(qHistory);
    if (historySnap.data().count !== 1) throw new Error(`History count mismatch: expected 1, got ${historySnap.data().count}`);
    console.log("createDailyPassiveIncome passed.");

    // 3. Test creditWallet Idempotency
    console.log("Testing creditWallet...");
    const orderId = "order-test-1";
    await creditWallet({
      uid: userId,
      amount: 50,
      type: "cashback",
      description: "Test cashback",
      orderId
    });
    await creditWallet({
      uid: userId,
      amount: 50,
      type: "cashback",
      description: "Test cashback",
      orderId
    }); // Second call, should be idempotent

    const userSnap2 = await getDoc(userRef);
    const balance2 = userSnap2.data()?.walletBalance;
    // Expected: 100 (from passive income) + 50 (from first cashback) = 150
    if (balance2 !== 150) throw new Error(`Balance mismatch after cashback: expected 150, got ${balance2}`);

    const txRef = collection(db, `users/${userId}/transactions`);
    const qTx = query(txRef, where("referenceOrderId", "==", orderId));
    const txSnap = await getCountFromServer(qTx);
    if (txSnap.data().count !== 1) throw new Error(`Transaction count mismatch: expected 1, got ${txSnap.data().count}`);
    
    console.log("creditWallet passed.");
    console.log("ALL TESTS PASSED");
    process.exit(0);

  } catch (error) {
    console.error("TEST FAILED:", error);
    process.exit(1);
  }
}

runTest();
