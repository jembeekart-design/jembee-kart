/**
 * Legacy browser-side MLM commission distribution is disabled.
 * Referral traversal, commission calculation, wallet credit, and immutable
 * ledger creation must run together in a trusted Admin SDK settlement service.
 */
export interface DistributeLevelCommissionData {
  userId: string;
  profitAmount: number;
  orderId: string;
  orderStatus: string;
}

export async function distributeLevelCommission(_data: DistributeLevelCommissionData) {
  return {
    success: false as const,
    code: "SERVER_SETTLEMENT_REQUIRED" as const,
    message: "Client-side MLM commission distribution is disabled until the trusted server settlement pipeline is enabled.",
  };
}
