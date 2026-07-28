"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Share2, Bookmark, Coins, BadgeCheck, Music2, Pause, Play } from "lucide-react";

interface VideoCardProps {
  video: {
    id: string;
    username: string;
    caption: string;
    video: string;
    coins: number;
    verified?: boolean;
    likes: number;
    comments: number;
    shares: number;
    music: string;
    hashtags?: string[];
  };
  isMuted: boolean;
  toggleMute: () => void;
  watchProgress: number;
  active: boolean;
  onClaim: () => void;
  onComment: () => void;
  onShare: () => void;
}

export default function VideoCard({ video, isMuted, toggleMute, watchProgress, active, onClaim, onComment, onShare }: VideoCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Synchronize active state with play/pause
  useEffect(() => {
    if (videoRef.current) {
      if (active) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0; // Reset on pause
      }
    }
  }, [active]);

  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
    }
    
    setShowOverlay(true);
    setTimeout(() => setShowOverlay(false), 1000);
  };

  return (
    <div className="relative h-full w-full bg-black">
      <video
        ref={videoRef}
        src={video.video}
        muted={isMuted}
        loop
        playsInline
        className="h-full w-full object-cover"
        onClick={handleTogglePlay}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Play/Pause transient overlay */}
      <AnimatePresence>
        {showOverlay && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none z-30"
          >
            <div className="bg-black/40 p-6 rounded-full backdrop-blur-sm">
                {isPlaying ? (
                    <Play size={48} className="text-white fill-white" />
                ) : (
                    <Pause size={48} className="text-white fill-white" />
                )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Section */}
      <div className="absolute bottom-24 left-4 z-20 max-w-[75%] text-white pointer-events-none">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold">@{video.username}</h2>
          {video.verified && <BadgeCheck size={16} className="text-blue-500 fill-blue-500" />}
        </div>
        <p className="mt-2 text-sm line-clamp-2">{video.caption}</p>
        <div className="mt-2 flex gap-2 flex-wrap">
          {video.hashtags?.map(tag => (
            <span key={tag} className="text-xs font-semibold text-white/80">#{tag}</span>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2 bg-black/20 backdrop-blur-md px-3 py-1 rounded-full w-fit">
          <Music2 size={12} />
          <span className="text-xs">{video.music}</span>
        </div>

        {/* Reward Progress Countdown */}
        <div className="mt-4 w-full">
            <div className="flex justify-between items-end mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-yellow-500">Reward Progress</span>
                <span className="text-[10px] font-bold text-white/60">{Math.round(watchProgress)}%</span>
            </div>
            <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                <motion.div 
                    className="h-full bg-yellow-500"
                    animate={{ width: `${watchProgress}%` }}
                    transition={{ type: "spring", bounce: 0, duration: 0.5 }}
                />
            </div>
        </div>
      </div>

      {/* Mute toggle */}
      <button 
        onClick={toggleMute} 
        className="absolute right-4 top-20 z-20 rounded-full bg-black/50 p-2.5 text-white backdrop-blur-md border border-white/10"
      >
        {isMuted ? "🔇" : "🔊"}
      </button>

      {/* Social Actions */}
      <div className="absolute right-3 bottom-36 z-20 flex flex-col gap-6 text-white pointer-events-auto">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setIsLiked(!isLiked)} className="flex flex-col items-center">
          <div className="p-3 bg-black/20 rounded-full backdrop-blur-md mb-1">
            <Heart size={28} className={isLiked ? "fill-red-500 text-red-500" : ""} />
          </div>
          <span className="text-xs font-bold">{isLiked ? (video.likes + 1).toLocaleString() : video.likes.toLocaleString()}</span>
        </motion.button>
        
        <button onClick={onComment} className="flex flex-col items-center">
            <div className="p-3 bg-black/20 rounded-full backdrop-blur-md mb-1">
                <MessageCircle size={28} />
            </div>
            <span className="text-xs font-bold">{video.comments.toLocaleString()}</span>
        </button>
        
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setIsSaved(!isSaved)} className="flex flex-col items-center">
          <div className="p-3 bg-black/20 rounded-full backdrop-blur-md mb-1">
            <Bookmark size={28} className={isSaved ? "fill-white" : ""} />
          </div>
          <span className="text-xs font-bold">Save</span>
        </motion.button>
        
        <button onClick={onShare} className="flex flex-col items-center">
            <div className="p-3 bg-black/20 rounded-full backdrop-blur-md mb-1">
                <Share2 size={28} />
            </div>
            <span className="text-xs font-bold">Share</span>
        </button>
      </div>
    </div>
  );
}
