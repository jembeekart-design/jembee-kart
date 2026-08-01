"use client";

import React from "react";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Share2, Bookmark, Coins, Volume2, VolumeX } from "lucide-react";

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
    { key: "like", icon: <Heart size={22} className={isLiked ? "fill-red-500 text-red-500" : ""} />, label: "Like", value: likes, onClick: onLike },
    { key: "comment", icon: <MessageCircle size={22} />, label: "Comment", value: comments, onClick: onComment },
    { key: "share", icon: <Share2 size={22} />, label: "Share", value: shares, onClick: onShare },
    { key: "save", icon: <Bookmark size={22} className={isSaved ? "fill-white" : ""} />, label: "Save", value: null, onClick: onSave },
    { key: "mute", icon: isMuted ? <VolumeX size={22} /> : <Volume2 size={22} />, label: "Toggle Mute", value: null, onClick: toggleMute },
  ];

  return (
    <aside className="absolute right-4 bottom-[calc(10rem+env(safe-area-inset-bottom))] z-40 flex flex-col items-center gap-4">
      {actions.map((a) => (
        <div key={a.key} className="flex flex-col items-center gap-1">
          <motion.button
            whileTap={{ scale: 0.95 }}
            aria-label={a.label}
            onClick={a.onClick}
            className="h-12 w-12 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md shadow-lg border border-white/10"
          >
            {a.icon}
          </motion.button>

          {a.value != null && (
            <span className="text-xs font-medium text-white drop-shadow-md">{a.value}</span>
          )}
        </div>
      ))}

      <div className="flex items-center gap-1.5 rounded-full border border-yellow-500/20 bg-black/20 backdrop-blur-md px-3 py-1.5 text-xs font-bold text-yellow-400">
        <Coins size={14} />
        <span>+{coins}</span>
      </div>
    </aside>
  );
}
