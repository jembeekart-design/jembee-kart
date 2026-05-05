"use client";

export const HomeScreen = () => {
  return (
    <div className="min-h-screen bg-bg text-text">

      {/* 🔥 NAVBAR */}
      <div className="w-full bg-surface/70 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">

          <h1 className="text-xl font-bold text-gradient">
            JembeeKart 🚀
          </h1>

          <div className="flex gap-2 items-center">
            <input
              placeholder="Search products..."
              className="px-3 py-1 rounded-lg bg-bg border border-white/10 outline-none"
            />

            <button className="px-3 py-1 rounded bg-surface">
              Login
            </button>

            <button className="px-3 py-1 rounded bg-gradient-primary text-white">
              Cart
            </button>
          </div>
        </div>
      </div>

      {/* 🔥 HERO */}
      <section className="max-w-7xl mx-auto px-4 py-10 text-center">
        <h2 className="text-4xl md:text-6xl font-bold text-gradient">
          Premium Shopping Experience
        </h2>

        <p className="text-gray-400 mt-3">
          Fast delivery • Smart pricing • Best deals
        </p>

        <button className="mt-6 btn-primary px-8 py-3 text-lg">
          Shop Now
        </button>
      </section>

      {/* 🔥 CATEGORY */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <h3 className="text-xl font-semibold mb-4">Categories</h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {["Fashion", "Mobiles", "Beauty", "Electronics"].map((c) => (
            <div
              key={c}
              className="glass p-5 text-center hover:scale-105 transition"
            >
              {c}
            </div>
          ))}
        </div>
      </section>

      {/* 🔥 PRODUCTS */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <h3 className="text-xl font-semibold mb-4">🔥 Deals for you</h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
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

        <div className="flex gap-4 overflow-x-auto pb-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="min-w-[180px] glass p-4">
              Product {i}
            </div>
          ))}
        </div>
      </section>

      {/* 🔥 FOOTER */}
      <footer className="text-center py-6 text-gray-500 text-sm">
        © 2026 JembeeKart — Premium UI
      </footer>

    </div>
  );
};
