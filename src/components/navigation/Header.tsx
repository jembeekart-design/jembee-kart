"use client";

import { Mic } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full overflow-hidden border-b border-gray-200 bg-white/95 backdrop-blur-xl">

      <div className="flex w-full items-center gap-2 px-2 py-2 md:px-6">

        {/* LOGO */}

        <div className="min-w-0">

          <h1 className="truncate text-2xl font-black leading-none text-blue-600 sm:text-3xl md:text-4xl">
            JembeeKart
          </h1>

          <p className="truncate text-[10px] leading-none text-gray-500 sm:text-xs md:text-sm">
            AI Ecommerce Ecosystem
          </p>

        </div>

        {/* SEARCH BAR */}

        <div className="relative flex flex-1">

          <input
            type="text"
            placeholder="Search products..."
            className="w-full rounded-2xl border border-gray-200 bg-gray-100 px-4 py-2 pr-12 text-xs outline-none transition-all duration-300 focus:border-blue-500 focus:bg-white sm:text-sm md:px-5 md:py-3 md:pr-14 md:text-base"
          />

          {/* VOICE ICON */}

          <button className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md transition-all duration-300 hover:scale-105 md:h-10 md:w-10">

            <Mic className="h-4 w-4 text-gray-700 md:h-5 md:w-5" />

          </button>

        </div>

        {/* BUTTONS */}

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
