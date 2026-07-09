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

  const [
    selectedVideo,
    setSelectedVideo
  ] = useState("");

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
                video.likes
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

              onLike={() => {

                console.log(
                  "Liked"
                );
              }}

              onComment={() => {

                setCommentOpen(
                  true
                );
              }}

              onShare={() => {

                setSelectedVideo(
                  video.id
                );

                setShareOpen(
                  true
                );
              }}
            />

          </section>
        )
      )}

      {/* COMMENT DRAWER */}

      <CommentDrawer
        open={commentOpen}

        onClose={() =>
          setCommentOpen(
            false
          )
        }
      />

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

    </main>
  );
}
