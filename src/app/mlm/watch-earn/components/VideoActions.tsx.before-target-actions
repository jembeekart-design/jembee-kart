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
  toggleMute: () => void;
  isLiked: boolean;
  isSaved: boolean;
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
  toggleMute,
  isLiked,
  isSaved,
}: VideoActionsProps) {
  const actions = [
    {
      key: "like",
      icon: (
        <Heart
          size={25}
          strokeWidth={2}
          className={
            isLiked
              ? "fill-red-500 text-red-500"
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
      icon: <MessageCircle size={25} strokeWidth={2} />,
      value: comments,
      label: "Comments",
      onClick: onComment,
    },
    {
      key: "share",
      icon: <Share2 size={25} strokeWidth={2} />,
      value: shares,
      label: "Share",
      onClick: onShare,
    },
    {
      key: "save",
      icon: (
        <Bookmark
          size={25}
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
    {
      key: "mute",
      icon: isMuted ? (
        <VolumeX size={25} strokeWidth={2} />
      ) : (
        <Volume2 size={25} strokeWidth={2} />
      ),
      label: isMuted ? "Unmute" : "Mute",
      onClick: toggleMute,
    },
  ];

  return (
    <aside
      className="
        pointer-events-auto
        absolute
        right-3
        bottom-[calc(8.5rem+env(safe-area-inset-bottom))]
        z-40
        flex
        flex-col
        items-center
        gap-3
      "
    >
      {actions.map((action, index) => (
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
            className={`
              relative
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-full
              border
              backdrop-blur-xl
              shadow-lg
              transition-all
              ${
                index === 0 && isLiked
                  ? "border-red-400/60 bg-red-500/20"
                  : "border-white/20 bg-black/35"
              }
              active:bg-white/20
            `}
          >
            {action.icon}
          </motion.button>

          {action.value !== undefined && (
            <span
              className="
                mt-1
                min-w-[24px]
                text-center
                text-[12px]
                font-bold
                text-white
                drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]
              "
            >
              {action.value}
            </span>
          )}
        </div>
      ))}
    </aside>
  );
}
