"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";

import {
  Mail,
  Send,
  Users,
  CheckCircle2,
  Clock,
  Search,
  Megaphone,
  BarChart3
} from "lucide-react";

const campaigns = [
  {
    title: "Summer Sale Campaign",
    audience: "12,540 Users",
    status: "Sent"
  },
  {
    title: "New Product Launch",
    audience: "8,200 Users",
    status: "Scheduled"
  },
  {
    title: "Festival Offer",
    audience: "20,120 Users",
    status: "Draft"
  }
];

export default function EmailMarketingPage() {

  const [search, setSearch] =
    useState("");

  const filteredCampaigns =
    campaigns.filter((item) =>
      item.title
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  return (

    <main className="min-h-screen bg-[#0b0b0b] p-4 text-[var(--button-text-color)]">

      {/* HEADER */}

      <div className="mb-8 flex items-center gap-4">

        <div className="flex h-16 w-16 items-center justify-center rounded-[28px] bg-pink-500">

          <Mail
            size={30}
            className="text-[var(--text-color)]"
          />

        </div>

        <div>

          <h1 className="text-3xl font-black">
            Email Marketing
          </h1>

          <p className="mt-1 text-sm text-[var(--muted-text-color)]">
            Manage campaigns & newsletters
          </p>

        </div>

      </div>

      {/* STATS */}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

        <StatCard
          title="Emails Sent"
          value="52K"
          icon={<Send size={22} />}
        />

        <StatCard
          title="Subscribers"
          value="18K"
          icon={<Users size={22} />}
        />

        <StatCard
          title="Open Rate"
          value="68%"
          icon={<BarChart3 size={22} />}
        />

        <StatCard
          title="Active Campaigns"
          value="12"
          icon={<Megaphone size={22} />}
        />

      </div>

      {/* SEARCH */}

      <div className="mt-6 flex items-center gap-3 rounded-[24px] border border-white/10 bg-[#151515] px-4 py-3">

        <Search
          size={20}
          className="text-[var(--muted-text-color)]"
        />

        <input
          type="text"
          placeholder="Search campaign..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          className="w-full bg-transparent outline-none placeholder:text-[var(--muted-text-color)]"
        />

      </div>

      {/* CAMPAIGNS */}

      <div className="mt-6 space-y-4">

        {filteredCampaigns.map(
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

                  <p className="mt-2 text-sm text-[var(--muted-text-color)]">
                    Audience:
                    {" "}
                    {item.audience}
                  </p>

                </div>

                <div
                  className={`rounded-full px-4 py-1 text-sm font-bold ${
                    item.status ===
                    "Sent"
                      ? "bg-[var(--success-color)]/20 text-green-400"
                      : item.status ===
                        "Scheduled"
                      ? "bg-[var(--warning-color)]/20 text-yellow-400"
                      : "bg-[var(--background-color)]0/20 text-gray-300"
                  }`}
                >

                  {item.status}

                </div>

              </div>

              <div className="mt-5 flex items-center justify-between">

                <div className="flex items-center gap-2 text-sm text-[var(--muted-text-color)]">

                  <Clock size={16} />

                  Last updated 2h ago

                </div>

                <button className="rounded-2xl bg-pink-500 px-5 py-2 font-bold text-[var(--text-color)]">

                  Open

                </button>

              </div>

            </div>

          )
        )}

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

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-500 text-[var(--text-color)]">

        {icon}

      </div>

      <p className="mt-4 text-sm text-[var(--muted-text-color)]">
        {title}
      </p>

      <h2 className="mt-2 text-3xl font-black">
        {value}
      </h2>

    </div>

  );
}
