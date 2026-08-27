import { useMemo } from 'react';
import { WatchVideo } from "@/lib/mlm/watch-earn/fetchWatchVideos";

export interface FeedItem {
  readonly type: 'video';
  readonly id: string;
  readonly data: WatchVideo;
}

export interface UseFeedBuilderResult {
  readonly feedItems: ReadonlyArray<FeedItem>;
}

export function useFeedBuilder(
  videos: ReadonlyArray<WatchVideo>
): UseFeedBuilderResult {
  const feedItems = useMemo(() => {
    return videos.map((video) => ({
      type: 'video' as const,
      id: video.id,
      data: video,
    }));
  }, [videos]);

  return { feedItems };
}
