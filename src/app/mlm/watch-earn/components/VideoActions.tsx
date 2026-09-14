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
          size={31}
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
          size={30}
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
          size={30}
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
          size={30}
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
        right-5
        bottom-[calc(8rem+env(safe-area-inset-bottom))]
        z-40
        flex
        flex-col
        items-center
        gap-5
      "
    >
      {actions.map((action) => (
        <div
          key={action.key}
          className="flex flex-col items-center"
        >
          <motion.button
            type="button"
            whileTap={{ scale: 0.86 }}
            aria-label={action.label}
            title={action.label}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              action.onClick();
            }}
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              bg-transparent
              text-white
              drop-shadow-[0_2px_5px_rgba(0,0,0,0.8)]
            "
          >
            {action.icon}
          </motion.button>

          {action.value !== undefined && (
            <span
              className="
                -mt-1
                text-[13px]
                font-medium
                leading-none
                text-white
                drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]
              "
            >
              {action.value}
            </span>
          )}
        </div>
      ))}

      {/* SOUND — REFERENCE STYLE */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.86 }}
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
          h-12
          w-12
          items-center
          justify-center
          rounded-full
          border-2
          border-cyan-400
          bg-black/20
          text-white
          shadow-[0_0_12px_rgba(34,211,238,0.35)]
          backdrop-blur-sm
        "
      >
        {isMuted ? (
          <VolumeX size={29} strokeWidth={2} />
        ) : (
          <Volume2 size={29} strokeWidth={2} />
        )}
      </motion.button>
    </aside>
  );
}
