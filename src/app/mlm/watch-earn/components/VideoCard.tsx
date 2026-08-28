"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BadgeCheck, Music2, Pause, Play } from "lucide-react";
import VideoActions from "./VideoActions";

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
    originalVideoId?: string;
  };
  isMuted: boolean;
  toggleMute: () => void;
  watchProgress: number;
  active: boolean;
  onComment: () => void;
  onShare: () => void;
  coins: number;
}

export default function VideoCard({ 
    video, 
    isMuted, 
    toggleMute, 
    watchProgress, 
    active, 
    onComment, 
    onShare,
    coins 
}: VideoCardProps) {
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
                    <Pause size={48} className="text-white fill-white" />
                ) : (
                    <Play size={48} className="text-white fill-white" />
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
        
        {video.originalVideoId && (
          <a href={`/mlm/watch-earn/original/${video.originalVideoId}`} className="text-xs font-bold text-pink-500 pointer-events-auto">
            Created from Original
          </a>
        )}
        
        {/* Product Strip */}
        <div className="mt-3 w-full bg-white/10 p-2 rounded-lg pointer-events-auto">
           <p className="text-xs">Product Strip (Slideable)</p>
        </div>
      </div>

      {/* Consolidated Social Actions */}
      <VideoActions
        likes={video.likes}
        comments={video.comments}
        shares={video.shares}
        coins={coins}
        isMuted={isMuted}
        toggleMute={toggleMute}
        onLike={() => setIsLiked(!isLiked)}
        onComment={onComment}
        onShare={onShare}
        onSave={() => setIsSaved(!isSaved)}
        isLiked={isLiked}
        isSaved={isSaved}
      />
    </div>
  );
}
