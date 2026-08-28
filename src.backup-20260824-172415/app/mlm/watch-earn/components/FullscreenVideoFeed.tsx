"use client";

import React from "react";
import VerticalVideoFeed from "./VerticalVideoFeed";

export default function FullscreenVideoFeed({ activeTab }: { activeTab: 'foryou' | 'following' }) {
  return (
    <section className="absolute inset-0 h-full w-full bg-black">
      <div className="h-full w-full">
        <VerticalVideoFeed activeTab={activeTab} />
      </div>
    </section>
  );
}
