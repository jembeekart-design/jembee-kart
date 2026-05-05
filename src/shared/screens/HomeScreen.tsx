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
      <header className="sticky top-0 z-50 bg-surface/60 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center justify-between px-4 py-3 gap-2">

          <h1 className="text-lg font-bold text-gradient whitespace-nowrap">
            JembeeKart 🚀
          </h1>

          <input
            placeholder="Search products..."
            className="flex-1 px-3 py-2 rounded-lg bg-bg border border-white/10 text-sm outline-none"
          />

          <button className="btn-primary px-4 py-2 text-sm">
            Cart
          </button>
        </div>
      </header>

      {/* 🔥 HERO */}
      <section className="px-4 py-6">
        <div className="glass p-6 text-center space-y-3">
          <h2 className="text-2xl md:text-4xl font-bold text-gradient">
            Premium Shopping Experience
          </h2>

          <p className="text-gray-400 text-sm">
            Fast delivery • Smart pricing • Best deals
          </p>

          <button className="btn-primary px-6 py-2">
            Shop Now
          </button>
        </div>
      </section>

      {/* 🔥 CATEGORY SCROLL */}
      <section className="px-4 py-4">
        <div className="flex gap-4 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <div
              key={cat.name}
              className="glass p-3 flex flex-col items-center min-w-[80px] cursor-pointer hover:scale-105 transition"
            >
              <span className="text-xl">{cat.icon}</span>
              <p className="text-xs mt-1">{cat.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 🔥 DEALS */}
      <section className="px-4 py-6">
        <h3 className="text-lg font-semibold mb-4">🔥 Deals for you</h3>

        <div className="grid grid-cols-2 gap-4">
          {products.map((p) => (
            <div key={p.id} className="glass p-4 space-y-2">

              <div className="h-28 bg-surface rounded-lg"></div>

              <p className="text-sm font-medium">{p.name}</p>
              <p className="text-xs text-gray-400">₹{p.price}</p>

              <button className="btn-primary w-full text-sm py-1">
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
              <div className="h-20 bg-surface rounded-lg mb-2"></div>
              <p className="text-sm">{p.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 🔥 FOOTER */}
      <footer className="text-center text-xs text-gray-500 py-6">
        © 2026 JembeeKart — Premium UI System
      </footer>
    </div>
  );
};
