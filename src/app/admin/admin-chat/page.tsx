"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";

import {
  MessageSquare,
  Send,
  Users,
  Shield,
  Bell,
  Search,
  Phone,
  Video,
  Smile,
  Paperclip,
  CheckCheck
} from "lucide-react";

const chats = [
  {
    name: "Rahul Sharma",
    lastMessage: "Order issue solved 👍",
    online: true
  },
  {
    name: "Sneha Singh",
    lastMessage: "Need payment help",
    online: false
  },
  {
    name: "Aman Khan",
    lastMessage: "When will refund arrive?",
    online: true
  }
];

const messages = [
  {
    sender: "admin",
    text: "Hello 👋 How can I help you?"
  },
  {
    sender: "user",
    text: "My order is delayed."
  },
  {
    sender: "admin",
    text: "Please share order ID."
  }
];

export default function AdminChatPage() {

  const [message, setMessage] =
    useState("");

  return (

    <main className="min-h-screen bg-[#0b0b0b] p-4 text-[var(--button-text-color)]">

      {/* HEADER */}

      <div className="mb-6 flex items-center justify-between">

        <div className="flex items-center gap-4">

          <div className="flex h-16 w-16 items-center justify-center rounded-[28px] bg-cyan-500">

            <MessageSquare
              size={30}
              className="text-[var(--text-color)]"
            />

          </div>

          <div>

            <h1 className="text-3xl font-black">
              Admin Chat
            </h1>

            <p className="mt-1 text-sm text-gray-400">
              Realtime admin communication system
            </p>

          </div>

        </div>

        <button className="flex items-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 font-bold text-[var(--text-color)]">

          <Bell size={18} />

          Notifications

        </button>

      </div>

      {/* MAIN */}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

        {/* SIDEBAR */}

        <div className="rounded-[30px] border border-white/10 bg-[#151515] p-5">

          {/* SEARCH */}

          <div className="flex items-center gap-3 rounded-2xl bg-black/30 px-4 py-3">

            <Search
              size={18}
              className="text-gray-400"
            />

            <input
              type="text"
              placeholder="Search chats..."
              className="w-full bg-transparent outline-none placeholder:text-[var(--muted-text-color)]"
            />

          </div>

          {/* CHAT LIST */}

          <div className="mt-5 space-y-4">

            {chats.map(
              (
                item,
                index
              ) => (

                <div
                  key={index}
                  className="flex cursor-pointer items-center justify-between rounded-2xl bg-black/20 p-4 transition-all hover:bg-cyan-500/10"
                >

                  <div className="flex items-center gap-3">

                    <div className="relative">

                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500 text-[var(--text-color)] font-black">

                        {item.name.charAt(
                          0
                        )}

                      </div>

                      {item.online && (

                        <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-black bg-[var(--success-color)]" />

                      )}

                    </div>

                    <div>

                      <h2 className="font-black">

                        {item.name}

                      </h2>

                      <p className="text-sm text-gray-400">

                        {item.lastMessage}

                      </p>

                    </div>

                  </div>

                </div>

              )
            )}

          </div>

        </div>

        {/* CHAT AREA */}

        <div className="rounded-[30px] border border-white/10 bg-[#151515] lg:col-span-2">

          {/* TOP */}

          <div className="flex items-center justify-between border-b border-white/10 p-5">

            <div className="flex items-center gap-3">

              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500 text-[var(--text-color)] font-black">

                R

              </div>

              <div>

                <h2 className="text-xl font-black">
                  Rahul Sharma
                </h2>

                <p className="text-sm text-green-400">
                  Online
                </p>

              </div>

            </div>

            <div className="flex gap-3">

              <button className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black/30">

                <Phone size={18} />

              </button>

              <button className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black/30">

                <Video size={18} />

              </button>

            </div>

          </div>

          {/* MESSAGES */}

          <div className="h-[500px] space-y-4 overflow-y-auto p-5">

            {messages.map(
              (
                item,
                index
              ) => (

                <div
                  key={index}
                  className={`flex ${
                    item.sender ===
                    "admin"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >

                  <div
                    className={`max-w-[75%] rounded-3xl px-5 py-3 ${
                      item.sender ===
                      "admin"
                        ? "bg-cyan-500 text-[var(--text-color)]"
                        : "bg-black/30"
                    }`}
                  >

                    <p className="font-medium">
                      {item.text}
                    </p>

                    <div className="mt-2 flex items-center justify-end gap-1 text-xs">

                      10:24 PM

                      {item.sender ===
                        "admin" && (

                        <CheckCheck
                          size={14}
                        />

                      )}

                    </div>

                  </div>

                </div>

              )
            )}

          </div>

          {/* INPUT */}

          <div className="border-t border-white/10 p-5">

            <div className="flex items-center gap-3 rounded-2xl bg-black/30 p-3">

              <button className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--card-color)]/5">

                <Smile size={18} />

              </button>

              <button className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--card-color)]/5">

                <Paperclip size={18} />

              </button>

              <input
                type="text"
                placeholder="Type message..."
                value={message}
                onChange={(e) =>
                  setMessage(
                    e.target.value
                  )
                }
                className="w-full bg-transparent outline-none placeholder:text-[var(--muted-text-color)]"
              />

              <button className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500 text-[var(--text-color)]">

                <Send size={20} />

              </button>

            </div>

          </div>

        </div>

      </div>

      {/* STATS */}

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">

        <StatCard
          title="Online Users"
          value="124"
          icon={<Users size={22} />}
        />

        <StatCard
          title="Messages"
          value="12K"
          icon={<MessageSquare size={22} />}
        />

        <StatCard
          title="Support Staff"
          value="18"
          icon={<Shield size={22} />}
        />

        <StatCard
          title="Realtime"
          value="Active"
          icon={<Bell size={22} />}
        />

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

      <p className="mt-4 text-sm text-gray-400">
        {title}
      </p>

      <h2 className="mt-2 text-3xl font-black">
        {value}
      </h2>

    </div>

  );
}
