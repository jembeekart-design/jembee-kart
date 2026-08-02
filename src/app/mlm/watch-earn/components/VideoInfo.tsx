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
      className="absolute bottom-[calc(10rem+env(safe-area-inset-bottom))] left-4 z-40 max-w-[72%] text-[var(--button-text-color)] pointer-events-none"
      aria-hidden={false}
    >

      {/* Compact user row */}

      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-500 to-yellow-400 p-0.5">
          <div className="h-full w-full rounded-full bg-[var(--card-color)]" aria-hidden />
        </div>

        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold">@{username}</span>
            {verified && (
              <BadgeCheck size={14} className="text-blue-400" aria-label="Verified account" />
            )}
          </div>

          <span className="text-xs text-[var(--text-color)]/80 truncate max-w-[40vw]">{music}</span>
        </div>
      </div>

      {/* Caption (compact) */}
      {caption && (
        <p className="mt-2 text-sm leading-5 max-w-[72%] text-[var(--button-text-color)]/90 pointer-events-auto">
          {caption}
        </p>
      )}

      {/* Hashtags (compact single-line overflow) */}
      {hashtags && hashtags.length > 0 && (
        <div className="mt-2 flex items-center gap-2 overflow-hidden">
          {hashtags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-xs font-semibold text-[var(--primary-color)]">#{tag}</span>
          ))}
          {hashtags.length > 3 && (
            <span className="text-xs text-[var(--text-color)]/70">+{hashtags.length - 3}</span>
          )}
        </div>
      )}

    </div>
  );
}
