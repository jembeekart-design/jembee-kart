import {
  fetchWatchVideos,
  type WatchVideo,
} from "@/lib/videos/watch-earn/fetchWatchVideos";

export type { WatchVideo };

export async function getWatchVideos() {
  return await fetchWatchVideos();
}
