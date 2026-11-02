import { creditWallet } from "@/lib/mlm/creditWallet";

/**
 * Process cashback through the canonical wallet ledger.
 * The order-scoped idempotency key prevents duplicate cashback on delivery retries.
 */
export async function processCashback(
  userId: string,
  amount: number,
  orderId: string
) {
  const cleanUserId = userId?.trim();
  const cleanOrderId = orderId?.trim();
  const cashbackAmount = Number(amount);

  if (!cleanUserId || !cleanOrderId) {
    return { success: false, message: "Cashback requires a valid user ID and order ID." };
  }

  if (!Number.isFinite(cashbackAmount) || cashbackAmount < 0) {
    return { success: false, message: "Cashback amount must be a finite, non-negative number." };
  }

  if (cashbackAmount === 0) {
    return { success: true, message: "No cashback amount to process." };
  }

  return creditWallet({
    uid: cleanUserId,
    amount: cashbackAmount,
    type: "cashback",
    description: `Cashback processed for delivered Order ID: ${cleanOrderId}`,
    orderId: cleanOrderId,
    idempotencyKey: `${cleanOrderId}_CASHBACK`,
  });
}
