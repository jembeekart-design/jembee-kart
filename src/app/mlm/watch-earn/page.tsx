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
  Send,
  Copy,
  Link2,
  X
} from "lucide-react";

interface VideoItem {

  id: string;

  username: string;

  caption: string;

  hashtags: string[];

  music: string;

  verified: boolean;

  video: string;

  coins: number;

  likes: number;

  comments: number;

  shares: number;
}

export default function
WatchEarnPage() {

  const videoRefs =
    useRef<
      HTMLVideoElement[]
    >([]);

  const [videos] =
    useState<VideoItem[]>([
      {
        id: "1",

        username:
          "JembeeKart",

        caption:
          "Watch & Earn Coins 🔥",

        hashtags: [
          "earn",
          "shopping",
          "coins"
        ],

        music:
          "Trending Beat",

        verified: true,

        video:
          "https://www.w3schools.com/html/mov_bbb.mp4",

        coins: 5,

        likes: 12000,

        comments: 900,

        shares: 320
      },

      {
        id: "2",

        username:
          "Fashion Store",

        caption:
          "New Trending Collection ✨",

        hashtags: [
          "fashion",
          "style",
          "viral"
        ],

        music:
          "Fashion Music",

        verified: false,

        video:
          "https://www.w3schools.com/html/movie.mp4",

        coins: 10,

        likes: 8500,

        comments: 420,

        shares: 150
      }
    ]);

  const [
    currentIndex,
    setCurrentIndex
  ] = useState(0);

  const [
    earnedCoins,
    setEarnedCoins
  ] = useState(1250);

  const [
    streak
  ] = useState(7);

  const [
    showReward,
    setShowReward
  ] = useState(false);

  const [
    rewardCoinsValue,
    setRewardCoinsValue
  ] = useState(0);

  const [
    commentOpen,
    setCommentOpen
  ] = useState(false);

  const [
    shareOpen,
    setShareOpen
  ] = useState(false);

  const [
    commentText,
    setCommentText
  ] = useState("");

  const [
    claimedVideos,
    setClaimedVideos
  ] = useState<string[]>(
    []
  );

  useEffect(() => {

    videoRefs.current.forEach(
      (
        video,
        index
      ) => {

        if (!video) {
          return;
        }

        if (
          index ===
          currentIndex
        ) {

          video.play();

        } else {

          video.pause();
        }
      }
    );

  }, [currentIndex]);

  function rewardCoins(
    videoId: string,
    coins: number
  ) {

    if (
      claimedVideos.includes(
        videoId
      )
    ) {

      return;
    }

    setClaimedVideos(
      (prev) => [
        ...prev,
        videoId
      ]
    );

    setEarnedCoins(
      (prev) =>
        prev + coins
    );

    setRewardCoinsValue(
      coins
    );

    setShowReward(
      true
    );

    setTimeout(() => {

      setShowReward(
        false
      );

    }, 3000);
  }

  return (

    <main
      className="
        h-screen
        overflow-y-scroll
        snap-y
        snap-mandatory
        bg-black
      "
    >

      {/* HEADER */}

      <div
        className="
          fixed
          top-0
          z-50
          flex
          w-full
          items-center
          justify-between
          px-4
          py-4
        "
      >

        <div>

          <h1
            className="
              text-3xl
              font-black
              text-white
            "
          >

            Watch & Earn

          </h1>

          <p
            className="
              mt-1
              text-xs
              font-semibold
              text-gray-300
            "
          >

            Watch videos & earn rewards

          </p>

        </div>

        <div
          className="
            flex
            items-center
            gap-3
          "
        >

          {/* STREAK */}

          <div
            className="
              flex
              items-center
              gap-2
              rounded-full
              bg-orange-500/20
              px-4
              py-2
              backdrop-blur-xl
            "
          >

            <Flame
              size={18}
              className="
                text-orange-400
              "
            />

            <span
              className="
                text-sm
                font-black
                text-white
              "
            >

              {streak}

            </span>

          </div>

          {/* COINS */}

          <div
            className="
              flex
              items-center
              gap-2
              rounded-full
              bg-yellow-400/20
              px-4
              py-2
              backdrop-blur-xl
            "
          >

            <Coins
              size={18}
              className="
                text-yellow-300
              "
            />

            <span
              className="
                text-sm
                font-black
                text-white
              "
            >

              {earnedCoins}

            </span>

          </div>

          {/* BELL */}

          <button
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-full
              bg-black/40
              text-white
              backdrop-blur-xl
            "
          >

            <Bell size={20} />

          </button>

        </div>

      </div>

      {/* REWARD POPUP */}

      {showReward && (

        <div
          className="
            fixed
            left-1/2
            top-1/2
            z-[999]
            flex
            -translate-x-1/2
            -translate-y-1/2
            items-center
            gap-3
            rounded-full
            bg-yellow-400
            px-6
            py-4
            shadow-2xl
          "
        >

          <Coins
            size={30}
            className="
              text-black
            "
          />

          <div>

            <h2
              className="
                text-2xl
                font-black
                text-black
              "
            >

              +{rewardCoinsValue}

            </h2>

            <p
              className="
                text-xs
                font-bold
                text-black/70
              "
            >

              Reward Added

            </p>

          </div>

        </div>
      )}

      {/* VIDEO FEED */}

      {videos.map(
        (
          video,
          index
        ) => (

          <section
            key={video.id}
            className="
              watch-video-item
              relative
              h-screen
              snap-start
            "
          >

            {/* VIDEO */}

            <video
              ref={(element) => {

                if (element) {

                  videoRefs.current[
                    index
                  ] = element;
                }
              }}

              src={video.video}

              loop

              autoPlay

              playsInline

              className="
                h-full
                w-full
                object-cover
              "

              onPlay={() => {

                setCurrentIndex(
                  index
                );
              }}
            />

            {/* OVERLAY */}

            <div
              className="
                absolute
                inset-0
                bg-gradient-to-t
                from-black/80
                via-black/20
                to-transparent
              "
            />

            {/* PROGRESS BAR */}

            <div
              className="
                absolute
                left-4
                right-4
                top-24
                z-40
              "
            >

              <div
                className="
                  mb-2
                  flex
                  items-center
                  justify-between
                "
              >

                <span
                  className="
                    text-xs
                    font-bold
                    text-white
                  "
                >

                  Watch to Earn

                </span>

                <span
                  className="
                    rounded-full
                    bg-black/50
                    px-3
                    py-1
                    text-xs
                    font-black
                    text-yellow-400
                  "
                >

                  +{video.coins}

                </span>

              </div>

              <div
                className="
                  h-3
                  overflow-hidden
                  rounded-full
                  bg-white/20
                "
              >

                <div
                  className="
                    h-full
                    rounded-full
                    bg-gradient-to-r
                    from-yellow-300
                    to-orange-500
                    transition-all
                    duration-500
                  "
                  style={{
                    width: `${
                      currentIndex ===
                      index
                        ? 70
                        : 0
                    }%`
                  }}
                />

              </div>

            </div>

            {/* VIDEO INFO */}

            <div
              className="
                absolute
                bottom-24
                left-4
                z-20
                max-w-[75%]
                text-white
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >

                <h2
                  className="
                    text-xl
                    font-black
                  "
                >

                  @{video.username}

                </h2>

                {video.verified && (

                  <BadgeCheck
                    size={18}
                    className="
                      fill-blue-500
                      text-white
                    "
                  />

                )}

              </div>

              <p
                className="
                  mt-3
                  text-sm
                  leading-6
                "
              >

                {video.caption}

              </p>

              {/* HASHTAGS */}

              <div
                className="
                  mt-3
                  flex
                  flex-wrap
                  gap-2
                "
              >

                {video.hashtags.map(
                  (tag) => (

                    <span
                      key={tag}
                      className="
                        rounded-full
                        bg-white/10
                        px-3
                        py-1
                        text-xs
                        font-bold
                        text-blue-200
                      "
                    >

                      #{tag}

                    </span>
                  )
                )}

              </div>

              {/* MUSIC */}

              <div
                className="
                  mt-4
                  flex
                  items-center
                  gap-2
                  rounded-full
                  bg-black/40
                  px-4
                  py-2
                "
              >

                <Music2
                  size={16}
                  className="
                    text-pink-400
                  "
                />

                <p
                  className="
                    truncate
                    text-xs
                    font-bold
                    text-white
                  "
                >

                  {video.music}

                </p>

              </div>

              {/* CLAIM BUTTON */}

              <button
                onClick={() =>
                  rewardCoins(
                    video.id,
                    video.coins
                  )
                }

                disabled={claimedVideos.includes(
                  video.id
                )}

                className={`
                  mt-5
                  rounded-full
                  px-5
                  py-3
                  font-black
                  transition-all

                  ${
                    claimedVideos.includes(
                      video.id
                    )
                      ? "bg-green-500 text-white"
                      : "bg-yellow-400 text-black"
                  }
                `}
              >

                {claimedVideos.includes(
                  video.id
                )
                  ? "Claimed"
                  : `Claim ${video.coins} Coins`}

              </button>

            </div>

            {/* RIGHT ACTIONS */}

            <div
              className="
                absolute
                bottom-24
                right-3
                z-20
                flex
                flex-col
                items-center
                gap-5
                text-white
              "
            >

              {/* LIKE */}

              <button
                className="
                  flex
                  flex-col
                  items-center
                  gap-1
                "
              >

                <div
                  className="
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-full
                    bg-black/40
                  "
                >

                  <Heart
                    size={28}
                  />

                </div>

                <span
                  className="
                    text-xs
                    font-bold
                  "
                >

                  {video.likes}

                </span>

              </button>

              {/* COMMENT */}

              <button
                onClick={() =>
                  setCommentOpen(
                    true
                  )
                }
                className="
                  flex
                  flex-col
                  items-center
                  gap-1
                "
              >

                <div
                  className="
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-full
                    bg-black/40
                  "
                >

                  <MessageCircle
                    size={28}
                  />

                </div>

                <span
                  className="
                    text-xs
                    font-bold
                  "
                >

                  {video.comments}

                </span>

              </button>

              {/* SHARE */}

              <button
                onClick={() =>
                  setShareOpen(
                    true
                  )
                }
                className="
                  flex
                  flex-col
                  items-center
                  gap-1
                "
              >

                <div
                  className="
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-full
                    bg-black/40
                  "
                >

                  <Share2
                    size={28}
                  />

                </div>

                <span
                  className="
                    text-xs
                    font-bold
                  "
                >

                  {video.shares}

                </span>

              </button>

              {/* SAVE */}

              <button
                className="
                  flex
                  flex-col
                  items-center
                  gap-1
                "
              >

                <div
                  className="
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-full
                    bg-black/40
                  "
                >

                  <Bookmark
                    size={26}
                  />

                </div>

                <span
                  className="
                    text-xs
                    font-bold
                  "
                >

                  Save

                </span>

              </button>

            </div>

          </section>
        )
      )}

      {/* COMMENT DRAWER */}

      <div
        className={`
          fixed
          bottom-0
          left-0
          right-0
          z-[999]
          rounded-t-[35px]
          bg-[#121212]
          transition-all
          duration-300
          ${
            commentOpen
              ? "translate-y-0"
              : "translate-y-full"
          }
        `}
      >

        <div
          className="
            flex
            items-center
            justify-between
            border-b
            border-white/10
            px-5
            py-4
          "
        >

          <h2
            className="
              text-lg
              font-black
              text-white
            "
          >

            Comments

          </h2>

          <button
            onClick={() =>
              setCommentOpen(
                false
              )
            }
            className="
              text-white
            "
          >

            <X />

          </button>

        </div>

      </div>

      {/* SHARE DRAWER */}

      <div
        className={`
          fixed
          bottom-0
          left-0
          right-0
          z-[999]
          rounded-t-[35px]
          bg-[#121212]
          transition-all
          duration-300
          ${
            shareOpen
              ? "translate-y-0"
              : "translate-y-full"
          }
        `}
      >

        <div
          className="
            flex
            items-center
            justify-between
            border-b
            border-white/10
            px-5
            py-4
          "
        >

          <h2
            className="
              text-lg
              font-black
              text-white
            "
          >

            Share Video

          </h2>

          <button
            onClick={() =>
              setShareOpen(
                false
              )
            }
            className="
              text-white
            "
          >

            <X />

          </button>

        </div>

        <div
          className="
            grid
            grid-cols-4
            gap-5
            px-5
            py-8
          "
        >

          <button
            className="
              flex
              flex-col
              items-center
              gap-3
            "
          >

            <div
              className="
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-full
                bg-green-500/20
              "
            >

              <MessageCircle
                size={28}
                className="
                  text-green-400
                "
              />

            </div>

            <span
              className="
                text-xs
                font-bold
                text-white
              "
            >

              WhatsApp

            </span>

          </button>

          <button
            className="
              flex
              flex-col
              items-center
              gap-3
            "
          >

            <div
              className="
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-full
                bg-sky-500/20
              "
            >

              <Send
                size={28}
                className="
                  text-sky-400
                "
              />

            </div>

            <span
              className="
                text-xs
                font-bold
                text-white
              "
            >

              Telegram

            </span>

          </button>

          <button
            className="
              flex
              flex-col
              items-center
              gap-3
            "
          >

            <div
              className="
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-full
                bg-blue-500/20
              "
            >

              <Share2
                size={28}
                className="
                  text-blue-400
                "
              />

            </div>

            <span
              className="
                text-xs
                font-bold
                text-white
              "
            >

              Share

            </span>

          </button>

          <button
            className="
              flex
              flex-col
              items-center
              gap-3
            "
          >

            <div
              className="
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-full
                bg-yellow-500/20
              "
            >

              <Copy
                size={28}
                className="
                  text-yellow-300
                "
              />

            </div>

            <span
              className="
                text-xs
                font-bold
                text-white
              "
            >

              Copy

            </span>

          </button>

        </div>

        {/* LINK */}

        <div
          className="
            px-5
            pb-8
          "
        >

          <div
            className="
              flex
              items-center
              gap-3
              rounded-2xl
              border
              border-white/10
              bg-white/5
              px-4
              py-4
            "
          >

            <Link2
              size={18}
              className="
                text-gray-400
              "
            />

            <p
              className="
                flex-1
                truncate
                text-sm
                text-gray-300
              "
            >

              https://jembeekart.com/watch/video

            </p>

          </div>

        </div>

      </div>

    </main>
  );
}
