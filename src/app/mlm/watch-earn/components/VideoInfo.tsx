"use client";
import {
  Music2,
  BadgeCheck
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
  originalVideoId
}: VideoInfoProps) {
  const displayLabel = displayName || username || "Unknown User";

  return (
    <div
      className="absolute bottom-[calc(10rem+env(safe-area-inset-bottom))] left-4 z-40 max-w-[72%] text-[var(--button-text-color)] pointer-events-none"
      aria-hidden={false}
    >
      {/* Compact user row */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-500 to-yellow-400 p-0.5">
          {photoURL ? (
            <img src={photoURL} alt={displayLabel} className="h-full w-full rounded-full object-cover" />
          ) : (
            <div className="h-full w-full rounded-full bg-[var(--color-card-background)]" aria-hidden />
          )}
        </div>

        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold">{displayLabel}</span>
            {verified && (
              <BadgeCheck size={14} className="text-blue-400" aria-label="Verified account" />
            )}
            <div className="pointer-events-auto">
              <FollowButton targetUid={creatorId} />
            </div>
          </div>

          <span className="text-xs text-[var(--text-primary)]/80 truncate max-w-[40vw]">{music}</span>
          {originalVideoId && (
            <a href={`/mlm/watch-earn/original/${originalVideoId}`} className="text-xs font-bold text-pink-500 pointer-events-auto">
              Created from Original
            </a>
          )}
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
            <span key={tag} className="text-xs font-semibold text-[var(--color-primary-button)]">#{tag}</span>
          ))}
          {hashtags.length > 3 && (
            <span className="text-xs text-[var(--text-primary)]/70">+{hashtags.length - 3}</span>
          )}
        </div>
      )}
    </div>
  );
}
