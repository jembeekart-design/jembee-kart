"use client";

import { useEffect, useRef, useState } from "react";

interface VideoPlayerProps {
  videoUrl: string;
  isMuted?: boolean;
  active?: boolean;
}

export default function VideoPlayer({
  videoUrl,
  isMuted = true,
  active = false,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (active) {
      video.play().catch(() => {
        // Browser autoplay policy may prevent playback.
      });
    } else {
      video.pause();
    }
  }, [active, videoUrl]);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  };

  return (
    <div
      className="relative h-screen w-full overflow-hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
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

      {!isPlaying && (
        <div
          onClick={togglePlayPause}
          className="absolute inset-0 z-30 flex cursor-pointer items-center justify-center bg-black/20"
        >
          <div className="rounded-full bg-black/60 p-4 text-3xl text-white">
            ▶
          </div>
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
    </div>
  );
}
