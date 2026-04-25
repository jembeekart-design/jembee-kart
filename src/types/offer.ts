// src/types/offer.ts

import { Timestamp } from "firebase/firestore";

export type Offer = {
  id?: string;

  // 🎟 Basic Info
  title: string;
  description?: string;
  code: string;              // coupon code (e.g. SAVE50)

  // 💰 Discount
  type: "percentage" | "flat";
  value: number;             // 20% or ₹100

  // 🧾 Conditions
  minOrderValue?: number;    // minimum cart value
  maxDiscount?: number;      // cap for percentage

  // 📊 Usage
  usageLimit?: number;       // total usage limit
  usedCount?: number;        // used count

  // 📍 Scope
  applicableOn?: "all" | "products" | "categories";
  productIds?: string[];
  categoryIds?: string[];

  // 📊 Status
  active: boolean;

  // ⏰ Schedule
  startDate?: Timestamp;
  endDate?: Timestamp;

  // 🎨 UI / Theme Support
  bannerColor?: string;      // optional custom color
  highlight?: boolean;       // featured offer

  // 📈 Analytics
  conversions?: number;

  // ⏱ Dates
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};
