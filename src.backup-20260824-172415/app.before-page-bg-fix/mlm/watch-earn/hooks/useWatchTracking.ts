"use client";

import {
  useEffect,
  useState
} from "react";

interface UseWatchTrackingProps {

  watchSeconds: number;

  onReward: () => void;

}

export default function
useWatchTracking({
  watchSeconds,
  onReward
}: UseWatchTrackingProps) {

  const [
    watchedTime,
    setWatchedTime
  ] = useState(0);

  const [
    rewarded,
    setRewarded
  ] = useState(false);

  useEffect(() => {

    let interval:
      NodeJS.Timeout;

    interval =
      setInterval(() => {

        setWatchedTime(
          (prev) => {

            const updated =
              prev + 1;

            /* =====================
               REWARD
            ===================== */

            if (
              updated >=
                watchSeconds &&
              !rewarded
            ) {

              setRewarded(
                true
              );

              onReward();
            }

            return updated;
          }
        );

      }, 1000);

    return () => {

      clearInterval(
        interval
      );
    };

  }, [
    rewarded,
    watchSeconds,
    onReward
  ]);

  const progress =
    Math.min(
      (
        watchedTime /
        watchSeconds
      ) * 100,
      100
    );

  return {
    watchedTime,
    progress,
    rewarded
  };
}
