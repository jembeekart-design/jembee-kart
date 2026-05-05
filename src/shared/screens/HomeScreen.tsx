"use client";

export const HomeScreen = () => {
  return (
    <div className="bg-[#020617] text-white min-h-screen w-full overflow-x-hidden">

      {/* 🔥 NAVBAR */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/30 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">

          <h1 className="text-xl font-bold text-purple-400 whitespace-nowrap">
            JembeeKart 🚀
          </h1>

          <input
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Search products..."
          />

          <button className="px-4 py-2 rounded-xl bg-white/10">Login</button>
          <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 shadow-lg">
            Cart
          </button>
        </div>
      </header>

      {/* 🔥 HERO */}
      <section className="max-w-6xl mx-auto px-4 mt-6">
        <div className="rounded-3xl p-6 bg-gradient-to-br from-purple-900/40 to-black border border-white/10 shadow-xl">

          <h2 className="text-3xl font-bold text-purple-400">
            Big Sale Live 🚀
          </h2>

          <p className="text-gray-400 mt-2">
            Up to 70% OFF on all products
          </p>

          <button className="mt-4 px-6 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 shadow-lg">
            Shop Now
          </button>
        </div>
      </section>

      {/* 🔥 CATEGORIES */}
      <section className="max-w-6xl mx-auto px-4 mt-6">
        <h3 className="mb-3 text-gray-300">Categories</h3>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {["Fashion", "Mobiles", "Beauty", "Electronics"].map((cat) => (
            <div
              key={cat}
              className="min-w-[120px] text-center px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
            >
              {cat}
            </div>
          ))}
        </div>
      </section>

      {/* 🔥 DEALS */}
      <section className="max-w-6xl mx-auto px-4 mt-8">
        <h3 className="mb-4 text-lg">🔥 Deals for you</h3>

        <div className="grid grid-cols-2 gap-4">

          {[1,2,3,4].map((item) => (
            <div
              key={item}
              className="rounded-2xl p-3 bg-white/5 border border-white/10 hover:scale-105 transition duration-300"
            >
              <div className="h-28 bg-gradient-to-br from-purple-900/30 to-black rounded-xl mb-3" />

              <p className="font-medium">Product {item}</p>
              <p className="text-gray-400 text-sm">₹999</p>

              <button className="mt-3 w-full py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 shadow-md">
                Buy Now
              </button>
            </div>
          ))}

        </div>
      </section>

      {/* 🔥 TRENDING */}
      <section className="max-w-6xl mx-auto px-4 mt-8 pb-10">
        <h3 className="mb-3 text-gray-300">Trending</h3>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {[1,2,3,4].map((i) => (
            <div
              key={i}
              className="min-w-[140px] text-center px-4 py-3 rounded-xl bg-white/5 border border-white/10"
            >
              Product {i}
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
