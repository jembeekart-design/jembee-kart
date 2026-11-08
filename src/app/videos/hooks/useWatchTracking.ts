"use client";

export interface UseWatchTrackingProps {
  watchSeconds: number;
  onReward: () => void;
}

export default function useWatchTracking(_props: UseWatchTrackingProps) {
  return {
    watchedTime: 0,
    progress: 0,
    rewarded: false,
  };
}
