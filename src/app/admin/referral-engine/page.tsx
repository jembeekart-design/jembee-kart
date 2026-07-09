"use client";

export const dynamic = "force-dynamic";

import {
  Users,
  Share2,
  Gift,
  TrendingUp,
  Wallet,
  Coins,
  BadgePercent,
  Sparkles,
  Trophy,
  Crown,
  ArrowUpRight,
  CheckCircle2
} from "lucide-react";

const referrals = [

  {
    user: "Rahul Sharma",
    referrals: 24,
    earnings: "₹4,200"
  },

  {
    user: "Aman Khan",
    referrals: 18,
    earnings: "₹2,850"
  },

  {
    user: "Priya Kumari",
    referrals: 42,
    earnings: "₹8,900"
  },

  {
    user: "Sneha Singh",
    referrals: 15,
    earnings: "₹1,950"
  }

];

export default function ReferralEnginePage() {

  return (

    <main className="min-h-screen bg-[#090909] p-4 text-[var(--button-text-color)]">

      {/* HEADER */}

      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        <div className="flex items-center gap-4">

          <div className="flex h-16 w-16 items-center justify-center rounded-[28px] bg-cyan-500">

            <Share2
              size={30}
              className="text-[var(--text-color)]"
            />

          </div>

          <div>

            <h1 className="text-3xl font-black">
              Referral Engine
            </h1>

            <p className="mt-1 text-sm text-[var(--muted-text-color)]">
              Multi-level referral & affiliate reward system
            </p>

          </div>

        </div>

        <button className="rounded-2xl bg-cyan-500 px-5 py-3 font-bold text-[var(--text-color)]">

          Create Referral Campaign

        </button>

      </div>

      {/* STATS */}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

        <StatCard
          title="Referral Users"
          value="42K"
          icon={<Users size={22} />}
        />

        <StatCard
          title="Total Earnings"
          value="₹18.4L"
          icon={<Wallet size={22} />}
        />

        <StatCard
          title="Referral Orders"
          value="12K"
          icon={<Gift size={22} />}
        />

        <StatCard
          title="Commission Rate"
          value="15%"
          icon={<BadgePercent size={22} />}
        />

      </div>

      {/* REFERRAL LEADERBOARD */}

      <div className="mt-8 rounded-[30px] border border-white/10 bg-[#151515] p-6">

        <div className="flex items-center gap-3">

          <Trophy
            size={26}
            className="text-yellow-400"
          />

          <h2 className="text-2xl font-black">
            Top Referral Leaders
          </h2>

        </div>

        <div className="mt-6 space-y-4">

          {referrals.map(
            (
              item,
              index
            ) => (

              <div
                key={index}
                className="flex flex-col gap-5 rounded-2xl bg-[#0f0f0f] p-5 lg:flex-row lg:items-center lg:justify-between"
              >

                <div className="flex items-center gap-4">

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500 text-[var(--text-color)] font-black">

                    {index + 1}

                  </div>

                  <div>

                    <h3 className="text-xl font-black">
                      {item.user}
                    </h3>

                    <p className="mt-1 text-sm text-[var(--muted-text-color)]">

                      {item.referrals}
                      {" "}
                      referrals completed

                    </p>

                  </div>

                </div>

                <div className="flex items-center gap-4">

                  <div className="rounded-2xl bg-cyan-500/10 px-5 py-3">

                    <p className="text-sm text-[var(--muted-text-color)]">
                      Earnings
                    </p>

                    <h4 className="text-xl font-black text-cyan-400">

                      {item.earnings}

                    </h4>

                  </div>

                  <button className="flex items-center gap-2 rounded-2xl bg-cyan-500 px-4 py-3 font-bold text-[var(--text-color)]">

                    <ArrowUpRight size={18} />

                    View

                  </button>

                </div>

              </div>

            )
          )}

        </div>

      </div>

      {/* FEATURES */}

      <div className="mt-8 grid gap-5 md:grid-cols-2">

        <div className="rounded-[30px] border border-white/10 bg-[#151515] p-6">

          <div className="flex items-center gap-3">

            <Sparkles
              size={24}
              className="text-cyan-400"
            />

            <h2 className="text-2xl font-black">
              Referral Features
            </h2>

          </div>

          <div className="mt-5 space-y-4">

            <FeatureItem text="Multi-level commission system" />

            <FeatureItem text="Referral cashback rewards" />

            <FeatureItem text="Invite bonus tracking" />

            <FeatureItem text="Affiliate payout automation" />

            <FeatureItem text="Realtime referral analytics" />

          </div>

        </div>

        <div className="rounded-[30px] border border-white/10 bg-[#151515] p-6">

          <div className="flex items-center gap-3">

            <TrendingUp
              size={24}
              className="text-green-400"
            />

            <h2 className="text-2xl font-black">
              Growth Metrics
            </h2>

          </div>

          <div className="mt-6 space-y-5">

            <ProgressItem
              title="Referral Conversion"
              value="82%"
            />

            <ProgressItem
              title="Affiliate Growth"
              value="91%"
            />

            <ProgressItem
              title="Reward Usage"
              value="76%"
            />

          </div>

        </div>

      </div>

      {/* BONUS */}

      <div className="mt-8 rounded-[32px] bg-gradient-to-r from-cyan-500 to-blue-600 p-7 text-[var(--text-color)]">

        <div className="flex items-center gap-3">

          <Crown size={30} />

          <h2 className="text-3xl font-black">
            Referral Bonus Campaign
          </h2>

        </div>

        <p className="mt-4 max-w-2xl text-sm font-medium">

          Double commission rewards are active for
          top affiliate partners this week.

        </p>

        <button className="mt-6 rounded-2xl bg-[var(--card-color)] px-5 py-3 font-bold text-[var(--button-text-color)]">

          Manage Campaign

        </button>

      </div>

      {/* STATUS */}

      <div className="mt-8 rounded-[28px] border border-green-500/20 bg-[var(--success-color)]/10 p-5">

        <div className="flex items-start gap-4">

          <CheckCircle2
            size={24}
            className="text-green-400"
          />

          <div>

            <h3 className="text-xl font-black text-green-400">
              Referral System Active
            </h3>

            <p className="mt-2 text-sm text-gray-300">

              Multi-level commission tracking &
              payout system is running successfully.

            </p>

          </div>

        </div>

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

function FeatureItem({
  text
}: {
  text: string;
}) {

  return (

    <div className="flex items-center gap-3 rounded-2xl bg-[#0f0f0f] p-4">

      <Coins
        size={18}
        className="text-cyan-400"
      />

      <p className="font-medium">
        {text}
      </p>

    </div>

  );
}

function ProgressItem({
  title,
  value
}: {
  title: string;
  value: string;
}) {

  return (

    <div>

      <div className="mb-2 flex items-center justify-between">

        <p className="font-medium">
          {title}
        </p>

        <p className="font-bold text-green-400">
          {value}
        </p>

      </div>

      <div className="h-3 overflow-hidden rounded-full bg-[#0f0f0f]">

        <div
          className="h-full rounded-full bg-green-400"
          style={{
            width: value
          }}
        />

      </div>

    </div>

  );
}
