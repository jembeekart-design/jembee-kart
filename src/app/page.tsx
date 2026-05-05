import React from "react";

export default function Home() {
  return (
    <div className="bg-bg text-text min-h-screen">

      {/* 🔥 NAVBAR */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-white/10 backdrop-blur-md">
        <h1 className="text-xl font-bold text-gradient">JembeeKart 🚀</h1>

        <div className="flex gap-3">
          <button className="px-3 py-1 rounded-lg bg-surface/50 backdrop-blur-md">
            Login
          </button>
          <button className="px-3 py-1 rounded-lg bg-gradient-primary text-white shadow-glow">
            Cart
          </button>
        </div>
      </header>

      {/* 🔥 HERO SECTION */}
      <section className="px-4 py-10 text-center space-y-6">
        <h2 className="text-4xl md:text-6xl font-bold text-gradient">
          Premium Shopping Experience
        </h2>

        <p className="text-gray-400 max-w-md mx-auto">
          Discover trending products with modern UI, fast delivery & smart pricing engine.
        </p>

        <button className="bg-gradient-primary px-8 py-3 rounded-2xl text-white shadow-glow text-lg">
          Shop Now
        </button>
      </section>

      {/* 🔥 CATEGORY GRID */}
      <section className="px-4 py-6">
        <h3 className="text-xl font-semibold mb-4">Categories</h3>

        <div className="grid grid-cols-2 gap-4">
          {["Fashion", "Mobiles", "Beauty", "Electronics"].map((cat) => (
            <div
              key={cat}
              className="glass p-4 text-center cursor-pointer hover:scale-105 transition"
            >
              <p className="font-medium">{cat}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 🔥 DEALS SECTION */}
      <section className="px-4 py-6">
        <h3 className="text-xl font-semibold mb-4">🔥 Deals for you</h3>

        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="glass p-4 space-y-2">
              <div className="h-32 bg-surface rounded-lg"></div>

              <p className="font-medium">Product {item}</p>
              <p className="text-sm text-gray-400">₹999</p>

              <button className="btn-primary w-full">Buy Now</button>
            </div>
          ))}
        </div>
      </section>

      {/* 🔥 BANNER */}
      <section className="px-4 py-6">
        <div className="glass p-6 text-center">
          <h3 className="text-2xl font-bold text-gradient">
            Mega Sale Coming 🚀
          </h3>
          <p className="text-gray-400 mt-2">
            Up to 70% OFF on all products
          </p>
        </div>
      </section>

      {/* 🔥 FOOTER */}
      <footer className="text-center py-6 text-sm text-gray-500">
        © 2026 JembeeKart. All rights reserved.
      </footer>

    </div>
  );
}
