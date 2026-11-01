/**
 * Legacy client-side payout intentionally disabled.
 * Client input is not authoritative for reward eligibility or amount.
 * Re-enable only after a server endpoint verifies the underlying event and
 * credits the wallet and ledger atomically with a deterministic idempotency key.
 */
interface CreateProductReviewRewardData {
  userId: string;
  productId: string;
  review: string;
  rating: number;
  rewardAmount: number;
}

export async function createProductReviewReward(_data: CreateProductReviewRewardData) {
  return {
    success: false as const,
    message: "Review rewards are disabled until server-side purchase, review, and moderation checks are implemented.",
  };
}
