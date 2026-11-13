/**
 * Detects a second provider payment identity for an order already recorded paid.
 * The caller must persist the review marker transactionally and must not grant
 * another entitlement or append settlement rows for the new payment.
 */
export function isPaidOrderDuplicatePayment(orderStatus, recordedPaymentId, incomingPaymentId) {
  const incoming = typeof incomingPaymentId === "string" ? incomingPaymentId.trim() : "";
  if (orderStatus !== "paid" || !incoming) return false;
  const recorded = typeof recordedPaymentId === "string" || typeof recordedPaymentId === "number"
    ? String(recordedPaymentId).trim()
    : "";
  return recorded !== incoming;
}
