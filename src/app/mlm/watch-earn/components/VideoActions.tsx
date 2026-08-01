"use client";

import React from "react";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Share2, Bookmark, Coins } from "lucide-react";

export interface VideoActionsProps {
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
  const actions = [
    { key: "like", icon: <Heart size={20} />, label: "Like", value: likes, onClick: onLike },
    { key: "comment", icon: <MessageCircle size={20} />, label: "Comment", value: comments, onClick: onComment },
    { key: "share", icon: <Share2 size={20} />, label: "Share", value: shares, onClick: onShare },
    { key: "save", icon: <Bookmark size={18} />, label: "Save", value: null, onClick: () => {} },
  ];

  return (
    <aside className="absolute right-3 bottom-28 z-40 flex flex-col items-center gap-3">
      {actions.map((a) => (
        <div key={a.key} className="flex flex-col items-center gap-1">
          <motion.button
            whileTap={{ scale: 0.95 }}
            aria-label={a.label}
            onClick={a.onClick}
            className="h-12 w-12 flex items-center justify-center rounded-full bg-[var(--card-color)]/28 backdrop-blur-sm shadow-sm"
          >
            {a.icon}
          </motion.button>

          {a.value != null && (
            <span className="text-xs font-semibold text-[var(--button-text-color)]">{a.value}</span>
          )}
        </div>
      ))}

      <div className="mt-1 flex items-center gap-2 rounded-full border border-[var(--warning-color)]/30 bg-[var(--warning-color)]/15 px-3 py-1 text-sm font-bold">
        <Coins size={14} className="text-[var(--warning-color)]" />
        <span className="text-[var(--button-text-color)]">+{coins}</span>
      </div>
    </aside>
  );
}
