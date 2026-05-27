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

  const [
    videos,
    setVideos
  ] = useState<
    WatchVideo[]
  >([]);

  const [
    loading,
    setLoading
  ] = useState(true);

  const [
    currentIndex,
    setCurrentIndex
  ] = useState(0);

  const [
    earnedCoins,
    setEarnedCoins
  ] = useState(1250);

  const [
    adPlaying,
    setAdPlaying
  ] = useState(false);

  const [
    rewardedVideos,
    setRewardedVideos
  ] = useState<string[]>(
    []
  );

  const [
    pausedVideos,
    setPausedVideos
  ] = useState<string[]>(
    []
  );

  const [
    progress,
    setProgress
  ] = useState<{
    [key: string]: number;
  }>({});

  /* =========================
     FETCH VIDEOS
  ========================= */

  useEffect(() => {

    async function load() {

      const result =
        await fetchWatchVideos();

      if (
        result.success
      ) {

        setVideos(
          result.videos
        );
      }

      setLoading(false);
    }

    load();

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
     AUTO WATCH REWARD
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

        if (
          pausedVideos.includes(
            currentVideo.id
          )
        ) {
          return;
        }

        if (
          rewardedVideos.includes(
            currentVideo.id
          )
        ) {
          return;
        }

        setProgress(
          (prev) => {

            const old =
              prev[
                currentVideo.id
              ] || 0;

            const updated =
              old + 10;

            if (
              updated >= 100
            ) {

              setAdPlaying(
                true
              );

              setTimeout(() => {

                setAdPlaying(
                  false
                );

                setEarnedCoins(
                  (prevCoins) =>
                    prevCoins +
                    currentVideo.coins
                );

                setRewardedVideos(
                  (prevRewarded) => [
                    ...prevRewarded,
                    currentVideo.id
                  ]
                );

              }, 5000);
            }

            return {

              ...prev,

              [currentVideo.id]:
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
    adPlaying,
    pausedVideos,
    rewardedVideos
  ]);

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
     LOADING
  ========================= */

  if (loading) {

    return (

      <main
        className="
          flex
          min-h-screen
          items-center
          justify-center
          bg-black
          text-white
        "
      >

        Loading Videos...

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

        <h1
          className="
            text-2xl
            font-black
            text-white
          "
        >

          Watch & Earn

        </h1>

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
              bg-yellow-400/20
              px-4
              py-2
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
                text-white
                font-black
              "
            >

              {earnedCoins}

            </span>

          </div>

          <button
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              bg-black/40
              text-white
            "
          >

            <Bell size={18} />

          </button>

        </div>

      </div>

      {/* AD VIDEO */}

      {adPlaying && (

        <div
          className="
            fixed
            inset-0
            z-[9999]
            bg-black
          "
        >

          <video
            autoPlay
            muted
            playsInline
            className="
              h-full
              w-full
              object-cover
            "
          >

            <source
              src="https://res.cloudinary.com/db4bgno7i/video/upload/v1748400000/jembeekart-ad.mp4"
              type="video/mp4"
            />

          </video>

          <div
            className="
              absolute
              top-5
              right-5
              rounded-full
              bg-black/60
              px-4
              py-2
              text-sm
              font-black
              text-white
            "
          >

            Sponsored Ad

          </div>

        </div>
      )}

      {/* NO VIDEOS */}

      {videos.length === 0 && (

        <div
          className="
            flex
            min-h-screen
            items-center
            justify-center
            text-white
          "
        >

          No videos found

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
              playsInline
              autoPlay

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
                to-transparent
              "
            />

            {/* CENTER BUTTON */}

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
                z-30
                flex
                h-20
                w-20
                -translate-x-1/2
                -translate-y-1/2
                items-center
                justify-center
                rounded-full
                bg-black/40
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

            {/* LEFT INFO */}

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
                    "
                  />

                )}

              </div>

              <p
                className="
                  mt-3
                  text-sm
                "
              >

                {video.caption}

              </p>

              {/* MUSIC */}

              <div
                className="
                  mt-4
                  flex
                  items-center
                  gap-2
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
                    text-xs
                    font-bold
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
                    bg-yellow-400
                  "
                  style={{
                    width: `${
                      progress[
                        video.id
                      ] || 0
                    }%`
                  }}
                />

              </div>

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

                <Heart size={28} />

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

                <MessageCircle
                  size={28}
                />

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

                <Share2
                  size={28}
                />

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

                <Bookmark
                  size={26}
                />

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
