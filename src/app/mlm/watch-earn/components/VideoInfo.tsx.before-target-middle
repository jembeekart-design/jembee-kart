"use client";

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
    <div className="pointer-events-none absolute bottom-[calc(6.8rem+env(safe-area-inset-bottom))] left-4 right-20 z-40 text-white">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 shrink-0 rounded-full bg-gradient-to-br from-cyan-300 via-cyan-400 to-orange-400 p-[2px] shadow-[0_0_14px_rgba(34,211,238,0.35)]">
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

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="max-w-[45vw] truncate text-[15px] font-black drop-shadow-lg">
              {displayLabel}
            </span>

            {verified && (
              <BadgeCheck size={16} className="shrink-0 text-cyan-300" />
            )}

            <div className="pointer-events-auto">
              <FollowButton targetUid={creatorId} />
            </div>
          </div>

          <div className="mt-0.5 flex items-center gap-1 text-xs text-white/70">
            <Music2 size={12} />
            <span className="max-w-[45vw] truncate">
              {music || "Original Sound - Jembee Shorts"}
            </span>
          </div>
        </div>

        <button
          type="button"
          aria-label="More options"
          className="pointer-events-auto ml-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-md"
        >
          <MoreVertical size={20} />
        </button>
      </div>

      {caption && (
        <p className="pointer-events-auto mt-3 max-w-[92%] text-[14px] font-medium leading-5 text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
          {caption}
        </p>
      )}

      {hashtags && hashtags.length > 0 && (
        <div className="pointer-events-auto mt-1.5 flex flex-wrap gap-x-2 gap-y-0.5">
          {hashtags.slice(0, 5).map((tag) => (
            <span
              key={tag}
              className="text-[13px] font-bold text-cyan-300 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {originalVideoId && (
        <a
          href={`/mlm/watch-earn/original/${originalVideoId}`}
          className="pointer-events-auto mt-2 inline-block rounded-full bg-black/40 px-3 py-1.5 text-[11px] font-bold text-cyan-200 backdrop-blur-md"
        >
          Created from Original
        </a>
      )}
    </div>
  );
}
