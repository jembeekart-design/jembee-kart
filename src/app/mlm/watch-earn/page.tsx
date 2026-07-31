"use client";

import { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Mousewheel } from "swiper/modules";
import "swiper/css";
import { motion } from "framer-motion";
import { fetchWatchVideos, WatchVideo } from "@/lib/mlm/watch-earn/fetchWatchVideos";
import VideoCard from "./components/VideoCard";
import { useAdminConfig } from "@/lib/admin-config/provider";
import { getWatchStats, getFloatingAds, initializeFloatingAds } from "@/firestore/services/watchEarnService";
import { auth } from "@/firebase/config";
import { useRouter } from "next/navigation";
import { Flame, Coins, Bell } from "lucide-react";
import FloatingAdComponent, { FloatingAd } from "./components/FloatingAd";
import CoinsPopup from "./components/CoinsPopup";
import CommentDrawer from "./components/CommentDrawer";
import Toast from "./components/Toast";
import PromotionBar from "./components/PromotionBar";
import SponsoredCard from "./components/SponsoredCard";

export default function WatchEarnPage() {
  const { config } = useAdminConfig();
  const router = useRouter();
  const { watchEarn } = config;
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [videos, setVideos] = useState<WatchVideo[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [watchProgress, setWatchProgress] = useState<{ [key: string]: number }>({});
  const [earnedCoins, setEarnedCoins] = useState(0);
  const [floatingAds, setFloatingAds] = useState<FloatingAd[]>([]);
  const [rewardedVideos, setRewardedVideos] = useState<string[]>([]);
  const [adPlaying, setAdPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showReward, setShowReward] = useState(false);
  const [rewardCoinsValue, setRewardCoinsValue] = useState(0);
  const [commentOpen, setCommentOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Create an array that includes sponsored cards: every 7 user videos
  const feedItems: Array<{ type: 'video', data: WatchVideo } | { type: 'sponsored', id: string }> = [];
  
  videos.forEach((video, index) => {
      feedItems.push({ type: 'video', data: video });
      // After every 7 videos, add a sponsored card
      if ((index + 1) % 7 === 0) {
          feedItems.push({ type: 'sponsored', id: `promo-${index}` });
      }
  });

  useEffect(() => {
    async function init() {
      try {
        const uid = auth.currentUser?.uid;
        await initializeFloatingAds();
        getFloatingAds((ads) => setFloatingAds(ads));
        
        const videoResult = await fetchWatchVideos();
        
        if (uid) {
          getWatchStats(uid, (stats) => {
            setEarnedCoins(stats.totalCoins || 0);
          });
        }
        
        if (videoResult.success) {
          setVideos(videoResult.videos);
        }
      } catch (error) {
        console.error("Initialization error:", error);
      } finally {
        setLoadingVideos(false);
        setLoadingConfig(false);
      }
    }
    init();
  }, []);

  // Reward Progress Tracking
  useEffect(() => {
    if (videos.length === 0 || adPlaying || !watchEarn) return;
    
    const interval = setInterval(() => {
      const currentVideo = videos[currentIndex];
      if (!currentVideo || rewardedVideos.includes(currentVideo.id)) return;

      setWatchProgress((prev) => {
        const currentProgress = prev[currentVideo.id] || 0;
        
        // Use values from Firestore/Admin Panel
        const duration = watchEarn.videoWatchSeconds || 30;
        const reward = watchEarn.rewardAmount;
        
        const increment = 100 / duration;
        const updated = Math.min(currentProgress + increment, 100);
        
        if (updated >= 100) {
            const isFirstVideo = rewardedVideos.length === 0;

            const processReward = () => {
                setEarnedCoins(p => p + reward);
                setRewardCoinsValue(reward);
                setShowReward(true);
                setRewardedVideos(r => [...r, currentVideo.id]);
                
                setTimeout(() => setShowReward(false), 3000);
            };

            if (isFirstVideo) {
                setAdPlaying(true);
                setTimeout(() => {
                    setAdPlaying(false);
                    processReward();
                }, 3000);
            } else {
                processReward();
            }
        }
        return { ...prev, [currentVideo.id]: updated };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [videos, rewardedVideos, adPlaying, watchEarn, currentIndex]);

  if (loadingVideos || loadingConfig) {
    return (
      <main className="flex h-screen items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-yellow-500 border-t-transparent" />
          <p className="font-bold text-lg animate-pulse">Loading Watch & Earn...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="h-screen w-full bg-black overflow-hidden select-none">
      {floatingAds.map(ad => <FloatingAdComponent key={ad.id} ad={ad} />)}
      {/* Header - Glassmorphism UI */}
      <div className="fixed top-0 z-50 flex w-full items-center justify-between p-4 text-white bg-gradient-to-b from-black/80 to-transparent">
        <div>
          <h1 className="text-xl font-black flex items-center gap-2">
            Watch & Earn <Flame size={20} className="text-orange-500 fill-orange-500" />
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xl px-4 py-1.5 rounded-full border border-white/20 shadow-xl">
            <Coins size={18} className="text-yellow-500" />
            <span className="font-bold text-sm tracking-tighter">{earnedCoins.toLocaleString()}</span>
          </div>
          <button 
            onClick={() => router.push("/mlm/notifications")}
            className="p-2 bg-white/10 backdrop-blur-xl rounded-full border border-white/20"
          >
            <Bell size={20} />
          </button>
        </div>
      </div>
      
      <Swiper 
        direction="vertical" 
        modules={[Mousewheel]} 
        mousewheel={true} 
        className="h-full w-full"
        onSlideChange={(swiper) => setCurrentIndex(swiper.activeIndex)}
      >
        {feedItems.map((item, index) => (
          <SwiperSlide key={item.type === 'video' ? item.data.id : item.id}>
            {item.type === 'video' ? (
                <>
                    
                    <VideoCard
                      video={item.data}
                      isMuted={isMuted}
                      toggleMute={() => setIsMuted(!isMuted)}
                      watchProgress={watchProgress[item.data.id] || 0}
                      active={index === currentIndex}
                      onClaim={() => {}}
                      onComment={() => setCommentOpen(true)}
                      onShare={() => {
                        const shareData = {
                          title: 'Check out this video on JembeeKart',
                          text: item.data.caption,
                          url: window.location.origin + '/mlm/watch-earn?v=' + item.data.id,
                        };
                        
                        const fallbackToClipboard = () => {
                            navigator.clipboard.writeText(shareData.url).then(() => {
                                setToastMessage("Link copied.");
                            });
                        };

                        if (navigator.share) {
                            navigator.share(shareData).catch(err => {
                                if (err.name === 'AbortError') {
                                    return;
                                }
                                fallbackToClipboard();
                            });
                        } else {
                            fallbackToClipboard();
                        }
                      }}
                    />
                </>
            ) : (
                <SponsoredCard />
            )}
          </SwiperSlide>
        ))}
      </Swiper>
      <PromotionBar />
      {/* Reward Popup */}
      <CoinsPopup show={showReward} coins={rewardCoinsValue} />
      
      {/* Comment Drawer */}
      <CommentDrawer
          open={commentOpen}
          onClose={() => setCommentOpen(false)}
          videoId={feedItems[currentIndex].type === 'video' ? feedItems[currentIndex].data.id : ''}
      />
      
      {/* Toast */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />

      {/* Sponsored Ad Overlay - Production Ready */}
      {adPlaying && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 text-white backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-8 flex flex-col items-center"
          >
            <div className="relative mb-6">
                <div className="absolute inset-0 animate-ping rounded-full bg-yellow-500/20" />
                <div className="relative h-24 w-24 rounded-full bg-gradient-to-tr from-yellow-600 to-yellow-400 flex items-center justify-center shadow-[0_0_40px_rgba(234,179,8,0.4)]">
                    <Coins size={48} className="text-white drop-shadow-lg" />
                </div>
            </div>
            <h2 className="text-4xl font-black tracking-tight text-center">Sponsored Ad</h2>
            <p className="mt-4 text-white/60 font-semibold text-lg text-center max-w-[280px]">
                Hang tight! Your reward is being verified...
            </p>
          </motion.div>
        </div>
      )}
    </main>
  );
}
