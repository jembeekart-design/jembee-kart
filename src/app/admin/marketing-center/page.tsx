"use client";

export const dynamic = "force-dynamic";

import {
  Megaphone,
  Bell,
  Mail,
  Send,
  Smartphone,
  Gift,
  Users,
  TrendingUp,
  Sparkles,
  BadgePercent,
  Target,
  Zap,
  BarChart3,
  Globe,
  ShoppingBag,
  Calendar
} from "lucide-react";

export default function MarketingCenterPage() {

  const campaigns = [

    {
      name: "Summer Sale",
      status: "Running",
      reach: "12K Users"
    },

    {
      name: "Affiliate Boost",
      status: "Active",
      reach: "8K Users"
    },

    {
      name: "Flash Deal",
      status: "Scheduled",
      reach: "5K Users"
    }

  ];

  return (

    <main className="min-h-screen bg-[#050505] p-4 text-[var(--button-text-color)]">

      {/* HEADER */}

      <div className="mb-8 flex items-center justify-between">

        <div className="flex items-center gap-4">

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

              Campaigns, promotions & growth tools

            </p>

          </div>

        </div>

        <button
          className="rounded-2xl bg-pink-500 px-6 py-4 font-black text-[var(--text-color)]"
        >

          Create Campaign

        </button>

      </div>

      {/* STATS */}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

        <StatsCard
          title="Campaigns"
          value="24"
          icon={Megaphone}
        />

        <StatsCard
          title="Customers Reached"
          value="120K"
          icon={Users}
        />

        <StatsCard
          title="Conversion Rate"
          value="18%"
          icon={TrendingUp}
        />

        <StatsCard
          title="Revenue"
          value="₹8.4L"
          icon={BarChart3}
        />

      </div>

      {/* TOOLS */}

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">

        <ToolCard
          title="Push Notifications"
          icon={Bell}
        />

        <ToolCard
          title="Email Marketing"
          icon={Mail}
        />

        <ToolCard
          title="SMS Campaign"
          icon={Smartphone}
        />

        <ToolCard
          title="Referral Boost"
          icon={Gift}
        />

        <ToolCard
          title="Affiliate Offers"
          icon={BadgePercent}
        />

        <ToolCard
          title="Target Ads"
          icon={Target}
        />

        <ToolCard
          title="Flash Deals"
          icon={Zap}
        />

        <ToolCard
          title="Global Reach"
          icon={Globe}
        />

      </div>

      {/* CAMPAIGNS */}

      <div className="mt-6 rounded-[30px] border border-white/10 bg-[#111111] p-6">

        <div className="flex items-center gap-3">

          <Sparkles className="text-pink-400" />

          <h2 className="text-3xl font-black">

            Active Campaigns

          </h2>

        </div>

        <div className="mt-6 space-y-5">

          {campaigns.map(
            (
              item,
              index
            ) => (

              <div
                key={index}
                className="rounded-[24px] bg-black/30 p-5"
              >

                <div className="flex items-center justify-between">

                  <div>

                    <h3 className="text-xl font-black">

                      {item.name}

                    </h3>

                    <p className="mt-1 text-sm text-gray-400">

                      Reach:
                      {" "}
                      {item.reach}

                    </p>

                  </div>

                  <div className="rounded-full bg-pink-500 px-4 py-2 text-sm font-black text-[var(--text-color)]">

                    {item.status}

                  </div>

                </div>

              </div>

            )
          )}

        </div>

      </div>

      {/* ANALYTICS */}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">

        <div className="rounded-[30px] border border-white/10 bg-[#111111] p-6">

          <div className="flex items-center gap-3">

            <TrendingUp className="text-pink-400" />

            <h2 className="text-2xl font-black">

              Growth Analytics

            </h2>

          </div>

          <div className="mt-6 flex items-end gap-3">

            <div className="h-[100px] w-full rounded-t-2xl bg-pink-500/30" />

            <div className="h-[180px] w-full rounded-t-2xl bg-pink-500/50" />

            <div className="h-[130px] w-full rounded-t-2xl bg-pink-500/40" />

            <div className="h-[240px] w-full rounded-t-2xl bg-pink-500" />

            <div className="h-[170px] w-full rounded-t-2xl bg-pink-500/60" />

            <div className="h-[220px] w-full rounded-t-2xl bg-pink-500/80" />

          </div>

        </div>

        <div className="rounded-[30px] border border-white/10 bg-[#111111] p-6">

          <div className="flex items-center gap-3">

            <ShoppingBag className="text-pink-400" />

            <h2 className="text-2xl font-black">

              Marketing Insights

            </h2>

          </div>

          <div className="mt-6 space-y-4">

            <InsightItem
              title="Top Campaign"
              value="Summer Sale"
            />

            <InsightItem
              title="Best Platform"
              value="Push Notifications"
            />

            <InsightItem
              title="Highest Traffic"
              value="Affiliate Links"
            />

            <InsightItem
              title="Best Day"
              value="Friday"
            />

          </div>

        </div>

      </div>

      {/* SCHEDULE */}

      <div className="mt-6 rounded-[30px] bg-gradient-to-r from-pink-500 to-fuchsia-600 p-6 text-[var(--text-color)]">

        <div className="flex items-center gap-3">

          <Calendar />

          <h2 className="text-3xl font-black">

            Scheduled Promotions

          </h2>

        </div>

        <div className="mt-5 space-y-4">

          <ScheduleItem
            text="Mega Festival Sale - Tomorrow"
          />

          <ScheduleItem
            text="Weekend Cashback Offer - Saturday"
          />

          <ScheduleItem
            text="Affiliate Bonus Campaign - Sunday"
          />

        </div>

      </div>

      {/* ACTIONS */}

      <div className="mt-6 flex flex-wrap gap-4">

        <button
          className="flex items-center gap-2 rounded-2xl bg-pink-500 px-6 py-4 font-black text-[var(--text-color)]"
        >

          <Send size={20} />

          Launch Campaign

        </button>

        <button
          className="flex items-center gap-2 rounded-2xl bg-cyan-500 px-6 py-4 font-black text-[var(--text-color)]"
        >

          <Bell size={20} />

          Send Notifications

        </button>

        <button
          className="flex items-center gap-2 rounded-2xl bg-[var(--warning-color)] px-6 py-4 font-black text-[var(--text-color)]"
        >

          <Gift size={20} />

          Create Offer

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

function ToolCard({
  title,
  icon: Icon
}: any) {

  return (

    <div className="rounded-[26px] border border-white/10 bg-[#111111] p-5 transition-all duration-300 hover:scale-[1.03]">

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-500">

        <Icon
          size={24}
          className="text-[var(--text-color)]"
        />

      </div>

      <h3 className="mt-4 text-lg font-black">

        {title}

      </h3>

    </div>

  );
}

function InsightItem({
  title,
  value
}: {
  title: string;
  value: string;
}) {

  return (

    <div className="flex items-center justify-between rounded-2xl bg-black/30 p-4">

      <h3 className="font-bold">

        {title}

      </h3>

      <div className="rounded-full bg-pink-500 px-4 py-2 text-sm font-black text-[var(--text-color)]">

        {value}

      </div>

    </div>

  );
}

function ScheduleItem({
  text
}: {
  text: string;
}) {

  return (

    <div className="rounded-2xl bg-[var(--card-color)]/20 p-4 font-bold">

      {text}

    </div>

  );
}
