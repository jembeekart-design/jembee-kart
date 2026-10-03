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
    message: "Video watch tracking for rewards is disabled.",
  };
}
