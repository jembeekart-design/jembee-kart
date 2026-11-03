"use client";

import {
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";

interface VideoPlayerProps {
  videoUrl: string;
  isMuted?: boolean;
  active?: boolean;
  playbackRate?: number;
}

export default function VideoPlayer({
  videoUrl,
  isMuted = true,
  active = false,
  playbackRate = 1,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const optimizedVideoUrl = (() => {
    try {
      const url = new URL(videoUrl);

      if (
        url.hostname !== "res.cloudinary.com" ||
        !url.pathname.includes("/video/upload/")
      ) {
        return videoUrl;
      }

      const marker = "/video/upload/";
      const index = url.pathname.indexOf(marker);
      const before = url.pathname.slice(0, index + marker.length);
      const after = url.pathname.slice(index + marker.length);

      if (/^(q_auto|f_auto)(,|\/)/.test(after)) {
        return videoUrl;
      }

      url.pathname = before + "q_auto,f_auto/" + after;
      return url.toString();
    } catch {
      return videoUrl;
    }
  })();

  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [rotation, setRotation] = useState<0 | 90 | 180 | 270>(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = playbackRate;
  }, [playbackRate]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setProgress(0);
    setCurrentTime(0);
    setDuration(0);

    if (active) {
      video.play().catch(() => {});
      if (video.duration && !isNaN(video.duration)) {
        setDuration(video.duration);
      }
    } else {
      video.pause();
    }
  }, [active, videoUrl]);

  const togglePlayPause = (e?: React.SyntheticEvent) => {
    e?.stopPropagation();

    const video = videoRef.current;
    if (!video) return;

    setShowControls(true);

    if (!video.paused) {
      video.pause();
    } else {
      video.play().catch(() => {});
    }
  };

  const rotateVideo = () => {
    setRotation((current) => ((current + 90) % 360) as 0 | 90 | 180 | 270);
    setShowControls(true);
  };

  const seekBy = (seconds: number) => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration)) return;

    const nextTime = Math.max(0, Math.min(video.currentTime + seconds, video.duration));
    video.currentTime = nextTime;
    setCurrentTime(nextTime);
    setShowControls(true);
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;

    if (video && !isDragging) {
      setCurrentTime(video.currentTime);

      if (duration === 0 && video.duration > 0) {
        setDuration(video.duration);
      }

      if (video.duration > 0) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = useCallback(
    (clientX: number) => {
      if (!progressBarRef.current || !videoRef.current || duration === 0) return;

      const rect = progressBarRef.current.getBoundingClientRect();
      if (rect.width <= 0) return;

      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const seekTime = (x / rect.width) * duration;

      videoRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
      setProgress((seekTime / duration) * 100);
    },
    [duration],
  );

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

  const handleVideoKeyDown = (e: React.KeyboardEvent<HTMLVideoElement>) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      seekBy(-10);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      seekBy(10);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      seekBy(30);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      seekBy(-30);
    } else if (e.key === " " || e.key === "Enter" || e.key === "MediaPlayPause") {
      e.preventDefault();
      togglePlayPause();
    } else if (e.key.toLowerCase() === "r") {
      e.preventDefault();
      rotateVideo();
    }
  };

  const handleSeekKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      seekBy(-10);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      seekBy(10);
    } else if (e.key === "Home") {
      e.preventDefault();
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        setCurrentTime(0);
      }
    } else if (e.key === "End") {
      e.preventDefault();
      if (videoRef.current && duration > 0) {
        videoRef.current.currentTime = duration;
        setCurrentTime(duration);
      }
    }
  };

  const rotated = rotation === 90 || rotation === 270;

  return (
    <div
      className="relative h-screen w-full overflow-hidden bg-black"
      onClick={() => setShowControls(true)}
    >
      {/* VIDEO */}
      <video
        ref={videoRef}
        src={optimizedVideoUrl}
        preload={active ? "auto" : "none"}
        muted={isMuted}
        loop
        playsInline
        tabIndex={0}
        aria-label="Video player. Use arrow keys to seek and R to rotate."
        onKeyDown={handleVideoKeyDown}
        onClick={togglePlayPause}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        className="absolute bg-black object-contain cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
        style={
          rotated
            ? {
                left: "50%",
                top: "50%",
                width: "100vh",
                height: "100vw",
                maxWidth: "none",
                transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
              }
            : {
                inset: 0,
                width: "100%",
                height: "100%",
                transform: `rotate(${rotation}deg)`,
              }
        }
      />

      {/* OVERLAY */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

      {/* PLAY / PAUSE OVERLAY */}
      {!isPlaying && (
        <button
          type="button"
          aria-label="Play video"
          onClick={togglePlayPause}
          className="absolute inset-0 z-30 flex items-center justify-center cursor-pointer"
        >
          <span className="rounded-full bg-black/60 p-4 text-white text-3xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">
            ▶
          </span>
        </button>
      )}

      {/* TV REMOTE AND TOUCH CONTROLS */}
      {showControls && (
        <div className="absolute bottom-[calc(2rem+env(safe-area-inset-bottom))] left-4 right-4 z-50 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={togglePlayPause}
            aria-label={isPlaying ? "Pause video" : "Play video"}
            className="rounded-full bg-black/70 px-4 py-3 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          >
            {isPlaying ? "❚❚" : "▶"}
          </button>

          <button
            type="button"
            onClick={() => seekBy(-10)}
            aria-label="Rewind 10 seconds"
            className="rounded-full bg-black/70 px-4 py-3 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          >
            ↶ 10s
          </button>

          <button
            type="button"
            onClick={() => seekBy(10)}
            aria-label="Forward 10 seconds"
            className="rounded-full bg-black/70 px-4 py-3 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          >
            10s ↷
          </button>

          <button
            type="button"
            onClick={rotateVideo}
            aria-label={`Rotate video. Current rotation ${rotation} degrees`}
            className="rounded-full bg-black/70 px-4 py-3 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          >
            ↻ {rotation}°
          </button>
        </div>
      )}

      {/* SEEK BAR */}
      {showControls && duration > 0 && (
        <div
          ref={progressBarRef}
          role="slider"
          aria-label="Video progress"
          aria-valuemin={0}
          aria-valuemax={Math.floor(duration)}
          aria-valuenow={Math.floor(currentTime)}
          aria-valuetext={`${Math.floor(currentTime)} of ${Math.floor(duration)} seconds`}
          tabIndex={0}
          onKeyDown={handleSeekKeyDown}
          className="absolute bottom-[calc(6rem+env(safe-area-inset-bottom))] left-4 right-4 h-6 flex items-center z-50 touch-none cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={(e) => {
            e.stopPropagation();
            handleSeek(e.clientX);
          }}
        >
          <div className="relative w-full h-1 bg-white/30 rounded-full">
            <div
              className="absolute h-full bg-white rounded-full"
              style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
            />
            <div
              className="absolute top-1/2 -mt-2.5 w-5 h-5 bg-white rounded-full shadow-lg"
              style={{ left: `calc(${duration > 0 ? (currentTime / duration) * 100 : 0}% - 10px)` }}
            />
          </div>
        </div>
      )}

      {/* REWARD PROGRESS (compact chip + bottom bars) */}
    </div>
  );
}
