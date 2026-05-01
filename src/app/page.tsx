"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// ================= TYPES =================
type Category = {
  name: string;
  icon: string;
};

type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
};

// ================= DEMO DATA =================
// 🔥 Admin से replace होगा later
const categories: Category[] = [
  { name: "Fashion", icon: "👕" },
  { name: "Mobiles", icon: "📱" },
  { name: "Beauty", icon: "💄" },
  { name: "Electronics", icon: "💻" },
  { name: "Home", icon: "🏠" },
];

const banners = [
  "https://via.placeholder.com/1200x300?text=Big+Sale",
  "https://via.placeholder.com/1200x300?text=Festival+Offer",
];

const products: Product[] = [
  {
    id: "1",
    name: "Running Shoes",
    price: 999,
    image: "https://via.placeholder.com/300",
  },
  {
    id: "2",
    name: "Earbuds",
    price: 799,
    image: "https://via.placeholder.com/300",
  },
  {
    id: "3",
    name: "Watch",
    price: 1499,
    image: "https://via.placeholder.com/300",
  },
];

// ================= COMPONENT =================
export default function HomePage() {
  const router = useRouter();
  const [bannerIndex, setBannerIndex] = useState(0);

  // 🔁 Auto Banner
  useEffect(() => {
    const i = setInterval(() => {
      setBannerIndex((p) => (p + 1) % banners.length);
    }, 3000);
    return () => clearInterval(i);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">

      {/* 🔷 HEADER */}
      <div className="bg-blue-500 p-3 text-white sticky top-0 z-50">

        <div className="flex items-center gap-2">
          <h1 className="font-bold text-lg">JembeeKart</h1>
        </div>

        {/* 🔍 SEARCH */}
        <input
          placeholder="Search for Products"
          className="w-full mt-2 px-3 py-2 rounded text-black"
        />
      </div>

      {/* 📦 CATEGORIES */}
      <div className="flex gap-4 overflow-x-auto p-3 bg-white">
        {categories.map((c) => (
          <div
            key={c.name}
            className="flex flex-col items-center min-w-[60px]"
          >
            <div className="text-2xl">{c.icon}</div>
            <span className="text-xs">{c.name}</span>
          </div>
        ))}
      </div>

      {/* 🎯 BANNER */}
      <div className="p-3">
        <img
          src={banners[bannerIndex]}
          className="rounded-xl w-full"
        />
      </div>

      {/* 🔥 DEAL SECTION */}
      <div className="bg-white m-3 p-3 rounded-xl">
        <h2 className="font-semibold mb-2">🔥 Deals for you</h2>

        <div className="flex gap-3 overflow-x-auto">
          {products.map((p) => (
            <div
              key={p.id}
              className="min-w-[140px]"
              onClick={() => router.push(`/product/${p.id}`)}
            >
              <img src={p.image} className="rounded-lg" />
              <p className="text-sm mt-1">{p.name}</p>
              <p className="text-xs text-green-600">₹{p.price}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 🛍 PRODUCT GRID */}
      <div className="p-3">
        <h2 className="font-semibold mb-2">Trending</h2>

        <div className="grid grid-cols-2 gap-3">
          {products.map((p) => (
            <div
              key={p.id}
              className="bg-white p-2 rounded-lg"
              onClick={() => router.push(`/product/${p.id}`)}
            >
              <img src={p.image} className="rounded-md" />
              <p className="text-sm mt-1">{p.name}</p>
              <p className="text-green-600 text-sm">₹{p.price}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 🔻 BOTTOM NAV */}
      <div className="fixed bottom-0 w-full bg-white border-t flex justify-around p-2 text-sm">
        <button>🏠 Home</button>
        <button>📦 Categories</button>
        <button>👤 Account</button>
        <button>🛒 Cart</button>
      </div>

    </div>
  );
}
