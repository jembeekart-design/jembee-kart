"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export interface FloatingAd {
  id: string;
  enabled: boolean;
  title: string;
  imageUrl: string;
  actionUrl: string;
  skipAfterSeconds: number;
  position: "left" | "right" | "center";
}

export default function FloatingAdComponent({ ad }: { ad: FloatingAd }) {
  const [showAd, setShowAd] = useState(true);
  const [countdown, setCountdown] = useState(ad.skipAfterSeconds);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  if (!showAd) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`fixed bottom-20 ${ad.position === 'left' ? 'left-4' : ad.position === 'right' ? 'right-4' : 'left-1/2 -translate-x-1/2'} z-40`}
      >
        <div className="relative bg-white p-2 rounded-full shadow-lg border-2 border-yellow-500">
          {countdown > 0 ? (
            <div className="w-12 h-12 flex items-center justify-center font-bold text-lg">
              {countdown}
            </div>
          ) : (
            <button 
              onClick={() => setShowAd(false)}
              className="w-12 h-12 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300"
            >
              <X size={24} />
            </button>
          )}
          {ad.imageUrl && (
            <a href={ad.actionUrl} target="_blank" rel="noopener noreferrer" className="absolute -top-10 left-0">
               <img src={ad.imageUrl} alt={ad.title} className="w-12 h-12 rounded-full object-cover" />
            </a>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
