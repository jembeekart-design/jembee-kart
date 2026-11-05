/**
 * Legacy client-side payout intentionally disabled.
 * Client input is not authoritative for reward eligibility or amount.
 * Re-enable only after a server endpoint verifies the underlying event and
 * credits the wallet and ledger atomically with a deterministic idempotency key.
 */
interface CreateLuckySpinRewardData {
  userId: string;
  rewardAmount: number;
  rewardType: string;
}

export async function createLuckySpinReward(_data: CreateLuckySpinRewardData) {
  return {
    success: false as const,
    message: "Lucky-spin rewards are disabled until the server controls the spin outcome and claim identifier.",
  };
}
