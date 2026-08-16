"use client";

import React from "react";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

export default function GlassCard({ children, className = "" }: GlassCardProps) {
  return (
    <div className={`rounded-2xl bg-white/6 backdrop-blur-md border border-white/10 shadow-lg ${className}`}>
      {children}
    </div>
  );
}
