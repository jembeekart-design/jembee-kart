"use client";

import {
  useState,
  useEffect,
  useRef,
  useMemo
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
import BottomQuickActions from "./BottomQuickActions";
import { getWatchVideos, WatchVideo } from "../services/watchVideos.service";
import { DEFAULT_BUSINESS_RULES } from "@/firestore/businessRules/defaults";

// New imports for persistence and auth
import { auth, db } from "@/firebase/config";
import { likeVideo } from "@/lib/mlm/watch-earn/likeVideo";
import { shareVideo } from "@/lib/mlm/watch-earn/shareVideo";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { collection, getDocs } from "firebase/firestore";

export default function VerticalVideoFeed({ activeTab }: { activeTab: 'foryou' | 'following' }) {
  const { requireAuth, isAuthenticated } = useRequireAuth();
  const [followingList, setFollowingList] = useState<string[]>([]);
  const [videos, setVideos] = useState<WatchVideo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && auth.currentUser) {
      const fetchFollowing = async () => {
        const followingRef = collection(db, 'users', auth.currentUser!.uid, 'following');
        const snapshot = await getDocs(followingRef);
        setFollowingList(snapshot.docs.map(doc => doc.id));
      };
      fetchFollowing();
    }
  }, [isAuthenticated]);

  const filteredVideos = useMemo(() => {
    if (activeTab === 'following') {
      return videos.filter(v => followingList.includes(v.creatorId));
    }
    return videos;
  }, [activeTab, videos, followingList]);

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

      // Persist share via existing service (if user is authenticated)
      try {
        const uid = auth.currentUser?.uid;
        if (uid) {
          const res = await shareVideo({ videoId: video.id, userId: uid });
          if (res && res.success) {
            // Update local state to reflect increment
            setVideos(prev =>
              prev.map(v =>
                v.id === video.id ? { ...v, shares: v.shares + 1 } : v
              )
            );
          }
        }
      } catch (err) {
        // Log and continue; UI already shows toast
        console.error("shareVideo error:", err);
      }

    } catch {
      // Fail silently without console logging
    }
  };

  if (loading) {
    return (
      <main className="h-screen flex items-center justify-center bg-[var(--color-card-background)] text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="h-screen flex items-center justify-center bg-[var(--color-card-background)] text-white">
        <p>{error}</p>
      </main>
    );
  }

  if (videos.length === 0) {
    return (
      <main className="h-screen flex items-center justify-center bg-[var(--color-card-background)] text-white">
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
        bg-[var(--color-card-background)]
      "
    >
      {filteredVideos.length === 0 ? (
        <div className="h-screen flex items-center justify-center text-gray-400">
          {activeTab === 'following' 
            ? "You aren't following anyone yet." 
            : "No videos found."
          }
        </div>
      ) : (
        filteredVideos.map(
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
                displayName={video.displayName}
                username={video.username}
                photoURL={video.photoURL}
                caption={video.caption}
                hashtags={video.hashtags}
                music={video.music}
                verified={video.verified}
                originalVideoId={video.originalVideoId}
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

                onLike={async () => {
                  const uid = auth.currentUser?.uid;
                  if (!uid) {
                    setToastMessage("Please log in to like videos.");
                    return;
                  }

                  // If already liked locally, treat as unlike locally (no server unlike available)
                  if (likedVideos[video.id]) {
                    setLikedVideos(prev => ({ ...prev, [video.id]: false }));
                    setVideos(prev => prev.map(v => v.id === video.id ? { ...v, likes: Math.max(0, v.likes - 1) } : v));
                    return;
                  }

                  try {
                    const res = await likeVideo({ videoId: video.id, userId: uid });
                    if (res && res.success) {
                      setLikedVideos(prev => ({ ...prev, [video.id]: true }));
                      setVideos(prev => prev.map(v => v.id === video.id ? { ...v, likes: v.likes + 1 } : v));
                    } else {
                      setToastMessage("Failed to like the video.");
                    }
                  } catch (err) {
                    console.error("likeVideo error:", err);
                    setToastMessage("Failed to like the video.");
                  }
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
        )
      )}

      {/* COMMENT DRAWER */}
      {selectedVideo && (
        <CommentDrawer
            open={commentOpen}
            onClose={() => { setCommentOpen(false); setSelectedVideo(""); }}
            videoId={selectedVideo}
            onCommentAdded={() => {
              // Optimistically increment local video's comments count
              setVideos(prev => prev.map(v => v.id === selectedVideo ? { ...v, comments: v.comments + 1 } : v));
            }}
        />
      )}
      
      {/* Toast */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      
      <BottomQuickActions video={videos.find(v => v.id === activeVideoId)} />

    </main>
  );
}
