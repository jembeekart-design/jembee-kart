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
  watchSessionVideoId?: string;
  isMuted?: boolean;
  active?: boolean;
  playbackRate?: number;
  onNinetyPercentWatched?: () => void;
  poster?: string;
  preloadMetadata?: boolean;
}

export default function VideoPlayer({
  videoUrl,
  watchSessionVideoId,
  isMuted = true,
  active = false,
  playbackRate = 1,
  onNinetyPercentWatched,
  poster,
  preloadMetadata = false,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const lastMediaTimeRef = useRef<number | null>(null);
  const lastWallTimeRef = useRef<number | null>(null);
  const watchedMediaSecondsRef = useRef(0);
  const ninetyPercentReportedRef = useRef(false);

  // Server-time telemetry only: never a reward or human-view verification signal.
  useEffect(() => {
    if (!active || !isPlaying || !watchSessionVideoId) return;
    let cancelled = false;
    let sessionId: string | null = null;
    let heartbeatTimer: ReturnType<typeof setInterval> | null = null;

    const saveProgress = async (currentSessionId: string) => {
      const user = auth.currentUser;
      const positionSeconds = videoRef.current?.currentTime;
      if (!user || typeof positionSeconds !== "number" || !Number.isFinite(positionSeconds)) return;
      try {
        const token = await user.getIdToken();
        await fetch("/api/shorts/watch-progress", {
          method: "POST",
          cache: "no-store",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ sessionId: currentSessionId, positionSeconds }),
        });
      } catch {
        // Resume progress is best-effort and never blocks playback.
      }
    };

    const send = async (action: "start" | "heartbeat" | "stop", currentSessionId?: string) => {
      const user = auth.currentUser;
      if (!user) return null;
      try {
        const token = await user.getIdToken();
        const response = await fetch("/api/shorts/watch-session", {
          method: "POST",
          cache: "no-store",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(action === "start"
            ? { action, videoId: watchSessionVideoId }
            : { action, sessionId: currentSessionId }),
        });
        if (!response.ok) return null;
        return await response.json() as { sessionId?: string; success?: boolean };
      } catch {
        return null;
      }
    };

    void (async () => {
      const result = await send("start");
      if (cancelled) {
        if (result?.sessionId) void send("stop", result.sessionId);
        return;
      }
      if (!result?.sessionId) return;
      sessionId = result.sessionId;
      heartbeatTimer = setInterval(() => {
        if (sessionId) void send("heartbeat", sessionId);
      }, 10000);
    })();

    return () => {
      cancelled = true;
      if (heartbeatTimer) clearInterval(heartbeatTimer);
      if (sessionId) {
        void (async () => {
          await saveProgress(sessionId!);
          await send("stop", sessionId!);
        })();
      }
    };
  }, [active, isPlaying, watchSessionVideoId]);



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

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = playbackRate;
  }, [playbackRate]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setProgress(0);
    watchedMediaSecondsRef.current = 0;
    ninetyPercentReportedRef.current = false;
    lastMediaTimeRef.current = null;
    lastWallTimeRef.current = null;

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

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;

    const mediaTime = video.currentTime;
    const wallTime = Date.now();

    if (active && !video.paused && !video.seeking) {
      const previousMediaTime = lastMediaTimeRef.current;
      const previousWallTime = lastWallTimeRef.current;

      if (previousMediaTime !== null && previousWallTime !== null) {
        const mediaDelta = mediaTime - previousMediaTime;
        const wallDelta = Math.max(0, (wallTime - previousWallTime) / 1000);
        const maximumExpectedDelta = wallDelta * playbackRate + 1;

        // Ignore seeks, backward jumps and implausible media-time jumps.
        if (
          mediaDelta > 0 &&
          mediaDelta <= Math.max(2.5, maximumExpectedDelta)
        ) {
          watchedMediaSecondsRef.current += mediaDelta;
          const totalDuration = video.duration;
          if (
            !ninetyPercentReportedRef.current &&
            Number.isFinite(totalDuration) &&
            totalDuration > 0 &&
            watchedMediaSecondsRef.current >= totalDuration * 0.9
          ) {
            ninetyPercentReportedRef.current = true;
            onNinetyPercentWatched?.();
          }
        }
      }
    }

    lastMediaTimeRef.current = mediaTime;
    lastWallTimeRef.current = wallTime;

    if (!isDragging) {
      setCurrentTime(mediaTime);
      if (duration === 0 && video.duration > 0) {
        setDuration(video.duration);
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
        src={optimizedVideoUrl}
        preload={active || preloadMetadata ? "metadata" : "none"}
        poster={poster}
        muted={isMuted}
        loop
        playsInline
        onClick={togglePlayPause}
        onPlay={() => {
            lastMediaTimeRef.current = videoRef.current?.currentTime ?? null;
            lastWallTimeRef.current = Date.now();
            setIsPlaying(true);
          }}
        onPause={() => {
            lastMediaTimeRef.current = null;
            lastWallTimeRef.current = null;
            setIsPlaying(false);
          }}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
          onSeeking={() => {
            lastMediaTimeRef.current = null;
            lastWallTimeRef.current = null;
          }}
          onSeeked={() => {
            lastMediaTimeRef.current = videoRef.current?.currentTime ?? null;
            lastWallTimeRef.current = Date.now();
          }}
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
