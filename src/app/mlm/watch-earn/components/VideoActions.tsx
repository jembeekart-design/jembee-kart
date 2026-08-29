"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Coins,
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
  coins,
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
          size={22}
          className={isLiked ? "fill-red-500 text-red-500" : ""}
        />
      ),
      label: isLiked ? "Unlike" : "Like",
      value: likes,
      onClick: onLike,
    },
    {
      key: "comment",
      icon: <MessageCircle size={22} />,
      label: "Comments",
      value: comments,
      onClick: onComment,
    },
    {
      key: "share",
      icon: <Share2 size={22} />,
      label: "Share",
      value: shares,
      onClick: onShare,
    },
    {
      key: "save",
      icon: (
        <Bookmark
          size={22}
          className={isSaved ? "fill-current" : ""}
        />
      ),
      label: isSaved ? "Unsave" : "Save",
      onClick: onSave,
    },
    {
      key: "mute",
      icon: isMuted ? <VolumeX size={22} /> : <Volume2 size={22} />,
      label: isMuted ? "Unmute" : "Mute",
      onClick: toggleMute,
    },
  ];

  return (
    <aside
      className="
        absolute
        right-4
        bottom-[calc(10rem+env(safe-area-inset-bottom))]
        z-30
        flex
        flex-col
        items-center
        gap-4
      "
    >
      {actions.map((action) => (
        <div
          key={action.key}
          className="flex flex-col items-center gap-1"
        >
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            aria-label={action.label}
            title={action.label}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              action.onClick();
            }}
            className="
              h-12
              w-12
              flex
              items-center
              justify-center
              rounded-full
              border
              border-white/20
              bg-black/20
              text-white
              backdrop-blur-md
              transition
              active:bg-black/40
            "
          >
            {action.icon}
          </motion.button>

          {action.value !== undefined && (
            <span className="text-xs font-medium text-white drop-shadow">
              {action.value}
            </span>
          )}
        </div>
      ))}

              +{coins}
            </span>
          </div>
        </div>
      )}
    </aside>
  );
}
