"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface FloatingAd {
  id: string;
  enabled: boolean;
  title: string;
  imageUrl: string;
  actionUrl: string;
  skipAfterSeconds: number;
  position: "left" | "right" | "center";
}

export default function FloatingAdComponent({
  ad,
  onDismiss,
  autoDismissSeconds = 8,
}: {
  ad: FloatingAd;
  onDismiss?: () => void;
  autoDismissSeconds?: number;
}) {
  const [countdown, setCountdown] = useState(autoDismissSeconds);
  const dismissNotified = useRef(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((current) => Math.max(0, current - 1)), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  useEffect(() => {
    if (countdown === 0 && !dismissNotified.current) {
      dismissNotified.current = true;
      onDismiss?.();
    }
  }, [countdown, onDismiss]);

  if (countdown === 0 || !ad.enabled || !ad.imageUrl || !ad.actionUrl) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`fixed bottom-20 ${ad.position === 'left' ? 'left-4' : ad.position === 'right' ? 'right-4' : 'left-1/2 -translate-x-1/2'} z-40`}
      >
        <div className="relative bg-white p-2 rounded-full shadow-lg border-2 border-yellow-500">
          <div className="w-12 h-12 flex items-center justify-center font-bold text-lg">
              {countdown}
            </div>
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
