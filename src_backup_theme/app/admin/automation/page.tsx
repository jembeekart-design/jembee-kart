"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";

import {
  Bot,
  Zap,
  Clock3,
  ShoppingCart,
  Bell,
  Save,
  PlayCircle,
  PauseCircle,
  Sparkles,
  Workflow,
  MessageSquare,
  Truck,
  BadgePercent
} from "lucide-react";

export default function AutomationPage() {

  const [enabled, setEnabled] =
    useState(true);

  const automations = [

    {
      title: "Auto Order Confirmation",
      desc: "Send automatic order messages",
      icon: ShoppingCart,
      active: true
    },

    {
      title: "Auto Push Notification",
      desc: "Automatic push campaigns",
      icon: Bell,
      active: true
    },

    {
      title: "Auto Delivery Update",
      desc: "Send live delivery updates",
      icon: Truck,
      active: false
    },

    {
      title: "Affiliate Auto Commission",
      desc: "Instant referral commission",
      icon: BadgePercent,
      active: true
    },

    {
      title: "AI Chat Reply",
      desc: "Automatic AI customer support",
      icon: MessageSquare,
      active: true
    }

  ];

  return (

    <main className="min-h-screen bg-[#050505] p-4 text-white">

      {/* HEADER */}

      <div className="mb-8 flex items-center justify-between">

        <div className="flex items-center gap-4">

          <div className="flex h-16 w-16 items-center justify-center rounded-[30px] bg-yellow-400">

            <Workflow
              size={30}
              className="text-black"
            />

          </div>

          <div>

            <h1 className="text-4xl font-black">

              Automation Center

            </h1>

            <p className="mt-1 text-sm text-gray-400">

              Smart AI workflow automation system

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
            ? "Automation ON"
            : "Automation OFF"}

        </button>

      </div>

      {/* STATS */}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

        <StatsCard
          title="Active Bots"
          value="24"
          icon={Bot}
        />

        <StatsCard
          title="Automations"
          value="138"
          icon={Zap}
        />

        <StatsCard
          title="Tasks Today"
          value="2.4K"
          icon={Clock3}
        />

        <StatsCard
          title="AI Actions"
          value="12K"
          icon={Sparkles}
        />

      </div>

      {/* AUTOMATIONS */}

      <div className="mt-6 rounded-[30px] border border-white/10 bg-[#111111] p-6">

        <div className="flex items-center gap-3">

          <Zap className="text-yellow-400" />

          <h2 className="text-3xl font-black">

            Active Automations

          </h2>

        </div>

        <div className="mt-6 space-y-5">

          {automations.map(
            (
              item,
              index
            ) => {

              const Icon =
                item.icon;

              return (

                <div
                  key={index}
                  className="flex items-center justify-between rounded-[24px] bg-black/30 p-5"
                >

                  <div className="flex items-center gap-4">

                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-400">

                      <Icon
                        size={24}
                        className="text-black"
                      />

                    </div>

                    <div>

                      <h3 className="text-xl font-black">

                        {item.title}

                      </h3>

                      <p className="mt-1 text-sm text-gray-400">

                        {item.desc}

                      </p>

                    </div>

                  </div>

                  <button
                    className={`rounded-2xl px-5 py-3 font-black ${
                      item.active
                        ? "bg-green-500 text-black"
                        : "bg-red-500 text-white"
                    }`}
                  >

                    {item.active
                      ? "Running"
                      : "Stopped"}

                  </button>

                </div>

              );

            }
          )}

        </div>

      </div>

      {/* AI AUTOMATION */}

      <div className="mt-6 rounded-[30px] bg-gradient-to-r from-yellow-400 to-orange-500 p-6 text-black">

        <div className="flex items-center gap-3">

          <Sparkles />

          <h2 className="text-3xl font-black">

            AI Smart Automation

          </h2>

        </div>

        <p className="mt-3 font-medium">

          AI automatically handles orders,
          customer replies, commissions,
          notifications and promotions.

        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">

          <FeatureCard
            title="24x7 Automation"
            desc="Runs continuously without downtime"
          />

          <FeatureCard
            title="AI Decision"
            desc="Smart automatic workflow logic"
          />

          <FeatureCard
            title="Realtime Actions"
            desc="Instant triggers and execution"
          />

        </div>

      </div>

      {/* ACTIONS */}

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

          <PlayCircle size={20} />

          Run All

        </button>

        <button
          className="flex items-center gap-2 rounded-2xl bg-red-500 px-6 py-4 font-black"
        >

          <PauseCircle size={20} />

          Stop All

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

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-400">

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

function FeatureCard({
  title,
  desc
}: {
  title: string;
  desc: string;
}) {

  return (

    <div className="rounded-[24px] bg-white/20 p-5 backdrop-blur-lg">

      <h3 className="text-2xl font-black">

        {title}

      </h3>

      <p className="mt-2 text-sm">

        {desc}

      </p>

    </div>

  );
}
