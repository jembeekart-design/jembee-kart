"use client";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full overflow-hidden border-b border-gray-200 bg-white/90 backdrop-blur-xl">

      <div className="flex w-full items-center justify-between gap-2 px-3 py-3 md:px-6">

        {/* LOGO */}

        <div className="min-w-0 flex-1">

          <h1 className="truncate text-2xl font-black text-blue-600 sm:text-3xl md:text-4xl">
            JembeeKart
          </h1>

          <p className="truncate text-[10px] text-gray-500 sm:text-xs md:text-sm">
            AI Ecommerce Ecosystem
          </p>

        </div>

        {/* SEARCH */}

        <div className="mx-3 hidden flex-1 md:flex">

          <input
            type="text"
            placeholder="Search products..."
            className="w-full min-w-0 rounded-2xl border border-gray-200 bg-gray-100 px-5 py-3 outline-none transition-all duration-300 focus:border-blue-500 focus:bg-white"
          />

        </div>

        {/* ACTIONS */}

        <div className="flex shrink-0 items-center gap-2">

          <button className="whitespace-nowrap rounded-xl bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-700 transition-all duration-300 hover:bg-gray-200 sm:text-sm md:px-5 md:py-3 md:text-base">
            Login
          </button>

          <button className="whitespace-nowrap rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition-all duration-300 hover:bg-blue-700 sm:text-sm md:px-5 md:py-3 md:text-base">
            Seller
          </button>

        </div>

      </div>

    </header>
  );
}
