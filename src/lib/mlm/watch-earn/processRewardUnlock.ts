/**
 * Legacy video-watch reward unlocking is intentionally disabled.
 * Normal video playback, uploads, moderation, MLM and referral rewards are separate.
 */
export async function processRewardUnlock(_userId: string, _cycleId: string) {
  return {
    success: false as const,
    message: "वीडियो देखने पर मिलने वाला मौद्रिक पुरस्कार बंद है।",
  };
}
