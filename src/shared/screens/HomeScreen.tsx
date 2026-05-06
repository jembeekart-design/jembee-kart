"use client";

import Image from "next/image";

const categories = [
  { name: "Fashion", icon: "👕" },
  { name: "Mobiles", icon: "📱" },
  { name: "Beauty", icon: "💄" },
  { name: "Electronics", icon: "💻" },
  { name: "Home", icon: "🏠" },
];

const products = [
  {
    title: "Running Shoes",
    price: "₹999",
    img: "https://rukminim2.flixcart.com/image/312/312/xif0q/shoe/...",
  },
  {
    title: "Earbuds",
    price: "₹799",
    img: "https://rukminim2.flixcart.com/image/312/312/xif0q/headphone/...",
  },
  {
    title: "Watch",
    price: "₹1499",
    img: "https://rukminim2.flixcart.com/image/312/312/xif0q/watch/...",
  },
];

export default function HomeScreen() {
  return (
    <div className="min-h-screen bg-bg text-text pb-20">
      
      {/* 🔍 HEADER */}
      <div className="sticky top-0 z-50 bg-bg p-4">
        <h1 className="text-2xl font-bold mb-3">JembeeKart</h1>

        <div className="glass flex items-center px-4 py-3 rounded-xl">
          <span className="mr-2 text-xl">🔍</span>
          <input
            placeholder="Search for products"
            className="bg-transparent outline-none w-full"
          />
        </div>
      </div>

      {/* 📂 CATEGORY */}
      <div className="flex gap-3 px-4 overflow-x-auto py-2">
        {categories.map((cat) => (
          <div
            key={cat.name}
            className="glass px-4 py-2 rounded-xl flex flex-col items-center min-w-[70px]"
          >
            <span>{cat.icon}</span>
            <span className="text-xs">{cat.name}</span>
          </div>
        ))}
      </div>

      {/* 🔥 HERO CARD */}
      <div className="p-4">
        <div className="rounded-3xl bg-gradient-to-r from-indigo-500 to-blue-500 p-4 text-white">
          <h2 className="text-lg font-semibold mb-3">
            🔥 Deals for you
          </h2>

          <div className="grid grid-cols-2 gap-3">
            {products.map((p, i) => (
              <div
                key={i}
                className="bg-white text-black rounded-2xl p-2"
              >
                <div className="h-32 bg-gray-100 rounded-xl mb-2"></div>
                <p className="text-sm">{p.title}</p>
                <p className="font-bold">{p.price}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 🏷 BRANDS */}
      <div className="px-4">
        <h2 className="text-lg font-bold mb-3">
          Brands in Spotlight
        </h2>

        <div className="flex gap-3 overflow-x-auto">
          {["boAt", "Noise", "Mivi"].map((b) => (
            <div
              key={b}
              className="glass px-6 py-4 rounded-xl"
            >
              {b}
            </div>
          ))}
        </div>
      </div>

      {/* 🧭 BOTTOM NAV */}
      <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-white/10 flex justify-around py-2">
        {["Home", "Categories", "Account", "Cart"].map((item) => (
          <div key={item} className="text-xs text-center">
            <div>🏠</div>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
