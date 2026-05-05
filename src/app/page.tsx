"use client";

import React from "react";

const categories = [
  { name: "Fashion", icon: "👕" },
  { name: "Mobiles", icon: "📱" },
  { name: "Beauty", icon: "💄" },
  { name: "Electronics", icon: "💻" },
  { name: "Home", icon: "🏠" },
];

const products = [
  { id: 1, name: "Running Shoes", price: 999 },
  { id: 2, name: "Earbuds", price: 799 },
  { id: 3, name: "Smart Watch", price: 1499 },
  { id: 4, name: "T-Shirt", price: 499 },
];

export const HomeScreen = () => {
  return (
    <div className="bg-bg text-text min-h-screen">

      {/* 🔥 HEADER */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-surface/60 border-b border-white/10">
        <div className="flex items-center justify-between px-4 py-3">

          <h1 className="text-xl font-bold text-gradient">
            JembeeKart 🚀
          </h1>

          <input
            placeholder="Search products..."
            className="px-3 py-2 rounded-lg bg-bg border border-white/10 w-[45%] text-sm outline-none"
          />

          <button className="btn-primary px-4 py-2">
            Cart
          </button>
        </div>
      </header>

      {/* 🔥 HERO BANNER */}
      <section className="px-4 py-6">
        <div className="glass p-6 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-gradient">
            Big Sale Live 🔥
          </h2>
          <p className="text-gray-400 mt-2">
            Up to 70% OFF on trending items
          </p>

          <button className="btn-primary mt-4 px-6 py-2">
            Shop Now
          </button>
        </div>
      </section>

      {/* 🔥 CATEGORY ROW (Flipkart style) */}
      <section className="px-4 py-4">
        <div className="flex overflow-x-auto gap-4 no-scrollbar">
          {categories.map((cat) => (
            <div
              key={cat.name}
              className="flex flex-col items-center min-w-[70px] glass p-3 cursor-pointer"
            >
              <span className="text-xl">{cat.icon}</span>
              <p className="text-xs mt-1">{cat.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 🔥 DEALS GRID */}
      <section className="px-4 py-6">
        <h3 className="text-lg font-semibold mb-4">
          🔥 Deals for you
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((p) => (
            <div
              key={p.id}
              className="glass p-4 hover:scale-[1.02] transition-all"
            >
              <div className="h-32 bg-surface rounded-lg mb-3"></div>

              <p className="font-medium text-sm">{p.name}</p>
              <p className="text-xs text-gray-400">₹{p.price}</p>

              <button className="btn-primary mt-2 w-full text-sm py-1">
                Buy Now
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 🔥 TRENDING */}
      <section className="px-4 py-6">
        <h3 className="text-lg font-semibold mb-4">Trending</h3>

        <div className="grid grid-cols-2 gap-4">
          {products.map((p) => (
            <div key={p.id} className="glass p-4">
              <div className="h-24 bg-surface rounded-lg mb-2"></div>
              <p className="text-sm">{p.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 🔥 FOOTER */}
      <footer className="text-center text-xs text-gray-500 py-6">
        © 2026 JembeeKart — Premium eCommerce Platform
      </footer>
    </div>
  );
};
