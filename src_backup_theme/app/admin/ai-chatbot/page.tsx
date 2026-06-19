"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";

import {
  Bot,
  Send,
  MessageSquare,
  Brain,
  Sparkles,
  Users,
  Clock3,
  Shield,
  Save,
  Power,
  Mic,
  Headphones
} from "lucide-react";

export default function AIChatbotPage() {

  const [enabled, setEnabled] =
    useState(true);

  const [message, setMessage] =
    useState("");

  const chats = [

    {
      user: "Customer",
      text: "Where is my order?"
    },

    {
      user: "AI Bot",
      text: "Your order is out for delivery 🚚"
    },

    {
      user: "Customer",
      text: "How can I return product?"
    },

    {
      user: "AI Bot",
      text: "You can request return from orders page."
    }

  ];

  return (

    <main className="min-h-screen bg-[#050505] p-4 text-white">

      {/* HEADER */}

      <div className="mb-8 flex items-center justify-between">

        <div className="flex items-center gap-4">

          <div className="flex h-16 w-16 items-center justify-center rounded-[30px] bg-violet-500">

            <Bot
              size={30}
              className="text-black"
            />

          </div>

          <div>

            <h1 className="text-4xl font-black">

              AI Chatbot

            </h1>

            <p className="mt-1 text-sm text-gray-400">

              Smart AI customer support system

            </p>

          </div>

        </div>

        <button
          onClick={() =>
            setEnabled(!enabled)
          }
          className={`rounded-2xl px-6 py-4 font-black ${
            enabled
              ? "bg-green-500 text-black"
              : "bg-red-500 text-white"
          }`}
        >

          {enabled
            ? "Bot Enabled"
            : "Bot Disabled"}

        </button>

      </div>

      {/* STATS */}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

        <StatsCard
          title="Chats Today"
          value="1,284"
          icon={MessageSquare}
        />

        <StatsCard
          title="AI Replies"
          value="9,430"
          icon={Brain}
        />

        <StatsCard
          title="Customers"
          value="3,201"
          icon={Users}
        />

        <StatsCard
          title="Response Time"
          value="0.8s"
          icon={Clock3}
        />

      </div>

      {/* CHAT WINDOW */}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* CHAT */}

        <div className="rounded-[30px] border border-white/10 bg-[#111111] p-6 lg:col-span-2">

          <div className="flex items-center gap-3">

            <MessageSquare className="text-violet-400" />

            <h2 className="text-2xl font-black">

              Live AI Chat

            </h2>

          </div>

          <div className="mt-6 space-y-4">

            {chats.map(
              (
                item,
                index
              ) => (

                <div
                  key={index}
                  className={`rounded-2xl p-4 ${
                    item.user === "AI Bot"
                      ? "bg-violet-500 text-black"
                      : "bg-black/30"
                  }`}
                >

                  <h3 className="font-black">

                    {item.user}

                  </h3>

                  <p className="mt-2 text-sm">

                    {item.text}

                  </p>

                </div>

              )
            )}

          </div>

          {/* INPUT */}

          <div className="mt-6 flex gap-3">

            <input
              type="text"
              value={message}
              onChange={(e) =>
                setMessage(
                  e.target.value
                )
              }
              placeholder="Type message..."
              className="flex-1 rounded-2xl border border-white/10 bg-black/30 p-4 outline-none"
            />

            <button
              className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500"
            >

              <Send
                size={20}
                className="text-black"
              />

            </button>

          </div>

        </div>

        {/* SETTINGS */}

        <div className="space-y-6">

          <div className="rounded-[30px] border border-white/10 bg-[#111111] p-6">

            <div className="flex items-center gap-3">

              <Sparkles className="text-violet-400" />

              <h2 className="text-2xl font-black">

                AI Features

              </h2>

            </div>

            <div className="mt-5 space-y-4">

              <FeatureItem
                title="Auto Replies"
              />

              <FeatureItem
                title="Voice Support"
              />

              <FeatureItem
                title="Realtime Responses"
              />

              <FeatureItem
                title="Order Tracking"
              />

            </div>

          </div>

          <div className="rounded-[30px] bg-gradient-to-r from-violet-500 to-fuchsia-500 p-6 text-black">

            <div className="flex items-center gap-3">

              <Brain />

              <h2 className="text-3xl font-black">

                AI Learning

              </h2>

            </div>

            <p className="mt-3 font-medium">

              AI continuously learns from customer conversations
              and improves responses automatically.

            </p>

          </div>

        </div>

      </div>

      {/* CONTROLS */}

      <div className="mt-6 flex flex-wrap gap-4">

        <button
          className="flex items-center gap-2 rounded-2xl bg-green-500 px-6 py-4 font-black text-black"
        >

          <Save size={20} />

          Save Settings

        </button>

        <button
          className="flex items-center gap-2 rounded-2xl bg-cyan-500 px-6 py-4 font-black text-black"
        >

          <Mic size={20} />

          Voice Mode

        </button>

        <button
          className="flex items-center gap-2 rounded-2xl bg-red-500 px-6 py-4 font-black"
        >

          <Power size={20} />

          Restart Bot

        </button>

      </div>

    </main>

  );
}

function StatsCard({
  title,
  value,
  icon: Icon
}: any) {

  return (

    <div className="rounded-[30px] border border-white/10 bg-[#111111] p-5">

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500">

        <Icon
          size={24}
          className="text-black"
        />

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

function FeatureItem({
  title
}: {
  title: string;
}) {

  return (

    <div className="flex items-center justify-between rounded-2xl bg-black/30 p-4">

      <div className="flex items-center gap-3">

        <Shield className="text-violet-400" />

        <h3 className="font-bold">

          {title}

        </h3>

      </div>

      <div className="h-3 w-3 rounded-full bg-green-500" />

    </div>

  );
}
