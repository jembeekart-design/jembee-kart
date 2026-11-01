/**
 * Legacy client-side payout intentionally disabled.
 * Client input is not authoritative for reward eligibility or amount.
 * Re-enable only after a server endpoint verifies the underlying event and
 * credits the wallet and ledger atomically with a deterministic idempotency key.
 */
interface CreateScratchCardRewardData {
  userId: string;
  rewardAmount: number;
  rewardTitle: string;
}

export async function createScratchCardReward(_data: CreateScratchCardRewardData) {
  return {
    success: false as const,
    message: "Scratch-card rewards are disabled until the server controls the card outcome and claim identifier.",
  };
}
