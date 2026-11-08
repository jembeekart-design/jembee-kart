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
    message: "वीडियो देखने पर कमाई की सुविधा बंद है।",
  };
}
