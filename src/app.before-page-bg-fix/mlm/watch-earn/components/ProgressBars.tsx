"use client";

import React from "react";
import { motion } from "framer-motion";

export default function ProgressBars() {
  return (
    <div className="pointer-events-none fixed left-0 right-0 top-16 z-40 flex items-center justify-center px-4">
      <div className="w-full max-w-3xl">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-2"
        >
          <div className="h-1 w-full rounded-full bg-white/10" />
        </motion.div>
      </div>
    </div>
  );
}
