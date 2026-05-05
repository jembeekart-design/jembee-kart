"use client";

export const HomeScreen = () => {
  return (
    <div className="min-h-screen bg-bg text-text">

      {/* 🔥 NAVBAR */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-white/10 backdrop-blur-md">
        <h1 className="text-xl font-bold text-gradient">
          JembeeKart 🚀
        </h1>

        <div className="flex gap-3">
          <button className="px-3 py-1 rounded-lg bg-surface/50">
            Login
          </button>
          <button className="px-3 py-1 rounded-lg bg-gradient-primary text-white">
            Cart
          </button>
        </div>
      </header>

      {/* 🔥 HERO */}
      <section className="px-4 py-10 text-center space-y-6">
        <h2 className="text-4xl font-bold text-gradient">
          Premium Shopping Experience
        </h2>

        <button className="btn-primary">
          Shop Now
        </button>
      </section>

      {/* 🔥 PRODUCTS */}
      <section className="px-4 grid grid-cols-2 gap-4">
        {[1,2,3,4].map((i) => (
          <div key={i} className="glass p-4">
            <div className="h-24 bg-surface rounded"></div>
            <p className="mt-2">Product {i}</p>
            <p className="text-sm text-gray-400">₹999</p>
          </div>
        ))}
      </section>

    </div>
  );
};
