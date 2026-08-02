"use client";

import {
  useState,
  useEffect,
  useRef
} from "react";

import VideoPlayer
from "./VideoPlayer";

import VideoInfo
from "./VideoInfo";

import VideoActions
from "./VideoActions";

import CommentDrawer
from "./CommentDrawer";

import Toast from "./Toast";
import { getWatchVideos, WatchVideo } from "../services/watchVideos.service";
import { DEFAULT_BUSINESS_RULES } from "@/firestore/businessRules/defaults";

export default function
VerticalVideoFeed() {
  const [videos, setVideos] = useState<WatchVideo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadVideos() {
      try {
        setLoading(true);
        const result = await getWatchVideos();
        if (!isMounted) return;

        if (result && result.success && Array.isArray(result.videos)) {
          setVideos(result.videos);
        } else {
          setVideos([]);
        }
      } catch {
        if (!isMounted) return;
        setError("Failed to load videos");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadVideos();

    return () => {
      isMounted = false;
    };
  }, []);

  const [
    commentOpen,
    setCommentOpen
  ] = useState(false);
  
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [
    selectedVideo,
    setSelectedVideo
  ] = useState("");

  const [isMuted, setIsMuted] = useState(true);
  const [likedVideos, setLikedVideos] = useState<Record<string, boolean>>({});
  const [savedVideos, setSavedVideos] = useState<Record<string, boolean>>({});

  const [activeVideoId, setActiveVideoId] = useState<string>("");
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (videos.length > 0 && !activeVideoId) {
      setActiveVideoId(videos[0].id);
    }
  }, [videos, activeVideoId]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const sections = container.querySelectorAll("section[data-video-id]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const videoId = entry.target.getAttribute("data-video-id");
            if (videoId) {
              setActiveVideoId(videoId);
            }
          }
        });
      },
      {
        root: container,
        threshold: 0.6,
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => {
      observer.disconnect();
    };
  }, [videos]);

  const handleShare = async (video: WatchVideo) => {
    const shareData = {
      title: 'Check out this video on JembeeKart',
      text: video.caption,
      url: window.location.origin + '/mlm/watch-earn?v=' + video.id,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setToastMessage("Shared successfully.");
      } else {
        await navigator.clipboard.writeText(shareData.url);
        setToastMessage("Link copied.");
      }
    } catch {
      // Fail silently without console logging
    }
  };

  if (loading) {
    return (
      <main className="h-screen flex items-center justify-center bg-[var(--card-color)] text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="h-screen flex items-center justify-center bg-[var(--card-color)] text-white">
        <p>{error}</p>
      </main>
    );
  }

  if (videos.length === 0) {
    return (
      <main className="h-screen flex items-center justify-center bg-[var(--card-color)] text-white">
        <p>No videos available.</p>
      </main>
    );
  }

  return (

    <main
      ref={containerRef}
      className="
        h-screen
        snap-y
        snap-mandatory
        overflow-y-scroll
        bg-[var(--card-color)]
      "
    >

      {videos.map(
        (video) => (

          <section
            key={video.id}
            data-video-id={video.id}
            className="
              relative
              h-screen
              snap-start
            "
          >

            {/* VIDEO */}

            <VideoPlayer
              videoUrl={
                video.video
              }

              rewardCoins={
                video.coins
              }

              watchSeconds={
                DEFAULT_BUSINESS_RULES.watchEarn.minimumWatchDuration
              }
              isMuted={isMuted}
              active={activeVideoId === video.id}
            />

            {/* INFO */}

            <VideoInfo
              username={
                video.username
              }

              caption={
                video.caption
              }

              hashtags={
                video.hashtags
              }

              music={
                video.music
              }

              verified={
                video.verified
              }
            />

            {/* ACTIONS */}

            <VideoActions
              likes={
                video.likes + (likedVideos[video.id] ? 1 : 0)
              }

              comments={
                video.comments
              }

              shares={
                video.shares
              }

              coins={
                video.coins
              }

              isMuted={isMuted}

              onLike={() => {
                setLikedVideos(prev => ({ ...prev, [video.id]: !prev[video.id] }));
              }}

              onComment={() => {
                setSelectedVideo(video.id);
                setCommentOpen(
                  true
                );
              }}

              onShare={() => {
                handleShare(video);
              }}

              onSave={() => {
                setSavedVideos(prev => ({ ...prev, [video.id]: !prev[video.id] }));
              }}

              toggleMute={() => setIsMuted(!isMuted)}

              isLiked={!!likedVideos[video.id]}

              isSaved={!!savedVideos[video.id]}
            />

          </section>
        )
      )}

      {/* COMMENT DRAWER */}
      {selectedVideo && (
        <CommentDrawer
            open={commentOpen}
            onClose={() => { setCommentOpen(false); setSelectedVideo(""); }}
            videoId={selectedVideo}
        />
      )}
      
      {/* Toast */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />

    </main>
  );
}
