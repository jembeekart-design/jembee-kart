"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import RewardProgressBar from "./RewardProgressBar";
import LiveCoinsAnimation from "./LiveCoinsAnimation";

interface VideoPlayerProps {
  videoUrl: string;
  rewardCoins: number;
  watchSeconds: number;
  isMuted?: boolean;
  active?: boolean;
}

export default function VideoPlayer({
  videoUrl,
  rewardCoins,
  watchSeconds,
  isMuted = true,
  active = false,
}: VideoPlayerProps) {
  const videoRef =
    useRef<HTMLVideoElement>(null);

  const [progress, setProgress] =
    useState(0);

  const [rewarded, setRewarded] =
    useState(false);

  const [showCoins, setShowCoins] =
    useState(false);

  const [showRewardToast, setShowRewardToast] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setProgress(0);
    setRewarded(false);
    setShowCoins(false);
    setShowRewardToast(false);

    if (active) {
      video.play().catch(() => {
        // Silent failure if play is prevented
      });
    } else {
      video.pause();
    }
  }, [active, videoUrl]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    let rewardToastTimeout: ReturnType<typeof setTimeout>;
    let coinsTimeout: ReturnType<typeof setTimeout>;

    if (videoRef.current && active && isPlaying) {
      interval = setInterval(() => {
        const current =
          videoRef.current?.currentTime || 0;

        const percent =
          (current / watchSeconds) * 100;

        setProgress(
          Math.min(percent, 100)
        );

        if (
          current >= watchSeconds &&
          !rewarded
        ) {
          setRewarded(true);
          setShowCoins(true);
          setShowRewardToast(true);

          coinsTimeout = setTimeout(() => {
            setShowCoins(false);
          }, 3000);

          rewardToastTimeout = setTimeout(() => {
            setShowRewardToast(false);
          }, 2000);
        }
      }, 500);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
      if (coinsTimeout) {
        clearTimeout(coinsTimeout);
      }
      if (rewardToastTimeout) {
        clearTimeout(rewardToastTimeout);
      }
    };
  }, [rewarded, watchSeconds, active, isPlaying]);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch(() => {
        // Silent failure if play is prevented
      });
    }
  };

  return (
    <div
      className="relative h-screen w-full overflow-hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* VIDEO */}

      <video
        ref={videoRef}
        src={videoUrl}
        muted={isMuted}
        loop
        playsInline
        onClick={togglePlayPause}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        className="h-full w-full object-cover cursor-pointer"
      />
      
      {/* PLAY/PAUSE OVERLAY ICON */}
      {!isPlaying && (
        <div 
          onClick={togglePlayPause}
          className="absolute inset-0 flex items-center justify-center z-30 cursor-pointer bg-black/20"
        >
          <div className="rounded-full bg-black/60 p-4 text-white text-3xl">
            ▶
          </div>
        </div>
      )}

      {/* OVERLAY */}

      <div
        className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none"
      />

      {/* REWARD PROGRESS (compact chip + bottom bars) */}

      <RewardProgressBar
        watchedVideos={Math.floor(progress)}
        requiredVideos={100}
        qualifiedSales={0}
        requiredSales={1}
        lockedReward={rewardCoins}
        cycleNumber={1}
        status={
          rewarded
            ? "completed"
            : "active"
        }
      />

      {/* LIVE COINS */}

      <LiveCoinsAnimation
        show={showCoins}
        coins={rewardCoins}
      />

      {/* REWARD CLAIMED TOAST (temporary) */}
      {showRewardToast && (
        <div className="fixed left-1/2 bottom-32 z-50 -translate-x-1/2 rounded-full bg-[var(--success-color)] px-5 py-2 text-sm font-black text-[var(--button-text-color)] shadow-2xl">
          Reward Claimed 🎉
        </div>
      )}
    </div>
  );
}
