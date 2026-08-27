import { adminDb } from "@/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { IncomeType } from "./creditWallet";

interface AdminCreditWalletPayload {
  uid: string;
  amount: number;
  type: IncomeType;
  description: string;
  orderId?: string;
  triggeredByUid?: string;
  // Admin transaction object
  transaction: any;
  // Deterministic ID for idempotency
  eventId: string;
}

/**
 * Admin SDK version of creditWallet to be used inside existing transactions.
 * Uses eventId for deterministic ledger entry ID.
 */
export async function adminCreditWallet(
  payload: AdminCreditWalletPayload
): Promise<void> {
  const { uid, amount, type, description, orderId, triggeredByUid, transaction, eventId } = payload;
  const userRef = adminDb.collection("users").doc(uid);
  const ledgerLogRef = adminDb.collection(`users/${uid}/transactions`).doc(eventId); // Idempotent ledger ID

  // Mapping type to subwallet field
  let subWalletIncrementField = "commissionWallet";
  if (type === "reward") subWalletIncrementField = "rewardWallet";
  else if (type === "cashback") subWalletIncrementField = "cashbackWallet";
  else if (type === "adRevenue") subWalletIncrementField = "commissionWallet";

  // Atomic update
  transaction.update(userRef, {
    walletBalance: FieldValue.increment(amount),
    [subWalletIncrementField]: FieldValue.increment(amount),
    totalIncome: FieldValue.increment(amount),
    todayIncome: FieldValue.increment(amount),
  });

  // Ledger entry
  transaction.set(ledgerLogRef, {
    transactionId: eventId,
    referenceOrderId: orderId || null,
    sourceTriggerUid: triggeredByUid || null,
    amount: amount,
    entryDirection: "credit",
    incomeCategory: type,
    allocatedWalletSlot: subWalletIncrementField,
    narrativeDescription: description,
    timestamp: FieldValue.serverTimestamp(),
  });
}
