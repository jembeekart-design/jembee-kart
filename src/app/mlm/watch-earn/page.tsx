"use client";

import Header from "./components/Header";
import ProgressCard from "./components/ProgressCard";
import VideoFeed from "./components/VideoFeed";
import BottomActions from "./components/BottomActions";
import BottomNavigation from "./components/BottomNavigation";
import Footer from "./components/Footer";

export default function WatchEarnPage() {
  return (
    <main className="relative h-screen w-full overflow-hidden bg-black">
      <Header />

      <ProgressCard />

      <VideoFeed />

      <BottomActions />

      <BottomNavigation />

      <Footer />
    </main>
  );
}
