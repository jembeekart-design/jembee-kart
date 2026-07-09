"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";

import {
  Headphones,
  Search,
  MessageSquare,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

const tickets = [
  {
    id: "#SUP-1021",
    user: "Rahul Sharma",
    issue: "Order not delivered",
    status: "Pending",
    priority: "High"
  },
  {
    id: "#SUP-1022",
    user: "Aman Khan",
    issue: "Refund request",
    status: "Resolved",
    priority: "Medium"
  },
  {
    id: "#SUP-1023",
    user: "Priya Singh",
    issue: "Payment failed",
    status: "Open",
    priority: "High"
  },
  {
    id: "#SUP-1024",
    user: "Rohit Das",
    issue: "Account issue",
    status: "Resolved",
    priority: "Low"
  }
];

export default function CustomerSupportPage() {

  const [search, setSearch] =
    useState("");

  const filteredTickets =
    tickets.filter((item) =>
      item.user
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  return (

    <main className="min-h-screen bg-[#0b0b0b] p-4 text-[var(--button-text-color)]">

      {/* HEADER */}

      <div className="mb-8 flex items-center gap-4">

        <div className="flex h-16 w-16 items-center justify-center rounded-[28px] bg-cyan-500">

          <Headphones
            size={30}
            className="text-[var(--text-color)]"
          />

        </div>

        <div>

          <h1 className="text-3xl font-black">
            Customer Support
          </h1>

          <p className="mt-1 text-sm text-[var(--muted-text-color)]">
            Manage customer tickets & support
          </p>

        </div>

      </div>

      {/* TOP STATS */}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

        <StatCard
          title="Open Tickets"
          value="124"
          icon={<AlertCircle size={22} />}
        />

        <StatCard
          title="Resolved"
          value="980"
          icon={<CheckCircle2 size={22} />}
        />

        <StatCard
          title="Calls"
          value="320"
          icon={<Phone size={22} />}
        />

        <StatCard
          title="Emails"
          value="540"
          icon={<Mail size={22} />}
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
          placeholder="Search customer..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          className="w-full bg-transparent outline-none placeholder:text-[var(--muted-text-color)]"
        />

      </div>

      {/* TICKETS */}

      <div className="mt-6 space-y-4">

        {filteredTickets.map(
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

                  <h2 className="text-xl font-black">
                    {item.user}
                  </h2>

                  <p className="mt-1 text-sm text-[var(--muted-text-color)]">
                    {item.id}
                  </p>

                </div>

                <div className="rounded-full bg-cyan-500/20 px-4 py-1 text-sm font-bold text-cyan-400">

                  {item.priority}

                </div>

              </div>

              <div className="mt-5 flex items-center gap-3">

                <MessageSquare
                  size={18}
                  className="text-cyan-400"
                />

                <p className="text-gray-300">
                  {item.issue}
                </p>

              </div>

              <div className="mt-5 flex items-center justify-between">

                <div className="flex items-center gap-2 text-sm text-[var(--muted-text-color)]">

                  <Clock size={16} />

                  Updated 5 min ago

                </div>

                <div
                  className={`rounded-full px-4 py-1 text-sm font-bold ${
                    item.status ===
                    "Resolved"
                      ? "bg-[var(--success-color)]/20 text-green-400"
                      : "bg-[var(--warning-color)]/20 text-yellow-400"
                  }`}
                >

                  {item.status}

                </div>

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

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500 text-[var(--text-color)]">

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
