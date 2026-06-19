"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";

import {
  Ticket,
  MessageSquare,
  CheckCircle,
  Clock3,
  XCircle
} from "lucide-react";

interface TicketItem {
  id: number;
  user: string;
  subject: string;
  status: string;
}

export default function TicketsPage() {

  const [tickets, setTickets] =
    useState<TicketItem[]>([
      {
        id: 1,
        user: "Rahul Kumar",
        subject: "Payment issue",
        status: "pending"
      },
      {
        id: 2,
        user: "Aman Ali",
        subject: "Order not delivered",
        status: "solved"
      },
      {
        id: 3,
        user: "Sneha Sharma",
        subject: "Affiliate commission",
        status: "rejected"
      }
    ]);

  function updateStatus(
    id: number,
    status: string
  ) {

    setTickets((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status
            }
          : item
      )
    );
  }

  return (

    <main className="min-h-screen bg-[#0b0b0b] p-4 text-white">

      {/* HEADER */}

      <div className="mb-8 flex items-center gap-4">

        <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-amber-500">

          <Ticket size={30} />

        </div>

        <div>

          <h1 className="text-3xl font-black">
            Support Tickets
          </h1>

          <p className="mt-1 text-sm text-gray-400">
            Manage customer support requests
          </p>

        </div>

      </div>

      {/* STATS */}

      <div className="mb-6 grid grid-cols-3 gap-4">

        <div className="rounded-[30px] bg-[#151515] p-5">

          <Clock3
            size={28}
            className="text-yellow-400"
          />

          <p className="mt-4 text-sm text-gray-400">
            Pending
          </p>

          <h2 className="mt-2 text-3xl font-black">
            14
          </h2>

        </div>

        <div className="rounded-[30px] bg-[#151515] p-5">

          <CheckCircle
            size={28}
            className="text-green-400"
          />

          <p className="mt-4 text-sm text-gray-400">
            Solved
          </p>

          <h2 className="mt-2 text-3xl font-black">
            48
          </h2>

        </div>

        <div className="rounded-[30px] bg-[#151515] p-5">

          <MessageSquare
            size={28}
            className="text-cyan-400"
          />

          <p className="mt-4 text-sm text-gray-400">
            Total Tickets
          </p>

          <h2 className="mt-2 text-3xl font-black">
            62
          </h2>

        </div>

      </div>

      {/* TICKET LIST */}

      <div className="space-y-5">

        {tickets.map(
          (item) => (

            <div
              key={item.id}
              className="rounded-[30px] bg-[#151515] p-5"
            >

              <div className="flex items-center justify-between gap-4">

                <div>

                  <h2 className="text-2xl font-black">
                    {item.user}
                  </h2>

                  <p className="mt-2 text-sm text-gray-400">
                    {item.subject}
                  </p>

                  <div className="mt-4 inline-block rounded-full bg-amber-500 px-4 py-2 text-sm font-bold capitalize">

                    {item.status}

                  </div>

                </div>

                <div className="flex flex-wrap gap-3">

                  <button
                    onClick={() =>
                      updateStatus(
                        item.id,
                        "solved"
                      )
                    }
                    className="flex items-center gap-2 rounded-2xl bg-green-500 px-5 py-3 text-sm font-bold"
                  >

                    <CheckCircle size={18} />

                    Solve

                  </button>

                  <button
                    onClick={() =>
                      updateStatus(
                        item.id,
                        "rejected"
                      )
                    }
                    className="flex items-center gap-2 rounded-2xl bg-red-500 px-5 py-3 text-sm font-bold"
                  >

                    <XCircle size={18} />

                    Reject

                  </button>

                </div>

              </div>

            </div>

          )
        )}

      </div>

      {/* PREVIEW */}

      <div className="mt-6 rounded-[30px] bg-gradient-to-r from-amber-500 to-orange-500 p-6">

        <h2 className="text-3xl font-black">
          Support Center
        </h2>

        <p className="mt-2 text-white/80">
          Customer issue management system
        </p>

      </div>

    </main>

  );
}
