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
}

export default function VideoPlayer({
  videoUrl,
  rewardCoins,
  watchSeconds,
}: VideoPlayerProps) {
  const videoRef =
    useRef<HTMLVideoElement>(null);

  const [progress, setProgress] =
    useState(0);

  const [rewarded, setRewarded] =
    useState(false);

  const [showCoins, setShowCoins] =
    useState(false);
    
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (videoRef.current) {
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

          setTimeout(() => {
            setShowCoins(false);
          }, 3000);
        }
      }, 500);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [rewarded, watchSeconds]);

  return (
    <div
      className="
        relative
        h-screen
        w-full
        overflow-hidden
      "
    >
      {/* VIDEO */}

      <video
        ref={videoRef}
        src={videoUrl}
        autoPlay
        muted={isMuted}
        loop
        playsInline
        className="
          h-full
          w-full
          object-cover
        "
      />
      
      {/* MUTE TOGGLE */}
      <button
        onClick={() => setIsMuted(!isMuted)}
        className="absolute right-4 bottom-4 z-40 rounded-full bg-black/50 p-2 text-white"
      >
        {isMuted ? "🔇" : "🔊"}
      </button>

      {/* OVERLAY */}

      <div
        className="
          absolute
          inset-0
          bg-gradient-to-t
          from-black/80
          via-transparent
          to-black/30
        "
      />

      {/* REWARD PROGRESS */}

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

      {/* REWARD CLAIMED */}

      {rewarded && (
        <div
          className="
            absolute
            bottom-40
            left-1/2
            z-50
            -translate-x-1/2
            rounded-full
            bg-[var(--success-color)]
            px-6
            py-3
            text-sm
            font-black
            text-[var(--button-text-color)]
            shadow-2xl
          "
        >
          Reward Claimed 🎉
        </div>
      )}
    </div>
  );
}
