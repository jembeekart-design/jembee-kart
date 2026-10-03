interface CreateWatchRewardData {
  userId: string;
  videoId: string;
  watchSeconds: number;
}

export async function createWatchReward(
  _data: CreateWatchRewardData
) {
  return {
    success: false,
    message: "Watch & Earn reward system is disabled.",
  };
}
