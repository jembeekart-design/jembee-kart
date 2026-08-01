"use client";

import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Coins,
} from "lucide-react";
import { motion } from "framer-motion";
import React from "react";

interface VideoActionsProps {
  likes: number;
  comments: number;
  shares: number;
  coins: number;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
}

export default function VideoActions({
  likes,
  comments,
  shares,
  coins,
  onLike,
  onComment,
  onShare,
}: VideoActionsProps) {
  return (
    <div className="absolute bottom-24 right-3 z-40 flex flex-col items-center gap-4">
      <motion.button
        onClick={onLike}
        whileTap={{ scale: 0.95 }}
        aria-label="Like"
        className="flex flex-col items-center gap-1"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--card-color)]/30 text-[var(--button-text-color)] backdrop-blur-md shadow">
          <Heart size={26} />
        </div>
        <span className="text-xs font-semibold text-[var(--button-text-color)]">{likes}</span>
      </motion.button>

      <motion.button
        onClick={onComment}
        whileTap={{ scale: 0.95 }}
        aria-label="Comment"
        className="flex flex-col items-center gap-1"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--card-color)]/30 text-[var(--button-text-color)] backdrop-blur-md shadow">
          <MessageCircle size={26} />
        </div>
        <span className="text-xs font-semibold text-[var(--button-text-color)]">{comments}</span>
      </motion.button>

      <motion.button
        onClick={onShare}
        whileTap={{ scale: 0.95 }}
        aria-label="Share"
        className="flex flex-col items-center gap-1"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--card-color)]/30 text-[var(--button-text-color)] backdrop-blur-md shadow">
          <Share2 size={26} />
        </div>
        <span className="text-xs font-semibold text-[var(--button-text-color)]">{shares}</span>
      </motion.button>

      <button aria-label="Save" className="flex flex-col items-center gap-1">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--card-color)]/30 text-[var(--button-text-color)] backdrop-blur-md shadow">
          <Bookmark size={24} />
        </div>
        <span className="text-xs font-semibold text-[var(--button-text-color)]">Save</span>
      </button>

      <div className="flex items-center gap-2 rounded-full border border-[var(--warning-color)]/30 bg-[var(--warning-color)]/15 px-3 py-1 backdrop-blur-md">
        <Coins size={16} className="text-[var(--warning-color)]" />
        <span className="text-sm font-bold text-[var(--button-text-color)]">+{coins}</span>
      </div>
    </div>
  );
}
