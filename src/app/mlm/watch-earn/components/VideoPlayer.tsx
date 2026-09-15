"use client";

import {
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";

interface VideoPlayerProps {
  videoUrl: string;
  watchSeconds: number;
  isMuted?: boolean;
  active?: boolean;
  playbackRate?: number;
}

export default function VideoPlayer({
  videoUrl,
  watchSeconds,
  isMuted = true,
  active = false,
  playbackRate = 1,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = playbackRate;
  }, [playbackRate]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setProgress(0);

    if (active) {
      video.play().catch(() => {});
      if (video.duration && !isNaN(video.duration)) {
        setDuration(video.duration);
      }
    } else {
      video.pause();
    }
  }, [active, videoUrl]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (videoRef.current && active && isPlaying) {
      interval = setInterval(() => {
        const current = videoRef.current?.currentTime || 0;
        const percent = (current / watchSeconds) * 100;
        setProgress(Math.min(percent, 100));
      }, 500);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [watchSeconds, active, isPlaying]);

  const togglePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    setShowControls(true);
    if (!video.paused) {
      video.pause();
    } else {
      video.play().catch(() => {});
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && !isDragging) {
      setCurrentTime(videoRef.current.currentTime);
      if (duration === 0 && videoRef.current.duration > 0) {
        setDuration(videoRef.current.duration);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = useCallback((clientX: number) => {
    if (!progressBarRef.current || !videoRef.current || duration === 0) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const seekTime = (x / rect.width) * duration;

    videoRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  }, [duration]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    handleSeek(e.touches[0].clientX);
    e.stopPropagation();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging) {
      handleSeek(e.touches[0].clientX);
      e.stopPropagation();
      e.preventDefault();
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <div
      className="relative h-screen w-full overflow-hidden"
      onClick={() => setShowControls(true)}
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
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        className="absolute inset-0 h-full w-full object-cover cursor-pointer bg-black"
      />

      {/* OVERLAY */}

      <div
        className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none"
      />

      {/* PLAY/PAUSE OVERLAY ICON */}
      {!isPlaying && (
        <div
          onClick={togglePlayPause}
          className="absolute inset-0 flex items-center justify-center z-30 cursor-pointer"
        >
          <div className="rounded-full bg-black/60 p-3 text-white text-2xl">
            ▶
          </div>
        </div>
      )}

      {/* SEEK BAR */}
      {showControls && duration > 0 && (
        <div
          ref={progressBarRef}
          className="absolute bottom-24 left-4 right-4 h-6 flex items-center z-50 touch-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={(e) => { e.stopPropagation(); handleSeek(e.clientX); }}
        >
          <div className="relative w-full h-1 bg-white/30 rounded-full">
            <div
              className="absolute h-full bg-white rounded-full"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
            <div
              className="absolute top-1/2 -mt-2.5 w-5 h-5 bg-white rounded-full shadow-lg"
              style={{ left: `calc(${(currentTime / duration) * 100}% - 10px)` }}
            />
          </div>
        </div>
      )}

      {/* REWARD PROGRESS (compact chip + bottom bars) */}
    </div>
  );
}
