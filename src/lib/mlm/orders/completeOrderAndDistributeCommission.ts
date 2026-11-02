/**
 * Legacy client-side order financial finalization is intentionally disabled.
 * The authenticated Admin order-status API may mark delivery, but keeps
 * financialProcessingStatus=pending until a trusted Admin SDK settlement
 * service is configured and tested.
 */
export async function completeOrderAndDistributeCommission(_orderId: string) {
  return {
    success: false as const,
    code: "SERVER_SETTLEMENT_REQUIRED" as const,
    message: "Order delivery does not automatically issue cashback or MLM commission. Financial settlement is pending trusted server processing.",
  };
}
