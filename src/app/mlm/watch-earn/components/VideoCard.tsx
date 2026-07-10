"use client";

import {
  Heart,
  MessageCircle,
  Share2,
  Coins
} from "lucide-react";

interface VideoCardProps {
  video: {
    id: string;

    username: string;

    caption: string;

    video: string;

    coins: number;
  };

  onClaim: () => void;
}

export default function
VideoCard({
  video,
  onClaim
}: VideoCardProps) {

  return (

    <section
      className="
        relative
        h-screen
        snap-start
      "
    >

      <video
        src={video.video}

        autoPlay

        muted

        loop

        playsInline

        className="
          h-full
          w-full
          object-cover
        "
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

      {/* LEFT CONTENT */}

      <div
        className="
          absolute
          bottom-24
          left-4
          z-20
          text-[var(--button-text-color)]
        "
      >

        <h2 className="text-xl font-black">

          @{video.username}

        </h2>

        <p className="mt-2 max-w-[250px] text-sm">

          {video.caption}

        </p>

        <button
          onClick={onClaim}
          className="
            mt-4
            flex
            items-center
            gap-2
            rounded-full
            bg-[var(--warning-color)]
            px-5
            py-2
            font-black
            text-[var(--text-color)]
          "
        >

          <Coins size={18} />

          Claim {video.coins}

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
          text-[var(--button-text-color)]
        "
      >

        <button
          className="
            flex
            flex-col
            items-center
          "
        >

          <Heart size={28} />

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

          <Share2 size={28} />

          <span className="text-xs">
            Share
          </span>

        </button>

      </div>

    </section>
  );
}
