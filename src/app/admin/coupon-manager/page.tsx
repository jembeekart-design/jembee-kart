"use client";

export const dynamic = "force-dynamic";

import {
  TicketPercent,
  Gift,
  Percent,
  Search,
  Filter,
  Plus,
  Calendar,
  Users,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Sparkles
} from "lucide-react";

const coupons = [

  {
    code: "WELCOME50",
    discount: "50%",
    users: "12K",
    status: "Active"
  },

  {
    code: "FESTIVE100",
    discount: "₹100 OFF",
    users: "8.4K",
    status: "Expired"
  },

  {
    code: "SUPER20",
    discount: "20%",
    users: "18K",
    status: "Active"
  },

  {
    code: "FLASH500",
    discount: "₹500 OFF",
    users: "2.1K",
    status: "Pending"
  }

];

export default function CouponManagerPage() {

  return (

    <main className="min-h-screen bg-[#090909] p-4 text-[var(--button-text-color)]">

      {/* HEADER */}

      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        <div className="flex items-center gap-4">

          <div className="flex h-16 w-16 items-center justify-center rounded-[28px] bg-pink-500">

            <TicketPercent
              size={30}
              className="text-[var(--text-color)]"
            />

          </div>

          <div>

            <h1 className="text-3xl font-black">
              Coupon Manager
            </h1>

            <p className="mt-1 text-sm text-[var(--muted-text-color)]">
              Create & manage discount coupons and offers
            </p>

          </div>

        </div>

        <button className="flex items-center gap-2 rounded-2xl bg-pink-500 px-5 py-3 font-bold text-[var(--text-color)]">

          <Plus size={18} />

          Create Coupon

        </button>

      </div>

      {/* STATS */}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

        <StatCard
          title="Active Coupons"
          value="128"
          icon={<Gift size={22} />}
        />

        <StatCard
          title="Coupon Usage"
          value="42K"
          icon={<Users size={22} />}
        />

        <StatCard
          title="Discount Given"
          value="₹18L"
          icon={<Percent size={22} />}
        />

        <StatCard
          title="Conversion"
          value="84%"
          icon={<TrendingUp size={22} />}
        />

      </div>

      {/* SEARCH */}

      <div className="mt-8 flex flex-col gap-4 md:flex-row">

        <div className="flex flex-1 items-center gap-3 rounded-[24px] border border-white/10 bg-[#151515] px-4 py-3">

          <Search
            size={20}
            className="text-[var(--muted-text-color)]"
          />

          <input
            type="text"
            placeholder="Search coupons..."
            className="w-full bg-transparent outline-none placeholder:text-[var(--muted-text-color)]"
          />

        </div>

        <button className="flex items-center justify-center gap-2 rounded-[24px] bg-[#151515] px-5 py-3 font-bold">

          <Filter size={18} />

          Filter

        </button>

      </div>

      {/* COUPON LIST */}

      <div className="mt-8 space-y-4">

        {coupons.map(
          (
            item,
            index
          ) => (

            <div
              key={index}
              className="rounded-[30px] border border-white/10 bg-[#151515] p-6"
            >

              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                <div className="flex items-center gap-4">

                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-pink-500 text-[var(--text-color)]">

                    <TicketPercent size={28} />

                  </div>

                  <div>

                    <h2 className="text-2xl font-black">
                      {item.code}
                    </h2>

                    <p className="mt-1 text-sm text-[var(--muted-text-color)]">
                      Discount:
                      {" "}
                      {item.discount}
                    </p>

                    <div className="mt-2 flex items-center gap-2 text-sm text-[var(--muted-text-color)]">

                      <Users size={15} />

                      {item.users}
                      {" "}
                      users used

                    </div>

                  </div>

                </div>

                <div className="flex flex-wrap items-center gap-3">

                  <div
                    className={`rounded-full px-4 py-2 text-sm font-bold ${
                      item.status ===
                      "Active"
                        ? "bg-[var(--success-color)]/20 text-green-400"
                        : item.status ===
                          "Pending"
                        ? "bg-[var(--warning-color)]/20 text-yellow-400"
                        : "bg-[var(--danger-color)]/20 text-red-400"
                    }`}
                  >

                    {item.status}

                  </div>

                  <button className="rounded-2xl bg-pink-500 px-4 py-3 font-bold text-[var(--text-color)]">

                    Edit Coupon

                  </button>

                </div>

              </div>

            </div>

          )
        )}

      </div>

      {/* FEATURES */}

      <div className="mt-8 grid gap-5 md:grid-cols-2">

        <div className="rounded-[30px] border border-white/10 bg-[#151515] p-6">

          <div className="flex items-center gap-3">

            <Sparkles
              size={24}
              className="text-pink-400"
            />

            <h2 className="text-2xl font-black">
              Coupon Features
            </h2>

          </div>

          <div className="mt-5 space-y-4">

            <FeatureItem text="Auto apply discount coupons" />

            <FeatureItem text="Referral reward coupons" />

            <FeatureItem text="Flash sale coupon support" />

            <FeatureItem text="Usage limit control" />

            <FeatureItem text="Realtime coupon analytics" />

          </div>

        </div>

        <div className="rounded-[30px] border border-white/10 bg-[#151515] p-6">

          <div className="flex items-center gap-3">

            <Calendar
              size={24}
              className="text-cyan-400"
            />

            <h2 className="text-2xl font-black">
              Coupon Performance
            </h2>

          </div>

          <div className="mt-6 space-y-5">

            <ProgressItem
              title="Coupon Usage"
              value="84%"
            />

            <ProgressItem
              title="Customer Savings"
              value="91%"
            />

            <ProgressItem
              title="Sales Boost"
              value="88%"
            />

          </div>

        </div>

      </div>

      {/* STATUS */}

      <div className="mt-8 rounded-[32px] bg-gradient-to-r from-pink-500 to-fuchsia-600 p-7 text-[var(--text-color)]">

        <div className="flex items-center gap-3">

          <CheckCircle2 size={30} />

          <h2 className="text-3xl font-black">
            Coupon Engine Active
          </h2>

        </div>

        <p className="mt-4 max-w-2xl text-sm font-medium">

          Smart coupon distribution & discount engine
          is running smoothly with realtime tracking.

        </p>

        <button className="mt-6 rounded-2xl bg-[var(--card-color)] px-5 py-3 font-bold text-[var(--button-text-color)]">

          Open Coupon Center

        </button>

      </div>

      {/* ALERT */}

      <div className="mt-8 rounded-[28px] border border-yellow-500/20 bg-[var(--warning-color)]/10 p-5">

        <div className="flex items-start gap-4">

          <AlertTriangle
            size={24}
            className="text-yellow-400"
          />

          <div>

            <h3 className="text-xl font-black text-yellow-400">
              Expiring Coupons Alert
            </h3>

            <p className="mt-2 text-sm text-gray-300">

              Some coupons are expiring soon.
              Renew or disable expired campaigns.

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

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-500 text-[var(--text-color)]">

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

      <Gift
        size={18}
        className="text-pink-400"
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
