import { useState, useCallback } from 'react';

export interface UseRewardTrackerResult {
  readonly rewardedVideoIds: ReadonlySet<string>;
  readonly canEarnReward: (videoId: string) => boolean;
  readonly markVideoRewarded: (videoId: string) => void;
  readonly resetRewardTracker: () => void;
}

export function useRewardTracker(): UseRewardTrackerResult {
  const [rewardedVideoIds, setRewardedVideoIds] = useState<Set<string>>(new Set());

  const canEarnReward = useCallback((videoId: string) => {
    return !rewardedVideoIds.has(videoId);
  }, [rewardedVideoIds]);

  const markVideoRewarded = useCallback((videoId: string) => {
    setRewardedVideoIds((prev) => {
      if (prev.has(videoId)) return prev;
      const next = new Set(prev);
      next.add(videoId);
      return next;
    });
  }, []);

  const resetRewardTracker = useCallback(() => {
    setRewardedVideoIds(new Set());
  }, []);

  return {
    rewardedVideoIds,
    canEarnReward,
    markVideoRewarded,
    resetRewardTracker
  };
}
