/**
 * Legacy client-side delivery payout orchestration is disabled.
 * Delivery state is managed by the authenticated Admin API. Financial
 * settlement must be a separate, trusted server-side operation.
 */
export async function onOrderDelivered(_orderId: string, _userId: string) {
  return {
    success: false as const,
    status: "FINANCIAL_SETTLEMENT_PENDING" as const,
    code: "SERVER_SETTLEMENT_REQUIRED" as const,
    error: "Client-side delivery rewards and MLM payouts are disabled until the trusted server settlement pipeline is available.",
  };
}
