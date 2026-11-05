/**
 * Legacy client-side wallet credit path intentionally disabled.
 * Wallet and ledger mutations must be performed by a trusted Admin SDK
 * settlement service after the business rules and settlement authorization
 * have been verified. Do not reintroduce browser Firestore writes here.
 */
export type IncomeType =
  | "directIncome"
  | "levelIncome"
  | "rankIncome"
  | "cashback"
  | "reward"
  | "adRevenue";

export interface CreditWalletPayload {
  uid: string;
  amount: number;
  type: IncomeType;
  description: string;
  orderId?: string;
  triggeredByUid?: string;
  idempotencyKey?: string;
}

export interface CreditWalletResponse {
  success: false;
  code: "SERVER_SETTLEMENT_REQUIRED";
  message: string;
}

export async function creditWallet(_payload: CreditWalletPayload): Promise<CreditWalletResponse> {
  return {
    success: false,
    code: "SERVER_SETTLEMENT_REQUIRED",
    message: "Client-side wallet credits are disabled. Use the trusted server-side financial settlement pipeline.",
  };
}
