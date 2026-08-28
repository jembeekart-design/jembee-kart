"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

interface VideoPlayerProps {
  videoUrl: string;
  watchSeconds: number;
  isMuted?: boolean;
  active?: boolean;
}

export default function VideoPlayer({
  videoUrl,
  watchSeconds,
  isMuted = true,
  active = false,
}: VideoPlayerProps) {
  const videoRef =
    useRef<HTMLVideoElement>(null);

  const [progress, setProgress] =
    useState(0);

  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setProgress(0);

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

    if (videoRef.current && active && isPlaying) {
      interval = setInterval(() => {
        const current =
          videoRef.current?.currentTime || 0;

        const percent =
          (current / watchSeconds) * 100;

        setProgress(
          Math.min(percent, 100)
        );
      }, 500);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [watchSeconds, active, isPlaying]);

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
    </div>
  );
}
