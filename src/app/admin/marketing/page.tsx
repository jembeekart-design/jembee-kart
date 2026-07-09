"use client";

export const dynamic = "force-dynamic";

import {
  Megaphone,
  Bell,
  Send,
  Mail,
  Smartphone,
  BadgePercent,
  Sparkles,
  Gift,
  TrendingUp,
  Users,
  Target,
  Radio
} from "lucide-react";

export default function MarketingPage() {

  const tools = [

    {
      title: "Push Notifications",
      desc: "Send instant app notifications",
      icon: Bell,
      color: "bg-cyan-500"
    },

    {
      title: "SMS Campaign",
      desc: "Send bulk SMS promotions",
      icon: Smartphone,
      color: "bg-[var(--success-color)]"
    },

    {
      title: "Email Marketing",
      desc: "Send promotional emails",
      icon: Mail,
      color: "bg-pink-500"
    },

    {
      title: "Flash Sale",
      desc: "Create limited time sales",
      icon: TrendingUp,
      color: "bg-orange-500"
    },

    {
      title: "Coupons",
      desc: "Generate discount coupons",
      icon: Gift,
      color: "bg-[var(--secondary-color)]"
    },

    {
      title: "Affiliate Campaign",
      desc: "Manage affiliate promotions",
      icon: Users,
      color: "bg-[var(--warning-color)]"
    }

  ];

  return (

    <main className="min-h-screen bg-[#050505] p-4 text-[var(--button-text-color)]">

      {/* HEADER */}

      <div className="mb-8 flex items-center gap-4">

        <div className="flex h-16 w-16 items-center justify-center rounded-[30px] bg-pink-500">

          <Megaphone
            size={30}
            className="text-[var(--text-color)]"
          />

        </div>

        <div>

          <h1 className="text-4xl font-black">

            Marketing Center

          </h1>

          <p className="mt-1 text-sm text-gray-400">

            Manage all marketing campaigns

          </p>

        </div>

      </div>

      {/* STATS */}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

        <StatsCard
          title="Campaigns"
          value="128"
          icon={Target}
        />

        <StatsCard
          title="Notifications"
          value="12.5K"
          icon={Bell}
        />

        <StatsCard
          title="Emails Sent"
          value="85K"
          icon={Mail}
        />

        <StatsCard
          title="Conversions"
          value="4.8%"
          icon={TrendingUp}
        />

      </div>

      {/* TOOLS */}

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">

        {tools.map((item, index) => {

          const Icon =
            item.icon;

          return (

            <div
              key={index}
              className="rounded-[30px] border border-white/10 bg-[#111111] p-6"
            >

              <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${item.color}`}>

                <Icon
                  size={28}
                  className="text-[var(--text-color)]"
                />

              </div>

              <h2 className="mt-5 text-2xl font-black">

                {item.title}

              </h2>

              <p className="mt-2 text-sm text-gray-400">

                {item.desc}

              </p>

              <button
                className="mt-5 rounded-2xl bg-[var(--card-color)]/10 px-5 py-3 font-bold"
              >

                Open Tool

              </button>

            </div>

          );

        })}

      </div>

      {/* AI MARKETING */}

      <div className="mt-6 rounded-[30px] bg-gradient-to-r from-pink-500 to-violet-600 p-6">

        <div className="flex items-center gap-3">

          <Sparkles />

          <h2 className="text-3xl font-black">

            AI Marketing Booster

          </h2>

        </div>

        <p className="mt-3 text-[var(--button-text-color)]/80">

          AI automatically creates promotional campaigns,
          push notifications and trending offers.

        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">

          <FeatureCard
            title="AI Ads"
            desc="Generate smart ad campaigns"
          />

          <FeatureCard
            title="Auto Push"
            desc="Automatic user notifications"
          />

          <FeatureCard
            title="Sales Growth"
            desc="Increase conversions with AI"
          />

        </div>

      </div>

      {/* LIVE CAMPAIGNS */}

      <div className="mt-6 rounded-[30px] border border-white/10 bg-[#111111] p-6">

        <div className="flex items-center gap-3">

          <Radio className="text-pink-400" />

          <h2 className="text-2xl font-black">

            Live Campaigns

          </h2>

        </div>

        <div className="mt-5 space-y-4">

          <CampaignItem
            title="Mega Fashion Sale"
            status="Running"
          />

          <CampaignItem
            title="Diwali Cashback Offer"
            status="Active"
          />

          <CampaignItem
            title="Affiliate Bonus Campaign"
            status="Live"
          />

        </div>

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

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-500">

        <Icon
          size={24}
          className="text-[var(--text-color)]"
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

    <div className="rounded-[24px] bg-[var(--card-color)]/10 p-5">

      <h3 className="text-2xl font-black">

        {title}

      </h3>

      <p className="mt-2 text-sm text-[var(--button-text-color)]/80">

        {desc}

      </p>

    </div>

  );
}

function CampaignItem({
  title,
  status
}: {
  title: string;
  status: string;
}) {

  return (

    <div className="flex items-center justify-between rounded-2xl bg-black/30 p-5">

      <div>

        <h3 className="text-lg font-black">

          {title}

        </h3>

        <p className="mt-1 text-sm text-gray-400">

          Marketing campaign is active

        </p>

      </div>

      <div className="rounded-full bg-[var(--success-color)] px-4 py-2 text-sm font-black text-[var(--text-color)]">

        {status}

      </div>

    </div>

  );
}
