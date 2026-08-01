import { fetchWatchVideos } from "@/lib/mlm/watch-earn/fetchWatchVideos";

export async function getWatchVideos() {
  return await fetchWatchVideos();
}
