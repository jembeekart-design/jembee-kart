"use client";

import {
  Bell,
  Search,
  User,
  Settings,
  Menu
} from "lucide-react";

export default function AdminNavbar() {

  return (

    <header className="sticky top-0 z-50 flex h-[80px] items-center justify-between border-b border-white/10 bg-[#0b0b0b]/95 px-4 backdrop-blur-xl">

      {/* LEFT */}

      <div className="flex items-center gap-3">

        <button className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#151515] text-white lg:hidden">

          <Menu size={22} />

        </button>

        <div>

          <h1 className="text-2xl font-black text-white">

            Admin Dashboard

          </h1>

          <p className="text-sm text-gray-400">

            Welcome back admin

          </p>

        </div>

      </div>

      {/* CENTER */}

      <div className="hidden w-full max-w-[500px] px-8 md:block">

        <div className="flex h-14 items-center gap-3 rounded-2xl border border-white/10 bg-[#151515] px-4">

          <Search
            size={20}
            className="text-gray-400"
          />

          <input
            type="text"
            placeholder="Search products, users, orders..."
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
          />

        </div>

      </div>

      {/* RIGHT */}

      <div className="flex items-center gap-3">

        {/* NOTIFICATION */}

        <button className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-[#151515] text-white transition-all duration-300 hover:bg-cyan-500 hover:text-black">

          <Bell size={20} />

          <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500" />

        </button>

        {/* SETTINGS */}

        <button className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#151515] text-white transition-all duration-300 hover:bg-cyan-500 hover:text-black">

          <Settings size={20} />

        </button>

        {/* PROFILE */}

        <div className="flex items-center gap-3 rounded-2xl bg-[#151515] px-4 py-2">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500 text-black">

            <User size={20} />

          </div>

          <div className="hidden md:block">

            <h2 className="text-sm font-black text-white">

              Admin

            </h2>

            <p className="text-xs text-gray-400">

              Super Admin

            </p>

          </div>

        </div>

      </div>

    </header>

  );

}
