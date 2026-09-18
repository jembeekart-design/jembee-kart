"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Volume2,
  VolumeX,
} from "lucide-react";
import ShortsMenuSheet from "./ShortsMenuSheet";

export interface VideoActionsProps {
  likes: number;
  comments: number;
  shares: number;
  coins: number;
  isMuted: boolean;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onSave: () => void;
  onReport?: (reason: string) => void;
  onInterested?: () => void;
  onNotInterested?: () => void;
  onWhySeeing?: () => void;
  toggleMute: () => void;
  isLiked: boolean;
  isSaved: boolean;
  onPlaybackSpeedChange?: (speed: number) => void;
  currentPlaybackSpeed?: number;
}

export default function VideoActions({
  likes,
  comments,
  shares,
  isMuted,
  onLike,
  onComment,
  onShare,
  onSave,
  onReport,
  onInterested,
  onNotInterested,
  onWhySeeing,
  toggleMute,
  isLiked,
  isSaved,
  onPlaybackSpeedChange,
  currentPlaybackSpeed,
}: VideoActionsProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const actions = [
    {
      key: "like",
      icon: (
        <Heart
          size={30}
          strokeWidth={2}
          className={
            isLiked
              ? "fill-white text-white"
              : "text-white"
          }
        />
      ),
      value: likes,
      label: isLiked ? "Unlike" : "Like",
      onClick: onLike,
    },
    {
      key: "comment",
      icon: (
        <MessageCircle
          size={29}
          strokeWidth={2}
          className="text-white"
        />
      ),
      value: comments,
      label: "Comments",
      onClick: onComment,
    },
    {
      key: "share",
      icon: (
        <Share2
          size={29}
          strokeWidth={2}
          className="text-white"
        />
      ),
      value: shares,
      label: "Share",
      onClick: onShare,
    },
    {
      key: "save",
      icon: (
        <Bookmark
          size={29}
          strokeWidth={2}
          className={
            isSaved
              ? "fill-white text-white"
              : "text-white"
          }
        />
      ),
      label: isSaved ? "Unsave" : "Save",
      onClick: onSave,
    },
  ];

  return (
    <aside
      className="
        pointer-events-auto
        absolute
        right-2
        bottom-[calc(9.6rem+env(safe-area-inset-bottom))]
        z-40
        flex
        flex-col
        items-center
        gap-3
      "
    >
      {actions.map((action) => (
        <div
          key={action.key}
          className="flex flex-col items-center"
        >
          <motion.button
            type="button"
            whileTap={{ scale: 0.88 }}
            aria-label={action.label}
            title={action.label}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              action.onClick();
            }}
            className="
              flex
              h-[44px]
              w-[44px]
              items-center
              justify-center
              rounded-full
              border
              border-white/35
              bg-black/20
              text-white
              backdrop-blur-[2px]
              shadow-[0_2px_8px_rgba(0,0,0,0.45)]
              transition-transform
              active:bg-white/10
            "
          >
            {action.icon}
          </motion.button>

          {action.value !== undefined && (
            <span
              className="
                mt-1
                min-w-[18px]
                text-center
                text-[12px]
                font-bold
                leading-none
                text-white
                drop-shadow-[0_2px_5px_rgba(0,0,0,0.9)]
              "
            >
              {action.value}
            </span>
          )}
        </div>
      ))}

      {/* MORE */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.88 }}
        aria-label="More options"
        title="More options"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setMenuOpen(true);
        }}
        className="
          flex
          h-[44px]
          w-[44px]
          items-center
          justify-center
          rounded-full
          border
          border-white/35
          bg-black/20
          text-white
          backdrop-blur-[2px]
          shadow-[0_2px_8px_rgba(0,0,0,0.45)]
        "
      >
        <span className="flex flex-col items-center gap-[3px]">
          <span className="h-[3px] w-[3px] rounded-full bg-white" />
          <span className="h-[3px] w-[3px] rounded-full bg-white" />
          <span className="h-[3px] w-[3px] rounded-full bg-white" />
        </span>
      </motion.button>

      <ShortsMenuSheet
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        isSaved={isSaved}
        onSave={onSave}
        onPlaybackSpeedChange={onPlaybackSpeedChange}
        currentPlaybackSpeed={currentPlaybackSpeed}
        onReport={onReport}
        onInterested={onInterested}
        onNotInterested={onNotInterested}
        onWhySeeing={onWhySeeing}
      />

      {/* SOUND */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.88 }}
        aria-label={isMuted ? "Unmute" : "Mute"}
        title={isMuted ? "Unmute" : "Mute"}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          toggleMute();
        }}
        className="
          mt-1
          flex
          h-[48px]
          w-[48px]
          items-center
          justify-center
          rounded-full
          border-2
          border-cyan-400
          bg-black/20
          text-white
          backdrop-blur-[2px]
          shadow-[0_0_14px_rgba(34,211,238,0.5)]
        "
      >
        {isMuted ? (
          <VolumeX size={24} strokeWidth={2} />
        ) : (
          <Volume2 size={24} strokeWidth={2} />
        )}
      </motion.button>
    </aside>
  );
}
