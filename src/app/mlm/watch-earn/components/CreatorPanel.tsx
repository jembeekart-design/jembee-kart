"use client";

import React from "react";
import VideoInfo from "./VideoInfo";

export default function CreatorPanel() {
  // VideoInfo is already used per-video; this component provides a persistent bottom-left panel
  return (
    <div className="pointer-events-auto fixed left-4 bottom-24 z-40 max-w-[65%]">
      <div className="space-y-2">
        {/* Render an instance of VideoInfo which will display current video's creator info when present */}
        <VideoInfo username={""} caption={""} hashtags={[]} music={""} verified={false} />
      </div>
    </div>
  );
}
