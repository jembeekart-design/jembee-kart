// src/admin/theme/page.tsx

"use client";

import Link from "next/link";

import {
  BarChart3,
  Bell,
  Box,
  CreditCard,
  DollarSign,
  Home,
  Layers3,
  Package,
  Palette,
  Settings,
  ShoppingCart,
  Store,
  Users
} from "lucide-react";

export default function ThemePage() {

  return (

    <main className="min-h-screen bg-[#f6f6f6]">

      {/* TOPBAR */}

      <div className="sticky top-0 z-50 border-b bg-white px-4 py-4">

        <div className="flex items-center justify-between">

          <div>

            <h1 className="text-[24px] font-black text-purple-600">

              JembeeKart Admin

            </h1>

            <p className="text-[11px] text-gray-500">

              Full Theme Control Panel

            </p>

          </div>

          <button className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-4 py-2 text-[12px] font-bold text-white shadow-sm">

            Save Changes

          </button>

        </div>

      </div>

      <div className="flex">

        {/* SIDEBAR */}

        <div className="hidden min-h-screen w-[250px] border-r bg-white lg:block">

          <div className="space-y-2 p-4">

            <Link
              href="/admin/theme"
              className="flex items-center gap-3 rounded-xl bg-purple-100 px-4 py-3 text-sm font-bold text-purple-700"
            >
              <Home size={18} />
              Dashboard
            </Link>

            <Link
              href="/admin/theme/products"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold hover:bg-purple-50"
            >
              <Package size={18} />
              Products
            </Link>

            <Link
              href="/admin/theme/orders"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold hover:bg-purple-50"
            >
              <ShoppingCart size={18} />
              Orders
            </Link>

            <Link
              href="/admin/theme/customers"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold hover:bg-purple-50"
            >
              <Users size={18} />
              Customers
            </Link>

            <Link
              href="/admin/theme/analytics"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold hover:bg-purple-50"
            >
              <BarChart3 size={18} />
              Analytics
            </Link>

            <Link
              href="/admin/theme/earnings"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold hover:bg-purple-50"
            >
              <DollarSign size={18} />
              Earnings
            </Link>

            <Link
              href="/admin/theme/banners"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold hover:bg-purple-50"
            >
              <Layers3 size={18} />
              Banners
            </Link>

            <Link
              href="/admin/theme/settings"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold hover:bg-purple-50"
            >
              <Settings size={18} />
              Settings
            </Link>

          </div>

        </div>

        {/* CONTENT */}

        <div className="flex-1 p-4">

          {/* STATS */}

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

            <div className="rounded-[22px] bg-white p-5 shadow-sm">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-[11px] font-bold text-gray-500">

                    Total Sales

                  </p>

                  <h2 className="mt-2 text-[28px] font-black">

                    ₹84K

                  </h2>

                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">

                  <DollarSign
                    size={22}
                    className="text-purple-600"
                  />

                </div>

              </div>

            </div>

            <div className="rounded-[22px] bg-white p-5 shadow-sm">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-[11px] font-bold text-gray-500">

                    Orders

                  </p>

                  <h2 className="mt-2 text-[28px] font-black">

                    2,450

                  </h2>

                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">

                  <ShoppingCart
                    size={22}
                    className="text-blue-600"
                  />

                </div>

              </div>

            </div>

            <div className="rounded-[22px] bg-white p-5 shadow-sm">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-[11px] font-bold text-gray-500">

                    Customers

                  </p>

                  <h2 className="mt-2 text-[28px] font-black">

                    9,210

                  </h2>

                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-100">

                  <Users
                    size={22}
                    className="text-pink-600"
                  />

                </div>

              </div>

            </div>

            <div className="rounded-[22px] bg-white p-5 shadow-sm">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-[11px] font-bold text-gray-500">

                    Products

                  </p>

                  <h2 className="mt-2 text-[28px] font-black">

                    1,200

                  </h2>

                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">

                  <Box
                    size={22}
                    className="text-green-600"
                  />

                </div>

              </div>

            </div>

          </div>

          {/* THEME SETTINGS */}

          <div className="mt-5 grid gap-4 lg:grid-cols-2">

            {/* COLORS */}

            <div className="rounded-[22px] bg-white p-5 shadow-sm">

              <div className="flex items-center gap-2">

                <Palette
                  size={20}
                  className="text-purple-600"
                />

                <h2 className="text-[18px] font-black">

                  Theme Colors

                </h2>

              </div>

              <div className="mt-5 space-y-4">

                <div>

                  <label className="text-[12px] font-bold">

                    Primary Color

                  </label>

                  <input
                    type="color"
                    defaultValue="#7c3aed"
                    className="mt-2 h-12 w-full rounded-xl border"
                  />

                </div>

                <div>

                  <label className="text-[12px] font-bold">

                    Background Color

                  </label>

                  <input
                    type="color"
                    defaultValue="#f6f6f6"
                    className="mt-2 h-12 w-full rounded-xl border"
                  />

                </div>

                <div>

                  <label className="text-[12px] font-bold">

                    Sidebar Color

                  </label>

                  <input
                    type="color"
                    defaultValue="#ffffff"
                    className="mt-2 h-12 w-full rounded-xl border"
                  />

                </div>

              </div>

            </div>

            {/* STORE SETTINGS */}

            <div className="rounded-[22px] bg-white p-5 shadow-sm">

              <div className="flex items-center gap-2">

                <Store
                  size={20}
                  className="text-purple-600"
                />

                <h2 className="text-[18px] font-black">

                  Store Settings

                </h2>

              </div>

              <div className="mt-5 space-y-4">

                <div>

                  <label className="text-[12px] font-bold">

                    Store Name

                  </label>

                  <input
                    type="text"
                    placeholder="JembeeKart"
                    className="mt-2 w-full rounded-xl border px-4 py-3 text-sm outline-none"
                  />

                </div>

                <div>

                  <label className="text-[12px] font-bold">

                    Store Description

                  </label>

                  <textarea
                    placeholder="Enter store description"
                    className="mt-2 h-[120px] w-full rounded-xl border p-4 text-sm outline-none"
                  />

                </div>

              </div>

            </div>

          </div>

          {/* QUICK ACTIONS */}

          <div className="mt-5 rounded-[22px] bg-white p-5 shadow-sm">

            <h2 className="text-[18px] font-black">

              Quick Actions

            </h2>

            <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">

              <button className="rounded-2xl bg-purple-100 p-5">

                <Package
                  size={26}
                  className="mx-auto text-purple-600"
                />

                <p className="mt-3 text-[12px] font-black">

                  Add Product

                </p>

              </button>

              <button className="rounded-2xl bg-pink-100 p-5">

                <Bell
                  size={26}
                  className="mx-auto text-pink-600"
                />

                <p className="mt-3 text-[12px] font-black">

                  Notifications

                </p>

              </button>

              <button className="rounded-2xl bg-green-100 p-5">

                <CreditCard
                  size={26}
                  className="mx-auto text-green-600"
                />

                <p className="mt-3 text-[12px] font-black">

                  Payments

                </p>

              </button>

              <button className="rounded-2xl bg-blue-100 p-5">

                <Layers3
                  size={26}
                  className="mx-auto text-blue-600"
                />

                <p className="mt-3 text-[12px] font-black">

                  Banners

                </p>

              </button>

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}
