"use client";

import {
  useEffect,
  useRef,
  useState
} from "react";

import {
  Play,
  Pause
} from "lucide-react";

import {
  fetchWatchVideos,
  WatchVideo
} from "@/lib/mlm/watch-earn/fetchWatchVideos";

export default function WatchEarnPage() {

  const videoRefs =
    useRef<
      HTMLVideoElement[]
    >([]);

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
    pausedVideos,
    setPausedVideos
  ] = useState<string[]>(
    []
  );

  /* =========================
     FETCH VIDEOS
  ========================= */

  useEffect(() => {

    async function loadVideos() {

      try {

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

        setLoading(false);
      }
    }

    loadVideos();

  }, []);

  /* =========================
     AUTO PLAY
  ========================= */

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
    videos
  ]);

  /* =========================
     PLAY / PAUSE
  ========================= */

  function toggleVideo(
    videoId: string,
    index: number
  ) {

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

        Loading...

      </main>
    );
  }

  /* =========================
     NO VIDEOS
  ========================= */

  if (
    videos.length === 0
  ) {

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

        No videos found

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

              className="
                h-full
                w-full
                object-cover
              "

              muted

              loop

              playsInline

              autoPlay

              preload="auto"

              onLoadedData={() => {

                const currentVideo =
                  videoRefs.current[
                    index
                  ];

                if (
                  currentVideo
                ) {

                  currentVideo
                    .play()
                    .catch(() => {});
                }
              }}

              onClick={() => {

                setCurrentIndex(
                  index
                );

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
                bg-black/30
              "
            />

            {/* PLAY BUTTON */}

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
                z-50
                flex
                h-20
                w-20
                -translate-x-1/2
                -translate-y-1/2
                items-center
                justify-center
                rounded-full
                bg-black/50
                text-white
              "
            >

              {pausedVideos.includes(
                video.id
              ) ? (

                <Play
                  size={35}
                />

              ) : (

                <Pause
                  size={35}
                />

              )}

            </button>

            {/* VIDEO INFO */}

            <div
              className="
                absolute
                bottom-10
                left-5
                z-50
                text-white
              "
            >

              <h2
                className="
                  text-2xl
                  font-bold
                "
              >

                @{video.username}

              </h2>

              <p
                className="
                  mt-2
                  text-sm
                "
              >

                {video.caption}

              </p>

            </div>

          </section>
        )
      )}

    </main>
  );
}
