import { processCashback } from "@/lib/mlm/financial/processCashback";

/**
 * Legacy cashback entry point retained for compatibility.
 * All balance mutations are delegated to the canonical order-idempotent ledger.
 */
export async function createCashbackReward(
  userId: string,
  orderAmount: number,
  orderId: string
) {
  const normalizedOrderAmount = Number(orderAmount);
  if (!Number.isFinite(normalizedOrderAmount) || normalizedOrderAmount <= 0) {
    return { success: false, message: "Order amount must be a finite positive number." };
  }

  const cashback = Math.floor(normalizedOrderAmount * 0.05);
  if (cashback <= 0) {
    return { success: true, cashback: 0, message: "Calculated cashback is zero." };
  }

  const result = await processCashback(userId, cashback, orderId);
  return { ...result, cashback: result.success ? cashback : 0 };
}
