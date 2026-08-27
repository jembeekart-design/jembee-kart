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

    <header className="sticky top-0 z-50 flex h-[80px] items-center justify-between border-b border-[var(--color-border)]/10 bg-[var(--color-primary-button)]/95 px-4 backdrop-blur-xl">

      {/* LEFT */}

      <div className="flex items-center gap-3">

        <button className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-primary-button)] text-[var(--button-text-color)] lg:hidden">

          <Menu size={22} />

        </button>

        <div>

          <h1 className="text-2xl font-black text-[var(--button-text-color)]">

            Admin Dashboard

          </h1>

          <p className="text-sm text-[var(--text-muted)]">

            Welcome back admin

          </p>

        </div>

      </div>

      {/* CENTER */}

      <div className="hidden w-full max-w-[500px] px-8 md:block">

        <div className="flex h-14 items-center gap-3 rounded-2xl border border-[var(--color-border)]/10 bg-[var(--color-primary-button)] px-4">

          <Search
            size={20}
            className="text-[var(--text-muted)]"
          />

          <input
            type="text"
            placeholder="Search products, users, orders..."
            className="w-full bg-transparent text-sm text-[var(--button-text-color)] outline-none placeholder:text-[var(--text-muted)]"
          />

        </div>

      </div>

      {/* RIGHT */}

      <div className="flex items-center gap-3">

        {/* NOTIFICATION */}

        <button className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-primary-button)] text-[var(--button-text-color)] transition-all duration-300 hover:bg-[var(--color-primary-button)] hover:text-[var(--text-primary)]">

          <Bell size={20} />

          <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-[var(--color-danger)]" />

        </button>

        {/* SETTINGS */}

        <button className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-primary-button)] text-[var(--button-text-color)] transition-all duration-300 hover:bg-[var(--color-primary-button)] hover:text-[var(--text-primary)]">

          <Settings size={20} />

        </button>

        {/* PROFILE */}

        <div className="flex items-center gap-3 rounded-2xl bg-[var(--color-primary-button)] px-4 py-2">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-primary-button)] text-[var(--text-primary)]">

            <User size={20} />

          </div>

          <div className="hidden md:block">

            <h2 className="text-sm font-black text-[var(--button-text-color)]">

              Admin

            </h2>

            <p className="text-xs text-[var(--muted-text-color)]">

              Super Admin

            </p>

          </div>

        </div>

      </div>

    </header>

  );

}
