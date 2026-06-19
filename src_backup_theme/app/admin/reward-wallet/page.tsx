"use client";

export const dynamic = "force-dynamic";

import {
  Wallet,
  Coins,
  Gift,
  TrendingUp,
  ArrowDownCircle,
  ArrowUpCircle,
  BadgeDollarSign,
  Sparkles,
  Users,
  Trophy,
  Percent,
  CreditCard
} from "lucide-react";

const transactions = [

  {
    type: "Reward Added",
    amount: "+500",
    user: "Rahul Kumar"
  },

  {
    type: "Cashback Earned",
    amount: "+250",
    user: "Aman Ali"
  },

  {
    type: "Redeemed",
    amount: "-1000",
    user: "Priya Singh"
  },

  {
    type: "Referral Bonus",
    amount: "+700",
    user: "Sahil Khan"
  }

];

export default function RewardWalletPage() {

  return (

    <main className="min-h-screen bg-[#090909] p-4 text-white">

      {/* HEADER */}

      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        <div className="flex items-center gap-4">

          <div className="flex h-16 w-16 items-center justify-center rounded-[28px] bg-yellow-400">

            <Wallet
              size={30}
              className="text-black"
            />

          </div>

          <div>

            <h1 className="text-3xl font-black">
              Reward Wallet
            </h1>

            <p className="mt-1 text-sm text-gray-400">
              Cashback, reward points & bonus wallet management
            </p>

          </div>

        </div>

        <button className="rounded-2xl bg-yellow-400 px-5 py-3 font-bold text-black">

          Add Bonus Reward

        </button>

      </div>

      {/* STATS */}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

        <StatCard
          title="Total Rewards"
          value="₹8.2L"
          icon={<Coins size={22} />}
        />

        <StatCard
          title="Reward Users"
          value="32K"
          icon={<Users size={22} />}
        />

        <StatCard
          title="Redeemed"
          value="₹4.7L"
          icon={<Gift size={22} />}
        />

        <StatCard
          title="Cashback"
          value="₹2.3L"
          icon={<BadgeDollarSign size={22} />}
        />

      </div>

      {/* WALLET SECTION */}

      <div className="mt-8 grid gap-5 lg:grid-cols-3">

        <div className="rounded-[30px] border border-white/10 bg-[#151515] p-6 lg:col-span-2">

          <div className="flex items-center gap-3">

            <CreditCard
              size={24}
              className="text-yellow-400"
            />

            <h2 className="text-2xl font-black">
              Reward Transactions
            </h2>

          </div>

          <div className="mt-6 space-y-4">

            {transactions.map(
              (
                item,
                index
              ) => (

                <div
                  key={index}
                  className="flex items-center justify-between rounded-2xl bg-[#0f0f0f] p-4"
                >

                  <div className="flex items-center gap-4">

                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-400 text-black">

                      {item.amount.includes("+") ? (

                        <ArrowDownCircle size={24} />

                      ) : (

                        <ArrowUpCircle size={24} />

                      )}

                    </div>

                    <div>

                      <h3 className="text-lg font-bold">
                        {item.type}
                      </h3>

                      <p className="text-sm text-gray-400">
                        {item.user}
                      </p>

                    </div>

                  </div>

                  <h4
                    className={`text-2xl font-black ${
                      item.amount.includes("+")
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >

                    {item.amount}

                  </h4>

                </div>

              )
            )}

          </div>

        </div>

        <div className="space-y-5">

          <div className="rounded-[30px] border border-white/10 bg-[#151515] p-6">

            <div className="flex items-center gap-3">

              <Sparkles
                size={24}
                className="text-yellow-400"
              />

              <h2 className="text-xl font-black">
                Reward Features
              </h2>

            </div>

            <div className="mt-5 space-y-4">

              <Feature text="Cashback Rewards" />

              <Feature text="Referral Bonus" />

              <Feature text="VIP Reward Points" />

              <Feature text="Daily Reward Claim" />

              <Feature text="Festival Bonus" />

            </div>

          </div>

          <div className="rounded-[30px] bg-gradient-to-r from-yellow-400 to-orange-500 p-6 text-black">

            <div className="flex items-center gap-3">

              <Trophy size={28} />

              <h2 className="text-2xl font-black">
                Reward Booster
              </h2>

            </div>

            <p className="mt-4 text-sm font-semibold">

              Double cashback active for premium users.

            </p>

            <button className="mt-5 rounded-2xl bg-black px-5 py-3 font-bold text-white">

              Manage Booster

            </button>

          </div>

        </div>

      </div>

      {/* PERFORMANCE */}

      <div className="mt-8 rounded-[30px] border border-white/10 bg-[#151515] p-6">

        <div className="flex items-center gap-3">

          <TrendingUp
            size={24}
            className="text-green-400"
          />

          <h2 className="text-2xl font-black">
            Reward Performance
          </h2>

        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-3">

          <ProgressCard
            title="Reward Usage"
            value="87%"
          />

          <ProgressCard
            title="Referral Growth"
            value="76%"
          />

          <ProgressCard
            title="Customer Retention"
            value="92%"
          />

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

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-400 text-black">

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

function Feature({
  text
}: {
  text: string;
}) {

  return (

    <div className="flex items-center gap-3 rounded-2xl bg-[#0f0f0f] p-4">

      <Percent
        size={18}
        className="text-yellow-400"
      />

      <p className="font-medium">
        {text}
      </p>

    </div>

  );
}

function ProgressCard({
  title,
  value
}: {
  title: string;
  value: string;
}) {

  return (

    <div className="rounded-2xl bg-[#0f0f0f] p-5">

      <div className="mb-3 flex items-center justify-between">

        <h3 className="font-bold">
          {title}
        </h3>

        <span className="font-black text-green-400">
          {value}
        </span>

      </div>

      <div className="h-3 overflow-hidden rounded-full bg-[#1f1f1f]">

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
