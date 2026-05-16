"use client";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/90 backdrop-blur-xl">

      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">

        {/* LOGO */}

        <div>

          <h1 className="text-3xl font-black text-blue-600 md:text-4xl">
            JembeeKart
          </h1>

          <p className="text-xs text-gray-500 md:text-sm">
            AI Ecommerce Ecosystem
          </p>

        </div>

        {/* SEARCH */}

        <div className="mx-4 hidden flex-1 md:flex">

          <input
            type="text"
            placeholder="Search products..."
            className="w-full rounded-2xl border border-gray-200 bg-gray-100 px-5 py-3 outline-none transition-all duration-300 focus:border-blue-500 focus:bg-white"
          />

        </div>

        {/* ACTIONS */}

        <div className="flex items-center gap-3 md:gap-4">

          <button className="rounded-2xl bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 transition-all duration-300 hover:bg-gray-200 md:px-5 md:py-3 md:text-base">
            Login
          </button>

          <button className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-blue-700 md:px-5 md:py-3 md:text-base">
            Seller
          </button>

        </div>

      </div>

    </header>
  );
}
