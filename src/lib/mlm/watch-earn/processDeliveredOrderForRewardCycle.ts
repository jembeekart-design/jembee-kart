/**
 * Watch & Earn monetary rewards are disabled by business policy.
 * Normal video playback and unrelated reward systems remain unchanged.
 */
export async function processDeliveredOrderForRewardCycle(_userId: string) {
  return {
    success: true,
    triggeredUnlock: false,
    disabled: true,
    message: "Video-watch monetary reward cycle is disabled.",
  };
}
