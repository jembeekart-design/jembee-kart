interface TrackVideoWatchData {
  userId: string;
  videoId: string;
  watchedSeconds: number;
}

export async function trackVideoWatch(
  _data: TrackVideoWatchData
) {
  return {
    success: false,
    message: "वीडियो देखने के आधार पर रिवॉर्ड ट्रैकिंग बंद है।",
  };
}
