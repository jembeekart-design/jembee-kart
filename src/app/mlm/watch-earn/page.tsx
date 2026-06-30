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

export default function WatchEarnPage() {

  const videoRefs =
    useRef<HTMLVideoElement[]>(
      []
    );

  /* =========================
     VIDEOS
  ========================= */

  const [
    videos,
    setVideos
  ] = useState<
    WatchVideo[]
  >([]);

  const [
    loadingVideos,
    setLoadingVideos
  ] = useState(true);
 
  /* =========================
     STATES
  ========================= */

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
    pausedVideos,
    setPausedVideos
  ] = useState<string[]>(
    []
  );

  const [
    watchProgress,
    setWatchProgress
  ] = useState<{
    [key: string]: number;
  }>({});

  const [
    rewardedVideos,
    setRewardedVideos
  ] = useState<string[]>(
    []
  );

  const [
    adPlaying,
    setAdPlaying
  ] = useState(false);

  /* =========================
     FETCH VIDEOS
  ========================= */

  useEffect(() => {

    async function
    loadVideos() {

      try {

        setLoadingVideos(
          true
        );

        const result =
          await fetchWatchVideos();

        if (
          result.success
        ) {

          setVideos(
            result.videos
          );
        }

      } catch (error) {

        console.error(
          error
        );

      } finally {

        setLoadingVideos(
          false
        );
      }
    }

    loadVideos();

  }, []);

  /* =========================
     AUTO PLAY
  ========================= */

  useEffect(() => {

    if (adPlaying) {

      videoRefs.current.forEach(
        (video) => {

          if (video) {

            video.pause();
          }
        }
      );

      return;
    }

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

          video
            .play()
            .catch(() => {});

        } else {

          video.pause();
        }
      }
    );

  }, [
    currentIndex,
    videos,
    adPlaying
  ]);

  /* =========================
     REWARD
  ========================= */

  function rewardCoins(
    coins: number
  ) {

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

  /* =========================
     PLAY / PAUSE
  ========================= */

  function toggleVideo(
    videoId: string,
    index: number
  ) {

    if (adPlaying) {
      return;
    }

    const video =
      videoRefs.current[
        index
      ];

    if (!video) {
      return;
    }

    if (video.paused) {

      video
        .play()
        .catch(() => {});

      setPausedVideos(
        (prev) =>
          prev.filter(
            (id) =>
              id !== videoId
          )
      );

    } else {

      video.pause();

      setPausedVideos(
        (prev) => [
          ...prev,
          videoId
        ]
      );
    }
  }

  /* =========================
     AUTO WATCH
  ========================= */

  useEffect(() => {

    if (
      videos.length === 0
    ) {
      return;
    }

    if (adPlaying) {
      return;
    }

    const interval =
      setInterval(() => {

        const currentVideo =
          videos[currentIndex];

        if (!currentVideo) {
          return;
        }

        const currentId =
          currentVideo.id;

        if (
          pausedVideos.includes(
            currentId
          )
        ) {
          return;
        }

        if (
          rewardedVideos.includes(
            currentId
          )
        ) {
          return;
        }

        setWatchProgress(
          (prev) => {

            const current =
              prev[currentId] ||
              0;

            const updated =
              Math.min(
                current + 5,
                100
              );

            /* SHOW AD */

            if (
              updated >= 100 &&
              !rewardedVideos.includes(
                currentId
              )
            ) {

              setAdPlaying(
                true
              );

              setTimeout(() => {

                setAdPlaying(
                  false
                );

                rewardCoins(
                  currentVideo.coins ||
                    5
                );

                setRewardedVideos(
                  (
                    prevRewarded
                  ) => [
                    ...prevRewarded,
                    currentId
                  ]
                );

              }, 5000);
            }

            return {

              ...prev,

              [currentId]:
                updated
            };
          });

      }, 1000);

    return () =>
      clearInterval(
        interval
      );

  }, [
    currentIndex,
    videos,
    rewardedVideos,
    pausedVideos,
    adPlaying
  ]);

  /* =========================
     LOADING
  ========================= */

  if (loadingVideos) {

    return (

      <main
        className="
          flex
          min-h-screen
          items-center
          justify-center
          bg-black
        "
      >

        <p
          className="
            text-lg
            font-black
            text-white
          "
        >

          Loading videos...

        </p>

      </main>
    );
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

      {/* REWARD */}

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

      {/* AD */}

      {adPlaying && (

        <div
          className="
            fixed
            inset-0
            z-[9999]
            flex
            flex-col
            items-center
            justify-center
            bg-black
            text-white
          "
        >

          <div
            className="
              mb-6
              h-24
              w-24
              animate-pulse
              rounded-full
              bg-gradient-to-r
              from-violet-600
              to-fuchsia-500
            "
          />

          <h2
            className="
              text-3xl
              font-black
            "
          >

            Sponsored Ad

          </h2>

          <p
            className="
              mt-3
              text-sm
              text-gray-300
            "
          >

            Watching ad...
            Reward unlocking...

          </p>

        </div>
      )}

      {/* EMPTY */}

      {videos.length === 0 && (

        <div
          className="
            flex
            min-h-screen
            items-center
            justify-center
          "
        >

          <p
            className="
              text-lg
              font-black
              text-white
            "
          >

            No videos found

          </p>

        </div>
      )}

      {/* VIDEOS */}

      {videos.map(
        (
          video,
          index
        ) => (

          <section
            key={video.id}
            className="
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
              muted
              autoPlay
              playsInline

              preload="auto"

              controls={false}

              className="
                h-full
                w-full
                object-cover
              "

              onCanPlay={(e) => {

                if (
                  index ===
                    currentIndex &&
                  !adPlaying
                ) {

                  e.currentTarget
                    .play()
                    .catch(() => {});
                }
              }}

              onClick={() => {

                toggleVideo(
                  video.id,
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

            {/* PLAY / PAUSE */}

            <button
              onClick={() =>
                toggleVideo(
                  video.id,
                  index
                )
              }
              className="
                absolute
                left-1/2
                top-1/2
                z-40
                flex
                h-20
                w-20
                -translate-x-1/2
                -translate-y-1/2
                items-center
                justify-center
                rounded-full
                bg-black/40
                backdrop-blur-xl
              "
            >

              {pausedVideos.includes(
                video.id
              ) ? (

                <Play
                  size={35}
                  className="
                    text-white
                  "
                />

              ) : (

                <Pause
                  size={35}
                  className="
                    text-white
                  "
                />

              )}

            </button>

            {/* INFO */}

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

                {video.hashtags?.map(
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

              {/* PROGRESS */}

              <div
                className="
                  mt-4
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
                      watchProgress[
                        video.id
                      ] || 0
                    }%`
                  }}
                />

              </div>

              {/* REWARD BUTTON */}

              <button
                disabled
                className={`
                  mt-5
                  rounded-full
                  px-5
                  py-3
                  font-black

                  ${
                    rewardedVideos.includes(
                      video.id
                    )
                      ? "bg-green-500 text-white"
                      : "bg-yellow-400 text-black"
                  }
                `}
              >

                {rewardedVideos.includes(
                  video.id
                )
                  ? "Reward Claimed"
                  : `Watch ${
                      100 -
                      (
                        watchProgress[
                          video.id
                        ] || 0
                      )
                    }% More`}

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

    </main>
  );
}
