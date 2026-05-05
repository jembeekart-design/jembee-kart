"use client";

export const HomeScreen = () => {
  return (
    <div className="min-h-screen bg-bg text-text">

      {/* 🔥 NAVBAR */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-surface/60 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">

          <h1 className="text-xl font-bold text-gradient">
            JembeeKart 🚀
          </h1>

          <div className="flex gap-3 items-center">
            <input
              placeholder="Search products..."
              className="px-3 py-1 rounded-lg bg-surface border border-white/10 outline-none"
            />

            <button className="px-3 py-1 rounded-lg bg-surface/50">
              Login
            </button>

            <button className="px-3 py-1 rounded-lg bg-gradient-primary text-white">
              Cart
            </button>
          </div>
        </div>
      </header>

      {/* 🔥 HERO */}
      <section className="max-w-7xl mx-auto px-4 py-10 text-center">
        <h2 className="text-4xl md:text-6xl font-bold text-gradient">
          Premium Shopping Experience
        </h2>

        <p className="text-gray-400 mt-3">
          Fast delivery • Smart pricing • Best deals
        </p>

        <button className="mt-6 btn-primary text-lg px-8 py-3">
          Shop Now
        </button>
      </section>

      {/* 🔥 CATEGORY GRID */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <h3 className="text-xl font-semibold mb-4">Categories</h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {["Fashion", "Mobiles", "Beauty", "Electronics"].map((cat) => (
            <div
              key={cat}
              className="glass p-6 text-center cursor-pointer hover:scale-105 transition"
            >
              {cat}
            </div>
          ))}
        </div>
      </section>

      {/* 🔥 PRODUCTS GRID */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <h3 className="text-xl font-semibold mb-4">🔥 Deals for you</h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass p-4 space-y-3">
              <div className="h-40 bg-surface rounded-lg"></div>

              <p className="font-medium">Product {i}</p>
              <p className="text-sm text-gray-400">₹999</p>

              <button className="btn-primary w-full">
                Buy Now
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 🔥 TRENDING */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <h3 className="text-xl font-semibold mb-4">Trending</h3>

        <div className="flex gap-4 overflow-x-auto">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="min-w-[160px] glass p-4"
            >
              Product {i}
            </div>
          ))}
        </div>
      </section>

      {/* 🔥 FOOTER */}
      <footer className="text-center py-6 text-sm text-gray-500">
        © 2026 JembeeKart — Premium UI System
      </footer>

    </div>
  );
};
