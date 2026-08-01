"use client";

import {
  useState
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

const videos = [
  {
    id: "1",

    username:
      "JembeeKart",

    caption:
      "Earn coins by watching videos 🔥",

    hashtags: [
      "earnmoney",
      "shopping",
      "rewards"
    ],

    music:
      "Trending Audio",

    verified: true,

    videoUrl:
      "https://www.w3schools.com/html/mov_bbb.mp4",

    rewardCoins: 10,

    watchSeconds: 10,

    likes: 1200,

    comments: 250,

    shares: 90
  },

  {
    id: "2",

    username:
      "FashionHub",

    caption:
      "New fashion drops available now ✨",

    hashtags: [
      "fashion",
      "style",
      "shopping"
    ],

    music:
      "Fashion Beat",

    verified: false,

    videoUrl:
      "https://www.w3schools.com/html/movie.mp4",

    rewardCoins: 15,

    watchSeconds: 12,

    likes: 4300,

    comments: 780,

    shares: 320
  }
];

export default function
VerticalVideoFeed() {

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

  const handleShare = async (video: typeof videos[0]) => {
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
                video.videoUrl
              }

              rewardCoins={
                video.rewardCoins
              }

              watchSeconds={
                video.watchSeconds
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
                video.rewardCoins
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
