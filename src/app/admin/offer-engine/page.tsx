"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";

import {
  Gift,
  Percent,
  Tag,
  Timer,
  Search,
  Sparkles,
  BadgePercent,
  Zap,
  Clock3,
  Users
} from "lucide-react";

const offers = [
  {
    title: "Mega Flash Sale",
    discount: "50% OFF",
    users: "12K Users",
    status: "Active"
  },
  {
    title: "New User Offer",
    discount: "₹200 OFF",
    users: "5K Users",
    status: "Scheduled"
  },
  {
    title: "Festival Coupon",
    discount: "30% OFF",
    users: "18K Users",
    status: "Expired"
  }
];

export default function OfferEnginePage() {

  const [search, setSearch] =
    useState("");

  const filteredOffers =
    offers.filter((item) =>
      item.title
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  return (

    <main className="min-h-screen bg-[#0b0b0b] p-4 text-white">

      {/* HEADER */}

      <div className="mb-8 flex items-center gap-4">

        <div className="flex h-16 w-16 items-center justify-center rounded-[28px] bg-yellow-400">

          <Gift
            size={30}
            className="text-black"
          />

        </div>

        <div>

          <h1 className="text-3xl font-black">
            Offer Engine
          </h1>

          <p className="mt-1 text-sm text-gray-400">
            Create coupons, flash sales & offers
          </p>

        </div>

      </div>

      {/* STATS */}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

        <StatCard
          title="Active Offers"
          value="24"
          icon={<Tag size={22} />}
        />

        <StatCard
          title="Coupons Used"
          value="18K"
          icon={<Percent size={22} />}
        />

        <StatCard
          title="Flash Sales"
          value="12"
          icon={<Zap size={22} />}
        />

        <StatCard
          title="Customers"
          value="42K"
          icon={<Users size={22} />}
        />

      </div>

      {/* SEARCH */}

      <div className="mt-6 flex items-center gap-3 rounded-[24px] border border-white/10 bg-[#151515] px-4 py-3">

        <Search
          size={20}
          className="text-gray-400"
        />

        <input
          type="text"
          placeholder="Search offers..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          className="w-full bg-transparent outline-none placeholder:text-gray-500"
        />

      </div>

      {/* OFFER LIST */}

      <div className="mt-6 space-y-4">

        {filteredOffers.map(
          (
            item,
            index
          ) => (

            <div
              key={index}
              className="rounded-[28px] border border-white/10 bg-[#151515] p-5"
            >

              <div className="flex items-start justify-between">

                <div>

                  <h2 className="text-2xl font-black">
                    {item.title}
                  </h2>

                  <p className="mt-2 text-sm text-gray-400">
                    Audience:
                    {" "}
                    {item.users}
                  </p>

                </div>

                <div
                  className={`rounded-full px-4 py-1 text-sm font-bold ${
                    item.status ===
                    "Active"
                      ? "bg-green-500/20 text-green-400"
                      : item.status ===
                        "Scheduled"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >

                  {item.status}

                </div>

              </div>

              <div className="mt-5 flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-400 text-black">

                    <BadgePercent size={20} />

                  </div>

                  <div>

                    <p className="text-lg font-black">
                      {item.discount}
                    </p>

                    <div className="mt-1 flex items-center gap-2 text-sm text-gray-400">

                      <Clock3 size={14} />

                      Ends in 2 days

                    </div>

                  </div>

                </div>

                <button className="rounded-2xl bg-yellow-400 px-5 py-2 font-bold text-black">

                  Manage

                </button>

              </div>

            </div>

          )
        )}

      </div>

      {/* AI SECTION */}

      <div className="mt-6 rounded-[30px] bg-gradient-to-r from-yellow-400 to-orange-500 p-6 text-black">

        <div className="flex items-center gap-3">

          <Sparkles size={26} />

          <h2 className="text-3xl font-black">
            AI Offer Generator
          </h2>

        </div>

        <p className="mt-3 max-w-2xl text-sm font-medium">

          Automatically generate high converting offers,
          coupons and flash sales using AI.

        </p>

        <button className="mt-6 rounded-2xl bg-black px-6 py-3 font-bold text-white">

          Generate AI Offer

        </button>

      </div>

    </main>

  );
}

function StatCard({
  title,
  value,
  icon
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {

  return (

    <div className="rounded-[28px] border border-white/10 bg-[#151515] p-5">

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-400 text-black">

        {icon}

      </div>

      <p className="mt-4 text-sm text-gray-400">
        {title}
      </p>

      <h2 className="mt-2 text-3xl font-black">
        {value}
      </h2>

    </div>

  );
}
