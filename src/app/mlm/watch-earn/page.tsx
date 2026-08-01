"use client";

import dynamic from "next/dynamic";

const ProductionHeader = dynamic(() => import("./components/ProductionHeader"), { ssr: false });
const FullscreenVideoFeed = dynamic(() => import("./components/FullscreenVideoFeed"), { ssr: false });
const RightActions = dynamic(() => import("./components/RightActions"), { ssr: false });
const CreatorPanel = dynamic(() => import("./components/CreatorPanel"), { ssr: false });
const ProgressBars = dynamic(() => import("./components/ProgressBars"), { ssr: false });
const BottomQuickActions = dynamic(() => import("./components/BottomQuickActions"), { ssr: false });

export default function WatchEarnPage() {
  return (
    <main className="relative h-screen w-full overflow-hidden bg-black text-white">
      <ProductionHeader />
      <FullscreenVideoFeed />
      <RightActions />
      <CreatorPanel />
      <ProgressBars />
      <BottomQuickActions />
    </main>
  );
}
