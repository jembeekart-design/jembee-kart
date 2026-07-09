"use client";

import {
  Music2,
  BadgeCheck
} from "lucide-react";

interface VideoInfoProps {

  username: string;

  caption: string;

  hashtags: string[];

  music: string;

  verified?: boolean;

}

export default function
VideoInfo({
  username,
  caption,
  hashtags,
  music,
  verified
}: VideoInfoProps) {

  return (

    <div
      className="
        absolute
        bottom-24
        left-4
        z-40
        max-w-[75%]
        text-[var(--button-text-color)]
      "
    >

      {/* USER */}

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

          @{username}

        </h2>

        {verified && (

          <BadgeCheck
            size={18}
            className="
              fill-blue-500
              text-[var(--button-text-color)]
            "
          />

        )}

      </div>

      {/* CAPTION */}

      <p
        className="
          mt-3
          text-sm
          leading-6
          text-gray-100
        "
      >

        {caption}

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

        {hashtags.map(
          (tag) => (

            <span
              key={tag}
              className="
                rounded-full
                bg-[var(--card-color)]/10
                px-3
                py-1
                text-xs
                font-bold
                text-blue-200
                backdrop-blur-xl
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
          bg-[var(--card-color)]/40
          px-4
          py-2
          backdrop-blur-xl
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
            text-[var(--button-text-color)]
          "
        >

          {music}

        </p>

      </div>

    </div>
  );
}
