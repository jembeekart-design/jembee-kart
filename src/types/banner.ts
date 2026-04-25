// src/types/banner.ts

import { Timestamp } from "firebase/firestore";

export type Banner = {
  id?: string;

  // 🎯 Content
  title: string;
  subtitle?: string;
  image: string;          // main banner image
  link?: string;          // redirect URL (product / category)

  // 🎨 UI Control (theme ready)
  bgColor?: string;       // optional custom background
  textColor?: string;

  // 📊 Display Control
  active: boolean;
  priority: number;       // higher = show first

  // ⏰ Schedule
  startDate?: Timestamp;
  endDate?: Timestamp;

  // 📍 Placement
  position?: "homepage" | "category" | "offer";

  // ⭐ Extra
  tags?: string[];
  featured?: boolean;

  // 📈 Analytics (future ready)
  clicks?: number;
  impressions?: number;

  // ⏱ Dates
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};
