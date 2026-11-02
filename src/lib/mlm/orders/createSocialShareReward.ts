/**
 * Legacy client-side payout intentionally disabled.
 * Client input is not authoritative for reward eligibility or amount.
 * Re-enable only after a server endpoint verifies the underlying event and
 * credits the wallet and ledger atomically with a deterministic idempotency key.
 */
interface CreateSocialShareRewardData {
  userId: string;
  platform: string;
  rewardAmount: number;
}

export async function createSocialShareReward(_data: CreateSocialShareRewardData) {
  return {
    success: false as const,
    message: "Social-share rewards are disabled until a trusted share-verification endpoint is implemented.",
  };
}
