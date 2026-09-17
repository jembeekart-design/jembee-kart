"use client";

import Link from "next/link";
import {
  Music2,
  BadgeCheck,
  MoreVertical,
} from "lucide-react";
import FollowButton from "@/components/social/FollowButton";

interface VideoInfoProps {
  creatorId: string;
  displayName?: string;
  username: string;
  photoURL?: string;
  caption: string;
  hashtags: string[];
  music: string;
  verified?: boolean;
  originalVideoId?: string;
}

export default function VideoInfo({
  creatorId,
  displayName,
  username,
  photoURL,
  caption,
  hashtags,
  music,
  verified,
  originalVideoId,
}: VideoInfoProps) {
  const displayLabel =
    displayName || username || "Unknown User";

  return (
    <div
      className="
        pointer-events-none
        absolute
        bottom-[calc(6.6rem+env(safe-area-inset-bottom))]
        left-5
        right-16
        z-40
        text-white
      "
    >
      {/* CREATOR ROW — REFERENCE STYLE */}
      <div className="flex items-center gap-3">
        {/* AVATAR */}
        <div
          className="
            h-[54px]
            w-[54px]
            shrink-0
            rounded-full
            bg-gradient-to-br
            from-cyan-300
            via-cyan-400
            to-orange-400
            p-[2px]
            shadow-[0_0_12px_rgba(34,211,238,0.4)]
          "
        >
          <div className="h-full w-full rounded-full bg-black p-[2px]">
            {photoURL ? (
              <img
                src={photoURL}
                alt={displayLabel}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <div className="h-full w-full rounded-full bg-zinc-800" />
            )}
          </div>
        </div>

        {/* USERNAME */}
        <div className="min-w-0 max-w-[48vw]">
          <div className="flex items-center gap-1">
            <Link
              href={`/mlm/watch-earn/uploader/${creatorId}`}
              className="
                pointer-events-auto
                truncate
                text-[16px]
                font-extrabold
                text-white
                drop-shadow-[0_2px_5px_rgba(0,0,0,0.9)]
              "
            >
              {displayLabel}
            </Link>

            {verified && (
              <BadgeCheck
                size={16}
                className="shrink-0 text-cyan-300"
              />
            )}
          </div>
        </div>

        {/* FOLLOW — SAME ROW */}
        <div className="pointer-events-auto shrink-0">
          <FollowButton targetUid={creatorId} />
        </div>
      </div>

      {/* CAPTION */}
      {caption && (
        <p
          className="
            pointer-events-auto
            mt-3
            text-[15px]
            font-medium
            leading-5
            text-white
            drop-shadow-[0_2px_5px_rgba(0,0,0,0.9)]
          "
        >
          {caption}
        </p>
      )}

      {/* HASHTAGS */}
      {hashtags && hashtags.length > 0 && (
        <div
          className="
            pointer-events-auto
            mt-1
            flex
            flex-wrap
            gap-x-2
            gap-y-0.5
          "
        >
          {hashtags.slice(0, 5).map((tag) => (
            <span
              key={tag}
              className="
                text-[14px]
                font-bold
                text-cyan-300
                drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]
              "
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* ORIGINAL SOUND — REFERENCE STYLE */}
      <div
        className="
          pointer-events-auto
          mt-3
          inline-flex
          max-w-[94%]
          items-center
          gap-2
          rounded-full
          bg-black/45
          px-4
          py-2.5
          backdrop-blur-md
        "
      >
        <Music2
          size={20}
          strokeWidth={2.2}
          className="shrink-0 text-white"
        />

        <span className="truncate text-[13px] font-medium text-white/85">
          {music || "Original Sound - Jembee Shorts"}
        </span>
      </div>

      {/* ORIGINAL VIDEO */}
      {originalVideoId && (
        <a
          href={`/mlm/watch-earn/original/${originalVideoId}`}
          className="
            pointer-events-auto
            mt-2
            inline-block
            rounded-full
            bg-black/45
            px-3
            py-1.5
            text-[11px]
            font-bold
            text-cyan-200
            backdrop-blur-md
          "
        >
          Created from Original
        </a>
      )}
    </div>
  );
}
