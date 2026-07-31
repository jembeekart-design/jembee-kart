"use client";

import WatchEarnHeader from "./components/WatchEarnHeader";
import VideoFeed from "./components/VideoFeed";
import SponsoredOverlay from "./components/SponsoredOverlay";
import CoinsPopup from "./components/CoinsPopup";
import CommentDrawer from "./components/CommentDrawer";
import Toast from "./components/Toast";
import { useWatchEarn } from "./hooks/useWatchEarn";

export default function WatchEarnPage() {
  const vm = useWatchEarn();

  if (vm.loading) return vm.loadingScreen;

  return (
    <main className="h-screen bg-black overflow-hidden">
      <WatchEarnHeader
        coins={vm.earnedCoins}
      />

      <VideoFeed
        feedItems={vm.feedItems}
        currentIndex={vm.currentIndex}
        setCurrentIndex={vm.setCurrentIndex}
        isMuted={vm.isMuted}
        toggleMute={vm.toggleMute}
        watchProgress={vm.watchProgress}
        onComment={vm.openComments}
        onShare={vm.shareVideo}
      />

      <CoinsPopup
        show={vm.showReward}
        coins={vm.rewardCoins}
      />

      <CommentDrawer
        open={vm.commentOpen}
        onClose={vm.closeComments}
        onCommentAdded={vm.commentAdded}
      />

      <Toast
        message={vm.toast}
        onClose={vm.closeToast}
      />

      <SponsoredOverlay
        open={vm.adPlaying}
      />
    </main>
  );
}
