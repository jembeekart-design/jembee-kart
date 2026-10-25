"use client";

import { auth } from "@/firebase/config";
import {
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";

interface VideoPlayerProps {
  videoUrl: string;
  videoId?: string;
  isMuted?: boolean;
  active?: boolean;
  playbackRate?: number;
}

export default function VideoPlayer({
  videoUrl,
  videoId,
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
  const watchSessionId = useRef("");
  const lastMediaTime = useRef(0);
  const pendingWatchSeconds = useRef(0);
  const watchDisabled = useRef(false);

  useEffect(() => {
    watchSessionId.current = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }, [videoUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = playbackRate;
  }, [playbackRate]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setProgress(0);
    lastMediaTime.current = 0;
    pendingWatchSeconds.current = 0;
    watchDisabled.current = false;

    if (active) {
      video.play().catch(() => {});
      if (video.duration && !isNaN(video.duration)) {
        setDuration(video.duration);
      }
    } else {
      video.pause();
    }
  }, [active, videoUrl]);

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

  const handleTimeUpdate = async () => {
    const video = videoRef.current;
    if (!video) return;
    if (!isDragging) setCurrentTime(video.currentTime);
    if (duration === 0 && video.duration > 0) setDuration(video.duration);

    // Count only the first forward playback pass of a video for this mounted
    // player. A loop/rewind disables further counting; the API also deduplicates
    // by viewer + video so reopening the same video cannot count it again.
    if (!active || video.paused || watchDisabled.current || !auth.currentUser) {
      lastMediaTime.current = video.currentTime;
      return;
    }
    const current = video.currentTime;
    const previous = lastMediaTime.current;
    lastMediaTime.current = current;
    if (current + 0.15 < previous) {
      watchDisabled.current = true;
      return;
    }
    const delta = current - previous;
    if (delta > 0 && delta < 2) pendingWatchSeconds.current += delta;
    if (pendingWatchSeconds.current >= 15) {
      const seconds = 15;
      pendingWatchSeconds.current -= seconds;
      try {
        const user = auth.currentUser;
        if (!user) return;
        const token = await user.getIdToken();
        const shareBy = new URLSearchParams(window.location.search).get("shareBy");
        if (!shareBy || !/^[a-zA-Z0-9_-]{1,180}$/.test(shareBy)) return;
        await fetch("/api/share-center", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ type: "watch", videoId: videoId || videoUrl.split("/").pop()?.split("?")[0] || "video", seconds, sessionId: watchSessionId.current, shareOwnerId: shareBy || user.uid }),
        });
      } catch (error) { console.error("Watch time event failed", error); }
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
          className="absolute bottom-[calc(6rem+env(safe-area-inset-bottom))] left-4 right-4 h-6 flex items-center z-50 touch-none"
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
