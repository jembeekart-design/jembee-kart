"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const ProductionHeader = dynamic(() => import("./components/ProductionHeader"), { ssr: false });
const FullscreenVideoFeed = dynamic(() => import("./components/FullscreenVideoFeed"), { ssr: false });

export default function WatchEarnPage() {
  const [activeTab, setActiveTab] = useState<'foryou' | 'following'>('foryou');

  return (
    <main className="relative h-screen w-full overflow-hidden bg-black text-white">
      <ProductionHeader activeTab={activeTab} setActiveTab={setActiveTab} />
      <FullscreenVideoFeed activeTab={activeTab} />
    </main>
  );
}
