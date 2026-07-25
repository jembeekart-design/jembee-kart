"use client";

import {
  useEffect,
  useRef,
  useState
} from "react";

import {
  Heart,
  MessageCircle,
  Share2,
  Coins,
  Bookmark,
  Bell,
  Flame,
  BadgeCheck,
  Music2,
  Play,
  Pause
} from "lucide-react";

import {
  fetchWatchVideos,
  WatchVideo
} from "@/lib/mlm/watch-earn/fetchWatchVideos";

import { businessRules } from "@/firestore/businessRules/service";
import { WatchEarnRules } from "@/firestore/businessRules/types";

export default function WatchEarnPage() {
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [watchEarnRules, setWatchEarnRules] = useState<WatchEarnRules | null>(null);

  const videoRefs = useRef<HTMLVideoElement[]>([]);
  
  const [videos, setVideos] = useState<WatchVideo[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [earnedCoins, setEarnedCoins] = useState(0);
  const [streak] = useState(7);
  const [showReward, setShowReward] = useState(false);
  const [rewardCoinsValue, setRewardCoinsValue] = useState(0);
  const [pausedVideos, setPausedVideos] = useState<string[]>([]);
  const [watchProgress, setWatchProgress] = useState<{ [key: string]: number }>({});
  const [rewardedVideos, setRewardedVideos] = useState<string[]>([]);
  const [adPlaying, setAdPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    async function loadConfig() {
      const rules = await businessRules.getWatchEarnRules();
      setWatchEarnRules(rules);
      setLoadingConfig(false);
    }
    loadConfig();
  }, []);

  /* =========================
     FETCH VIDEOS
  ========================= */

  useEffect(() => {
    async function loadVideos() {
      try {
        setLoadingVideos(true);
        const result = await fetchWatchVideos();
        if (result.success) {
          setVideos(result.videos);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingVideos(false);
      }
    }
    loadVideos();
  }, []);

  /* =========================
     AUTO PLAY
  ========================= */

  useEffect(() => {
    if (adPlaying) {
      videoRefs.current.forEach((video) => { if (video) video.pause(); });
      return;
    }
    videoRefs.current.forEach((video, index) => {
      if (!video) return;
      if (index === currentIndex) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, [currentIndex, videos, adPlaying]);

  /* =========================
     REWARD
  ========================= */

  function rewardCoins(coins: number) {
    setEarnedCoins((prev) => prev + coins);
    setRewardCoinsValue(coins);
    setShowReward(true);
    setTimeout(() => setShowReward(false), 3000);
  }

  /* =========================
     PLAY / PAUSE
  ========================= */

  function toggleVideo(videoId: string, index: number) {
    if (adPlaying) return;
    const video = videoRefs.current[index];
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
      setPausedVideos((prev) => prev.filter((id) => id !== videoId));
    } else {
      video.pause();
      setPausedVideos((prev) => [...prev, videoId]);
    }
  }

  /* =========================
     AUTO WATCH
  ========================= */

  useEffect(() => {
    if (videos.length === 0 || adPlaying) return;

    const interval = setInterval(() => {
      const currentVideo = videos[currentIndex];
      if (!currentVideo) return;
      const currentId = currentVideo.id;

      if (pausedVideos.includes(currentId) || rewardedVideos.includes(currentId)) return;

      setWatchProgress((prev) => {
        const current = prev[currentId] || 0;
        const updated = Math.min(current + 5, 100);

        if (updated >= 100 && !rewardedVideos.includes(currentId)) {
          setAdPlaying(true);
          setTimeout(() => {
            setAdPlaying(false);
            rewardCoins(watchEarnRules?.rewardPerVideo || 5);
            setRewardedVideos((prevRewarded) => [...prevRewarded, currentId]);
          }, 5000);
        }

        return { ...prev, [currentId]: updated };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentIndex, videos, rewardedVideos, pausedVideos, adPlaying, watchEarnRules]);

  /* =========================
     LOADING
  ========================= */

  if (loadingVideos || loadingConfig) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--card-color)]">
        <p className="text-lg font-black text-[var(--button-text-color)]">Loading...</p>
      </main>
    );
  }

  return (
    <main className="h-screen overflow-y-scroll snap-y snap-mandatory bg-[var(--card-color)]">
      {/* HEADER */}
      <div className="fixed top-0 z-50 flex w-full items-center justify-between px-4 py-4">
        <div>
          <h1 className="text-3xl font-black text-[var(--button-text-color)]">Watch & Earn</h1>
          <p className="mt-1 text-xs font-semibold text-[var(--text-color)]">Watch videos & earn rewards</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full bg-[var(--warning-color)]/20 px-4 py-2 backdrop-blur-xl">
            <Flame size={18} className="text-[var(--warning-color)]" />
            <span className="text-sm font-black text-[var(--button-text-color)]">{streak}</span>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-[var(--warning-color)]/20 px-4 py-2 backdrop-blur-xl">
            <Coins size={18} className="text-[var(--warning-color)]" />
            <span className="text-sm font-black text-[var(--button-text-color)]">{earnedCoins}</span>
          </div>
          <button className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--card-color)]/40 text-[var(--button-text-color)] backdrop-blur-xl">
            <Bell size={20} />
          </button>
        </div>
      </div>

      {/* VIDEOS */}
      {videos.map((video, index) => (
        <section key={video.id} className="relative h-screen snap-start">
          <video
            ref={(element) => { if (element) videoRefs.current[index] = element; }}
            src={video.video}
            loop
            muted={isMuted}
            autoPlay
            playsInline
            preload="auto"
            controls={false}
            className="h-full w-full object-cover"
            onClick={() => toggleVideo(video.id, index)}
          />
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="absolute right-4 bottom-20 z-40 rounded-full bg-black/50 p-2 text-white"
          >
            {isMuted ? "🔇" : "🔊"}
          </button>
          
          {/* ... overlay, play/pause, info, etc ... */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          <button
              onClick={() => toggleVideo(video.id, index)}
              className="absolute left-1/2 top-1/2 z-40 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--card-color)]/40 backdrop-blur-xl"
            >
              {pausedVideos.includes(video.id) ? (
                <Play size={35} className="text-[var(--button-text-color)]" />
              ) : (
                <Pause size={35} className="text-[var(--button-text-color)]" />
              )}
            </button>
        </section>
      ))}
    </main>
  );
}
