"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";

import {
  Megaphone,
  Eye,
  MousePointerClick,
  TrendingUp,
  Search,
  Plus,
  BadgeDollarSign,
  Globe,
  Sparkles,
  PlayCircle
} from "lucide-react";

const ads = [
  {
    title: "Homepage Banner Ad",
    platform: "Google Ads",
    budget: "₹12,000",
    status: "Running"
  },
  {
    title: "Instagram Campaign",
    platform: "Meta Ads",
    budget: "₹8,500",
    status: "Paused"
  },
  {
    title: "YouTube Promotion",
    platform: "YouTube Ads",
    budget: "₹15,000",
    status: "Completed"
  }
];

export default function AdsManagerPage() {

  const [search, setSearch] =
    useState("");

  const filteredAds =
    ads.filter((item) =>
      item.title
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  return (

    <main className="min-h-screen bg-[#0b0b0b] p-4 text-[var(--button-text-color)]">

      {/* HEADER */}

      <div className="mb-8 flex items-center justify-between">

        <div className="flex items-center gap-4">

          <div className="flex h-16 w-16 items-center justify-center rounded-[28px] bg-[var(--secondary-color)]">

            <Megaphone
              size={30}
              className="text-[var(--text-color)]"
            />

          </div>

          <div>

            <h1 className="text-3xl font-black">
              Ads Manager
            </h1>

            <p className="mt-1 text-sm text-gray-400">
              Manage ad campaigns & traffic
            </p>

          </div>

        </div>

        <button className="flex items-center gap-2 rounded-2xl bg-[var(--secondary-color)] px-5 py-3 font-bold text-[var(--text-color)]">

          <Plus size={18} />

          Create Ad

        </button>

      </div>

      {/* STATS */}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

        <StatCard
          title="Active Ads"
          value="18"
          icon={<Megaphone size={22} />}
        />

        <StatCard
          title="Impressions"
          value="2.4M"
          icon={<Eye size={22} />}
        />

        <StatCard
          title="Clicks"
          value="84K"
          icon={<MousePointerClick size={22} />}
        />

        <StatCard
          title="Revenue"
          value="₹4.8L"
          icon={<TrendingUp size={22} />}
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
          placeholder="Search ads..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          className="w-full bg-transparent outline-none placeholder:text-[var(--muted-text-color)]"
        />

      </div>

      {/* ADS LIST */}

      <div className="mt-6 space-y-4">

        {filteredAds.map(
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

                  <div className="mt-2 flex items-center gap-2 text-sm text-gray-400">

                    <Globe size={15} />

                    {item.platform}

                  </div>

                </div>

                <div
                  className={`rounded-full px-4 py-1 text-sm font-bold ${
                    item.status ===
                    "Running"
                      ? "bg-[var(--success-color)]/20 text-green-400"
                      : item.status ===
                        "Paused"
                      ? "bg-[var(--warning-color)]/20 text-yellow-400"
                      : "bg-gray-500/20 text-gray-300"
                  }`}
                >

                  {item.status}

                </div>

              </div>

              <div className="mt-5 flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--secondary-color)] text-[var(--text-color)]">

                    <BadgeDollarSign size={20} />

                  </div>

                  <div>

                    <p className="font-black">
                      {item.budget}
                    </p>

                    <p className="text-sm text-gray-400">
                      Ad Budget
                    </p>

                  </div>

                </div>

                <button className="rounded-2xl bg-[var(--secondary-color)] px-5 py-2 font-bold text-[var(--text-color)]">

                  Manage

                </button>

              </div>

            </div>

          )
        )}

      </div>

      {/* AI ADS */}

      <div className="mt-6 rounded-[30px] bg-gradient-to-r from-violet-500 to-fuchsia-500 p-6">

        <div className="flex items-center gap-3">

          <Sparkles size={26} />

          <h2 className="text-3xl font-black">
            AI Ads Generator
          </h2>

        </div>

        <p className="mt-3 max-w-2xl text-sm text-[var(--button-text-color)]/90">

          Generate high converting ad creatives &
          campaigns automatically using AI.

        </p>

        <button className="mt-6 flex items-center gap-2 rounded-2xl bg-black px-6 py-3 font-bold text-[var(--button-text-color)]">

          <PlayCircle size={18} />

          Generate AI Ads

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

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--secondary-color)] text-[var(--text-color)]">

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
