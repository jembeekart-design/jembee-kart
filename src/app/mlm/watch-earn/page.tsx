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
  Coins
} from "lucide-react";

interface VideoItem {
  id: string;

  username: string;

  caption: string;

  video: string;

  coins: number;
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

        video:
          "https://www.w3schools.com/html/mov_bbb.mp4",

        coins: 5
      },

      {
        id: "2",

        username:
          "Fashion Store",

        caption:
          "New Trending Collection",

        video:
          "https://www.w3schools.com/html/movie.mp4",

        coins: 10
      }
    ]);

  const [
    currentIndex,
    setCurrentIndex
  ] = useState(0);

  const [
    earnedCoins,
    setEarnedCoins
  ] = useState(0);

  useEffect(() => {

    videoRefs.current.forEach(
      (
        video,
        index
      ) => {

        if (!video) return;

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
    coins: number
  ) {

    setEarnedCoins(
      (prev) =>
        prev + coins
    );
  }

  return (

    <main className="h-screen overflow-y-scroll snap-y snap-mandatory bg-black">

      {/* TOP BAR */}

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
          text-white
        "
      >

        <h1 className="text-2xl font-black">

          Watch & Earn

        </h1>

        <div
          className="
            flex
            items-center
            gap-2
            rounded-full
            bg-black/40
            px-4
            py-2
          "
        >

          <Coins size={18} />

          <span className="font-bold">

            {earnedCoins}

          </span>

        </div>

      </div>

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

              onEnded={() => {

                rewardCoins(
                  video.coins
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

            {/* TEXT */}

            <div
              className="
                absolute
                bottom-24
                left-4
                z-20
                text-white
              "
            >

              <h2 className="text-xl font-black">

                @{video.username}

              </h2>

              <p className="mt-2 max-w-[250px] text-sm">

                {video.caption}

              </p>

              <button
                onClick={() =>
                  rewardCoins(
                    video.coins
                  )
                }
                className="
                  mt-4
                  rounded-full
                  bg-yellow-400
                  px-5
                  py-2
                  font-black
                  text-black
                "
              >

                Claim {video.coins} Coins

              </button>

            </div>

            {/* RIGHT ACTIONS */}

            <div
              className="
                absolute
                bottom-28
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
                "
              >

                <Heart
                  size={28}
                />

                <span className="text-xs">

                  12K

                </span>

              </button>

              <button
                className="
                  flex
                  flex-col
                  items-center
                "
              >

                <MessageCircle
                  size={28}
                />

                <span className="text-xs">

                  900

                </span>

              </button>

              <button
                className="
                  flex
                  flex-col
                  items-center
                "
              >

                <Share2
                  size={28}
                />

                <span className="text-xs">

                  Share

                </span>

              </button>

            </div>

          </section>
        )
      )}

    </main>
  );
}
