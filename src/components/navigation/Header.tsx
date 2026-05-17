"use client";

import { Mic, Search } from "lucide-react";

interface HeaderProps {
  headerBackgroundColor?: string;

  headerTextColor?: string;

  searchBarColor?: string;

  statusBarColor?: string;
}

export default function Header({
  headerBackgroundColor = "#ffffff",

  headerTextColor = "#2563eb",

  searchBarColor = "#f3f4f6",

  statusBarColor = "#ffffff"
}: HeaderProps) {
  // STATUS BAR COLOR CHANGE

  if (typeof document !== "undefined") {
    let metaTheme =
      document.querySelector(
        'meta[name="theme-color"]'
      );

    if (!metaTheme) {
      metaTheme =
        document.createElement(
          "meta"
        );

      metaTheme.setAttribute(
        "name",
        "theme-color"
      );

      document.head.appendChild(
        metaTheme
      );
    }

    metaTheme.setAttribute(
      "content",
      statusBarColor
    );
  }

  return (
    <header
      className="fixed left-0 top-0 z-50 w-full border-b border-gray-200 backdrop-blur-xl"
      style={{
        backgroundColor:
          headerBackgroundColor
      }}
    >

      <div className="w-full px-3 pt-[env(safe-area-inset-top)] pb-3 md:px-6">

        {/* TOP HEADER */}

        <div className="flex items-center justify-between gap-3">

          {/* LOGO */}

          <div className="min-w-0">

            <h1
              className="truncate text-3xl font-black leading-none md:text-4xl"
              style={{
                color:
                  headerTextColor
              }}
            >
              JembeeKart
            </h1>

            <p className="mt-1 text-xs text-gray-500 md:text-sm">
              AI Ecommerce Ecosystem
            </p>

          </div>

          {/* BUTTONS */}

          <div className="flex shrink-0 items-center gap-2">

            <button className="rounded-xl bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 transition-all duration-300 hover:bg-gray-200">
              Login
            </button>

            <button className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-blue-700">
              Seller
            </button>

          </div>

        </div>

        {/* SEARCH BAR */}

        <div className="relative mt-3 w-full">

          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

          <input
            type="text"
            placeholder="Search products..."
            className="w-full rounded-2xl border border-gray-200 py-3 pl-12 pr-14 text-sm outline-none transition-all duration-300 focus:border-blue-500 focus:bg-white md:text-base"
            style={{
              backgroundColor:
                searchBarColor
            }}
          />

          {/* VOICE BUTTON */}

          <button className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md transition-all duration-300 hover:scale-105">

            <Mic className="h-5 w-5 text-gray-700" />

          </button>

        </div>

      </div>

    </header>
  );
}
