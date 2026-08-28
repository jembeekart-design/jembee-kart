"use client";

import React from "react";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Share2, Bookmark, Volume2 } from "lucide-react";
import GlassCard from "./GlassCard";

export default function RightActions() {
  return (
    <aside className="pointer-events-auto fixed right-3 top-1/3 z-40 flex transform -translate-y-1/2 flex-col items-center gap-4">
      {[
        { key: "like", icon: <Heart size={26} />, label: "Like" },
        { key: "comment", icon: <MessageCircle size={26} />, label: "Comment" },
        { key: "share", icon: <Share2 size={26} />, label: "Share" },
        { key: "save", icon: <Bookmark size={24} />, label: "Save" },
        { key: "mute", icon: <Volume2 size={24} />, label: "Mute" }
      ].map((action) => (
        <motion.button
          key={action.key}
          whileTap={{ scale: 0.95 }}
          className="flex flex-col items-center gap-1"
          aria-label={action.label}
        >
          <GlassCard className="p-3 rounded-full">
            <div className="flex h-14 w-14 items-center justify-center rounded-full">
              {action.icon}
            </div>
          </GlassCard>
          <span className="text-xs font-semibold text-white/90"> </span>
        </motion.button>
      ))}
    </aside>
  );
}
