"use client";

import {
  useState,
  useEffect
} from "react";

import VideoPlayer
from "./VideoPlayer";

import VideoInfo
from "./VideoInfo";

import VideoActions
from "./VideoActions";

import CommentDrawer
from "./CommentDrawer";

import ShareDrawer
from "./ShareDrawer";

import Toast from "./Toast";
import { getWatchVideos } from "../services/watchVideos.service";
import { DEFAULT_BUSINESS_RULES } from "@/firestore/businessRules/defaults";

export default function
VerticalVideoFeed() {
  const [videos, setVideos] = useState<any[]>([]);

  useEffect(() => {
    async function loadVideos() {
      const result = await getWatchVideos();
      if (result.success) {
        setVideos(result.videos);
      }
    }
    loadVideos();
  }, []);

  const [
    commentOpen,
    setCommentOpen
  ] = useState(false);

  const [
    shareOpen,
    setShareOpen
  ] = useState(false);
  
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [
    selectedVideo,
    setSelectedVideo
  ] = useState("");

  const [isMuted, setIsMuted] = useState(true);
  const [likedVideos, setLikedVideos] = useState<Record<string, boolean>>({});
  const [savedVideos, setSavedVideos] = useState<Record<string, boolean>>({});

  const handleShare = async (video: any) => {
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
    } catch (err) {
      console.error('Share failed', err);
    }
  };

  return (

    <main
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

      {/* SHARE DRAWER */}

      <ShareDrawer
        open={shareOpen}

        onClose={() =>
          setShareOpen(
            false
          )
        }

        videoId={
          selectedVideo
        }
      />
      
      {/* Toast */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />

    </main>
  );
}
