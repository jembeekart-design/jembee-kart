"use client";

export const dynamic = "force-dynamic";

import {
  Gift,
  Crown,
  Coins,
  Star,
  Trophy,
  Users,
  Wallet,
  Percent,
  Sparkles,
  TrendingUp,
  BadgeCheck,
  Zap
} from "lucide-react";

const rewards = [
  {
    name: "Silver Member",
    points: "1,000",
    benefit: "5% Cashback"
  },
  {
    name: "Gold Member",
    points: "5,000",
    benefit: "10% Cashback"
  },
  {
    name: "Diamond Member",
    points: "15,000",
    benefit: "20% Cashback"
  }
];

export default function LoyaltyProgramPage() {

  return (

    <main className="min-h-screen bg-[var(--primary-color)] p-4 text-[var(--button-text-color)]">

      {/* HEADER */}

      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        <div className="flex items-center gap-4">

          <div className="flex h-16 w-16 items-center justify-center rounded-[28px] bg-[var(--primary-color)]">

            <Gift
              size={30}
              className="text-[var(--text-color)]"
            />

          </div>

          <div>

            <h1 className="text-3xl font-black">
              Loyalty Program
            </h1>

            <p className="mt-1 text-sm text-[var(--muted-text-color)]">
              Rewards, cashback & customer loyalty system
            </p>

          </div>

        </div>

        <button className="rounded-2xl bg-[var(--primary-color)] px-5 py-3 font-bold text-[var(--text-color)]">

          Add New Reward

        </button>

      </div>

      {/* STATS */}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

        <StatCard
          title="Members"
          value="28K"
          icon={<Users size={22} />}
        />

        <StatCard
          title="Reward Points"
          value="8.2M"
          icon={<Coins size={22} />}
        />

        <StatCard
          title="Cashback Paid"
          value="₹4.8L"
          icon={<Wallet size={22} />}
        />

        <StatCard
          title="Active Rewards"
          value="42"
          icon={<Gift size={22} />}
        />

      </div>

      {/* MEMBERSHIP TIERS */}

      <div className="mt-8">

        <div className="mb-4 flex items-center gap-3">

          <Crown
            size={24}
            className="text-[var(--primary-color)]"
          />

          <h2 className="text-2xl font-black">
            Membership Levels
          </h2>

        </div>

        <div className="grid gap-5 md:grid-cols-3">

          {rewards.map(
            (
              item,
              index
            ) => (

              <div
                key={index}
                className="rounded-[30px] border border-[var(--border-color)]/10 bg-[var(--primary-color)] p-6"
              >

                <div className="flex items-center justify-between">

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary-color)] text-[var(--text-color)]">

                    <Trophy size={24} />

                  </div>

                  <BadgeCheck
                    size={24}
                    className="text-[var(--success-color)]"
                  />

                </div>

                <h3 className="mt-5 text-2xl font-black">
                  {item.name}
                </h3>

                <p className="mt-2 text-[var(--muted-text-color)]">
                  Required Points
                </p>

                <h4 className="mt-1 text-3xl font-black text-[var(--primary-color)]">
                  {item.points}
                </h4>

                <div className="mt-5 rounded-2xl bg-[var(--primary-color)]/10 p-4">

                  <p className="text-sm text-[var(--text-color)]">
                    Benefit
                  </p>

                  <h5 className="mt-2 text-lg font-bold">
                    {item.benefit}
                  </h5>

                </div>

              </div>

            )
          )}

        </div>

      </div>

      {/* REWARD ACTIONS */}

      <div className="mt-8 grid gap-5 md:grid-cols-2">

        <div className="rounded-[30px] border border-[var(--border-color)]/10 bg-[var(--primary-color)] p-6">

          <div className="flex items-center gap-3">

            <Sparkles
              size={24}
              className="text-[var(--primary-color)]"
            />

            <h2 className="text-2xl font-black">
              Reward Features
            </h2>

          </div>

          <div className="mt-5 space-y-4">

            <FeatureItem text="Referral reward points" />

            <FeatureItem text="Purchase cashback system" />

            <FeatureItem text="VIP customer rewards" />

            <FeatureItem text="Birthday gift rewards" />

            <FeatureItem text="Daily login bonus" />

          </div>

        </div>

        <div className="rounded-[30px] border border-[var(--border-color)]/10 bg-[var(--primary-color)] p-6">

          <div className="flex items-center gap-3">

            <TrendingUp
              size={24}
              className="text-[var(--success-color)]"
            />

            <h2 className="text-2xl font-black">
              Growth Statistics
            </h2>

          </div>

          <div className="mt-6 space-y-5">

            <ProgressItem
              title="Customer Retention"
              value="88%"
            />

            <ProgressItem
              title="Reward Usage"
              value="73%"
            />

            <ProgressItem
              title="Referral Growth"
              value="91%"
            />

          </div>

        </div>

      </div>

      {/* BONUS SECTION */}

      <div className="mt-8 rounded-[32px] bg-gradient-to-r from-[var(--primary-color)] to-[var(--primary-color)] p-7 text-[var(--text-color)]">

        <div className="flex items-center gap-3">

          <Zap size={30} />

          <h2 className="text-3xl font-black">
            Loyalty Boost Active
          </h2>

        </div>

        <p className="mt-4 max-w-2xl text-sm font-medium">

          Customers earn double reward points during
          flash sales & festival events.

        </p>

        <button className="mt-6 rounded-2xl bg-[var(--card-color)] px-5 py-3 font-bold text-[var(--button-text-color)]">

          Manage Campaign

        </button>

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

    <div className="rounded-[28px] border border-[var(--border-color)]/10 bg-[var(--primary-color)] p-5">

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary-color)] text-[var(--text-color)]">

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

    <div className="flex items-center gap-3 rounded-2xl bg-[var(--primary-color)] p-4">

      <Star
        size={18}
        className="text-[var(--primary-color)]"
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

        <p className="font-bold text-[var(--success-color)]">
          {value}
        </p>

      </div>

      <div className="h-3 overflow-hidden rounded-full bg-[var(--primary-color)]">

        <div
          className="h-full rounded-full bg-[var(--success-color)]"
          style={{
            width: value
          }}
        />

      </div>

    </div>

  );
}
