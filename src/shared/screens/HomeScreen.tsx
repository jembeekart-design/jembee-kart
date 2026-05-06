"use client";

import { useState } from "react";

const categories = ["Fashion", "Mobiles", "Beauty", "Electronics", "Home"];

const products = [
  { id: 1, name: "Running Shoes", price: 999 },
  { id: 2, name: "Earbuds", price: 799 },
  { id: 3, name: "Smart Watch", price: 1499 },
  { id: 4, name: "T-Shirt", price: 499 },
  { id: 5, name: "Headphones", price: 1199 },
  { id: 6, name: "Laptop Bag", price: 699 },
];

export const HomeScreen = () => {
  const [query, setQuery] = useState("");

  return (
    <div className="min-h-screen bg-bg text-text">

      {/* 🔥 NAVBAR */}
      <header className="navbar">
        <div className="container-custom flex items-center gap-3 py-3">

          <h1 className="text-xl font-bold text-gradient whitespace-nowrap">
            JembeeKart 🚀
          </h1>

          {/* SEARCH */}
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for products..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-purple-500"
          />

          <button className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition">
            Login
          </button>

          <button className="btn-primary">
            Cart
          </button>
        </div>
      </header>

      <main className="container-custom py-6 space-y-10">

        {/* 🔥 HERO */}
        <section>
          <div className="glass p-6 md:p-10 relative overflow-hidden">

            <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/20 blur-3xl rounded-full"></div>

            <h1 className="heading text-gradient">
              India’s Fastest Shopping 🚀
            </h1>

            <p className="opacity-70 mt-2">
              Best deals • Fast delivery • Trusted quality
            </p>

            <div className="flex gap-3 mt-4">
              <button className="btn-primary">
                Explore Products
              </button>
              <button className="px-4 py-2 rounded-xl bg-white/10">
                View Offers
              </button>
            </div>

          </div>
        </section>

        {/* 🔥 TRUST */}
        <section>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              "🚚 Fast Delivery",
              "💰 Best Prices",
              "🔒 Secure Payment",
              "⭐ Top Quality",
            ].map((item) => (
              <div key={item} className="glass p-4">
                {item}
              </div>
            ))}
          </div>
        </section>

        {/* 🔥 CATEGORIES */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Categories</h2>

          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
            {categories.map((cat) => (
              <div
                key={cat}
                className="glass min-w-[130px] text-center py-3 cursor-pointer hover:bg-white/10 transition"
              >
                {cat}
              </div>
            ))}
          </div>
        </section>

        {/* 🔥 DEALS */}
        <section>
          <h2 className="text-xl font-semibold mb-4">
            🔥 Trending Deals
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {products.slice(0, 4).map((item) => (
              <div key={item.id} className="glass p-3 group">

                <div className="h-32 rounded-xl bg-gradient-to-br from-purple-900/30 to-black mb-3"></div>

                <p className="font-medium">{item.name}</p>
                <p className="text-gray-400 text-sm">₹{item.price}</p>

                <button className="btn-primary w-full mt-3 group-hover:scale-105 transition">
                  Buy Now
                </button>

              </div>
            ))}
          </div>
        </section>

        {/* 🔥 OFFER BANNER */}
        <section>
          <div className="glass p-6 text-center">

            <h2 className="text-2xl font-bold text-gradient">
              Mega Sale 🎉
            </h2>

            <p className="opacity-70 mt-2">
              Up to 70% OFF — Limited Time
            </p>

          </div>
        </section>

        {/* 🔥 RECOMMENDED */}
        <section>
          <h2 className="text-xl font-semibold mb-4">
            🛍️ Recommended For You
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {products.slice(2).map((item) => (
              <div key={item.id} className="glass p-3">

                <div className="h-32 rounded-xl bg-gradient-to-br from-indigo-900/30 to-black mb-3"></div>

                <p className="font-medium">{item.name}</p>
                <p className="text-gray-400 text-sm">₹{item.price}</p>

                <button className="btn-primary w-full mt-3">
                  Buy Now
                </button>

              </div>
            ))}
          </div>
        </section>

        {/* 🔥 FOOTER */}
        <footer className="text-center text-gray-500 text-sm pt-6">
          © 2026 JembeeKart — Premium Experience
        </footer>

      </main>
    </div>
  );
};
