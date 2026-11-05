import { getAdminDb } from "@/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { IncomeType } from "./creditWallet";

interface AdminCreditWalletPayload {
  uid: string;
  amount: number;
  type: IncomeType;
  description: string;
  orderId?: string;
  triggeredByUid?: string;
  // Firestore Admin transaction supplied by the caller.
  transaction: any;
  // Deterministic ledger document ID used for idempotency.
  eventId: string;
}

/**
 * Credit a wallet inside the caller's Firestore transaction.
 * The ledger document is read before any writes. A repeated matching event is
 * treated as already applied; a conflicting reuse of an event ID is rejected.
 */
export async function adminCreditWallet(payload: AdminCreditWalletPayload): Promise<boolean> {
  const { uid, amount, type, description, orderId, triggeredByUid, transaction, eventId } = payload;

  if (typeof uid !== "string" || !uid.trim() || uid.includes("/")) {
    throw new Error("INVALID_WALLET_UID");
  }
  if (typeof eventId !== "string" || !/^[A-Za-z0-9_-]{1,180}$/.test(eventId)) {
    throw new Error("INVALID_WALLET_EVENT_ID");
  }
  if (!Number.isFinite(amount) || amount <= 0 || !Number.isSafeInteger(Math.round(amount * 100))) {
    throw new Error("INVALID_WALLET_CREDIT_AMOUNT");
  }
  if (typeof description !== "string" || description.length > 300) {
    throw new Error("INVALID_WALLET_CREDIT_DESCRIPTION");
  }

  let subWalletIncrementField = "commissionWallet";
  if (type === "reward") subWalletIncrementField = "rewardWallet";
  else if (type === "cashback") subWalletIncrementField = "cashbackWallet";
  else if (type === "adRevenue") subWalletIncrementField = "commissionWallet";
  else throw new Error("UNSUPPORTED_WALLET_CREDIT_TYPE");

  const adminDb = getAdminDb();
  const userRef = adminDb.collection("users").doc(uid);
  const ledgerRef = adminDb.collection(`users/${uid}/transactions`).doc(eventId);

  // All transaction reads happen before writes, allowing safe retries.
  const [ledgerSnap, userSnap] = await Promise.all([
    transaction.get(ledgerRef),
    transaction.get(userRef),
  ]);

  if (ledgerSnap.exists) {
    const prior = ledgerSnap.data() || {};
    const sameEvent =
      prior.entryDirection === "credit" &&
      prior.incomeCategory === type &&
      prior.allocatedWalletSlot === subWalletIncrementField &&
      Math.round(Number(prior.amount) * 100) === Math.round(amount * 100);
    if (!sameEvent) throw new Error("WALLET_EVENT_ID_CONFLICT");
    return false;
  }
  if (!userSnap.exists) throw new Error("WALLET_USER_NOT_FOUND");

  transaction.update(userRef, {
    walletBalance: FieldValue.increment(amount),
    [subWalletIncrementField]: FieldValue.increment(amount),
    totalIncome: FieldValue.increment(amount),
    todayIncome: FieldValue.increment(amount),
  });

  transaction.create(ledgerRef, {
    transactionId: eventId,
    referenceOrderId: orderId || null,
    sourceTriggerUid: triggeredByUid || null,
    amount,
    entryDirection: "credit",
    incomeCategory: type,
    allocatedWalletSlot: subWalletIncrementField,
    narrativeDescription: description,
    timestamp: FieldValue.serverTimestamp(),
  });

  return true;
}
