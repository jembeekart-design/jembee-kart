"use client";

import React from "react";
import { motion } from "framer-motion";

export default function VideoActions() {
  return (
    <aside className="absolute right-3 bottom-28 z-40 flex flex-col items-center gap-3">
      {[
        { key: "like", label: "Like", icon: "♥" },
        { key: "comment", label: "Comment", icon: "💬" },
        { key: "share", label: "Share", icon: "↗" },
        { key: "save", label: "Save", icon: "🔖" },
      ].map((a) => (
        <motion.button
          key={a.key}
          whileTap={{ scale: 0.95 }}
          aria-label={a.label}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--card-color)]/30 backdrop-blur-sm shadow-sm"
        >
          <span className="text-white">{a.icon}</span>
        </motion.button>
      ))}
    </aside>
  );
}
