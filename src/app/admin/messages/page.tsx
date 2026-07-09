"use client";

export const dynamic = "force-dynamic";

import {
  MessageCircle,
  Search,
  Send,
  User
} from "lucide-react";

export default function MessagesPage() {

  const messages = [
    {
      name: "Rahul Kumar",
      message: "Order kab deliver hoga?"
    },
    {
      name: "Aman Ali",
      message: "Payment issue aa raha hai"
    },
    {
      name: "Sneha Sharma",
      message: "Affiliate link kaise use kare?"
    },
    {
      name: "Rohit Raj",
      message: "Return request bhejna hai"
    }
  ];

  return (

    <main className="min-h-screen bg-[#0b0b0b] p-4 text-[var(--button-text-color)]">

      {/* HEADER */}

      <div className="mb-8 flex items-center gap-3">

        <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-violet-600">

          <MessageCircle size={30} />

        </div>

        <div>

          <h1 className="text-3xl font-black">
            Customer Messages
          </h1>

          <p className="mt-1 text-sm text-[var(--muted-text-color)]">
            Manage customer chats
          </p>

        </div>

      </div>

      {/* SEARCH */}

      <div className="mb-6 flex items-center gap-3 rounded-[24px] border border-white/10 bg-[#151515] px-4 py-4">

        <Search
          size={20}
          className="text-[var(--muted-text-color)]"
        />

        <input
          type="text"
          placeholder="Search messages..."
          className="w-full bg-transparent text-sm outline-none"
        />

      </div>

      {/* MESSAGE LIST */}

      <div className="space-y-4">

        {messages.map(
          (item, index) => (

            <div
              key={index}
              className="rounded-[30px] border border-white/10 bg-[#151515] p-5"
            >

              <div className="flex items-start justify-between">

                <div className="flex items-center gap-4">

                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-600">

                    <User size={24} />

                  </div>

                  <div>

                    <h2 className="text-lg font-black">
                      {item.name}
                    </h2>

                    <p className="mt-1 text-sm text-[var(--muted-text-color)]">
                      {item.message}
                    </p>

                  </div>

                </div>

                <button
                  className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600"
                >

                  <Send size={18} />

                </button>

              </div>

            </div>

          )
        )}

      </div>

      {/* QUICK STATS */}

      <div className="mt-6 rounded-[30px] bg-gradient-to-r from-violet-600 to-fuchsia-500 p-6">

        <h2 className="text-3xl font-black">
          Inbox Overview
        </h2>

        <p className="mt-2 text-[var(--button-text-color)]/80">
          24 unread messages waiting
        </p>

        <div className="mt-6 grid grid-cols-2 gap-4">

          <div className="rounded-2xl bg-[var(--card-color)]/10 p-4">

            <p className="text-sm">
              Total Messages
            </p>

            <h3 className="mt-2 text-3xl font-black">
              1,240
            </h3>

          </div>

          <div className="rounded-2xl bg-[var(--card-color)]/10 p-4">

            <p className="text-sm">
              Active Chats
            </p>

            <h3 className="mt-2 text-3xl font-black">
              86
            </h3>

          </div>

        </div>

      </div>

    </main>

  );
}
