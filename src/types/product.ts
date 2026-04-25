// src/types/product.ts

import { Timestamp } from "firebase/firestore";

export type Product = {
  id?: string;

  // 📦 Basic Info
  name: string;
  description?: string;
  category?: string;

  // 💰 Pricing
  price: number;        // Qikink base price
  margin: number;       // your profit
  finalPrice: number;   // price + margin

  // 🖼 Media
  image: string;
  gallery?: string[];

  // 📊 Status
  visible: boolean;
  stock?: number;

  // 🔗 Qikink Integration
  qikinkId: string;     // 🔥 required (important for sync)

  // ⭐ Extra Features
  tags?: string[];
  featured?: boolean;

  // 📈 Analytics (future ready)
  views?: number;
  sales?: number;

  // ⏱ Dates (Firestore safe)
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};
