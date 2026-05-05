"use client";

export const HomeScreen = () => {
  return (
    <div className="bg-bg text-text min-h-screen">

      {/* 🔥 STICKY NAVBAR */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/40 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          
          <h1 className="text-xl font-bold text-gradient whitespace-nowrap">
            JembeeKart 🚀
          </h1>

          {/* SEARCH */}
          <input
            className="flex-1 max-w-md bg-surface/50 border border-white/10 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-primary"
            placeholder="Search products..."
          />

          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-lg bg-surface/50 hover:bg-surface transition">
              Login
            </button>
            <button className="px-4 py-2 rounded-lg bg-gradient-primary text-white shadow-glow">
              Cart
            </button>
          </div>
        </div>
      </header>

      {/* 🔥 HERO BANNER (Flipkart style) */}
      <section className="max-w-7xl mx-auto px-4 mt-6">
        <div className="glass p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div>
            <h2 className="text-3xl md:text-5xl font-bold text-gradient">
              Big Sale Live 🚀
            </h2>
            <p className="text-gray-400 mt-2">
              Up to 70% OFF on all products
            </p>

            <button className="mt-4 bg-gradient-primary px-6 py-2 rounded-xl text-white shadow-glow">
              Shop Now
            </button>
          </div>

          <div className="w-40 h-40 bg-surface rounded-xl"></div>
        </div>
      </section>

      {/* 🔥 CATEGORY STRIP (horizontal scroll) */}
      <section className="max-w-7xl mx-auto px-4 mt-6">
        <h3 className="text-lg font-semibold mb-3">Categories</h3>

        <div className="flex gap-4 overflow-x-auto no-scrollbar">
          {["Fashion", "Mobiles", "Beauty", "Electronics", "Home", "Toys"].map(
            (cat) => (
              <div
                key={cat}
                className="min-w-[120px] glass text-center p-4 rounded-xl cursor-pointer hover:scale-105 transition"
              >
                {cat}
              </div>
            )
          )}
        </div>
      </section>

      {/* 🔥 DEALS GRID */}
      <section className="max-w-7xl mx-auto px-4 mt-8">
        <h3 className="text-lg font-semibold mb-4">🔥 Deals for you</h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="glass p-4 rounded-2xl hover:scale-105 transition"
            >
              <div className="h-40 bg-surface rounded-xl mb-3"></div>

              <p className="font-medium">Product {item}</p>
              <p className="text-sm text-gray-400">₹999</p>

              <button className="btn-primary w-full mt-3">
                Buy Now
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 🔥 TRENDING STRIP */}
      <section className="max-w-7xl mx-auto px-4 mt-8">
        <h3 className="text-lg font-semibold mb-3">Trending</h3>

        <div className="flex gap-3 overflow-x-auto">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="min-w-[150px] glass p-3 text-center rounded-xl"
            >
              Product {i}
            </div>
          ))}
        </div>
      </section>

      {/* 🔥 FOOTER */}
      <footer className="text-center text-sm text-gray-500 py-10">
        © 2026 JembeeKart — Premium UI System
      </footer>
    </div>
  );
};
