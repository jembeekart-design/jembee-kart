"use client";

export const dynamic = "force-dynamic";

import {
  CreditCard,
  Wallet,
  Landmark,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Activity,
  Search,
  RefreshCw,
  BadgeDollarSign
} from "lucide-react";

const gateways = [

  {
    name: "Cashfree",
    method: "UPI / Cards",
    status: "Active"
  },

  {
    name: "Razorpay",
    method: "UPI / Wallet",
    status: "Active"
  },

  {
    name: "Stripe",
    method: "International",
    status: "Pending"
  },

  {
    name: "PayPal",
    method: "Global Payments",
    status: "Disabled"
  }

];

export default function PaymentGatewayPage() {

  return (

    <main className="min-h-screen bg-[#090909] p-4 text-[var(--button-text-color)]">

      {/* HEADER */}

      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        <div className="flex items-center gap-4">

          <div className="flex h-16 w-16 items-center justify-center rounded-[28px] bg-sky-500">

            <CreditCard
              size={30}
              className="text-[var(--text-color)]"
            />

          </div>

          <div>

            <h1 className="text-3xl font-black">
              Payment Gateway
            </h1>

            <p className="mt-1 text-sm text-gray-400">
              Manage payment systems & transaction gateways
            </p>

          </div>

        </div>

        <button className="flex items-center gap-2 rounded-2xl bg-sky-500 px-5 py-3 font-bold text-[var(--text-color)]">

          <RefreshCw size={18} />

          Sync Gateways

        </button>

      </div>

      {/* STATS */}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

        <StatCard
          title="Transactions"
          value="82K"
          icon={<Activity size={22} />}
        />

        <StatCard
          title="Revenue"
          value="₹1.8Cr"
          icon={<BadgeDollarSign size={22} />}
        />

        <StatCard
          title="Gateways"
          value="12"
          icon={<Wallet size={22} />}
        />

        <StatCard
          title="Success Rate"
          value="98%"
          icon={<TrendingUp size={22} />}
        />

      </div>

      {/* SEARCH */}

      <div className="mt-8 flex items-center gap-3 rounded-[24px] border border-white/10 bg-[#151515] px-4 py-3">

        <Search
          size={20}
          className="text-gray-400"
        />

        <input
          type="text"
          placeholder="Search gateway..."
          className="w-full bg-transparent outline-none placeholder:text-[var(--muted-text-color)]"
        />

      </div>

      {/* GATEWAY LIST */}

      <div className="mt-8 space-y-4">

        {gateways.map(
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

                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-500 text-[var(--text-color)]">

                    {item.name ===
                    "Cashfree" ? (

                      <Smartphone size={28} />

                    ) : item.name ===
                      "Razorpay" ? (

                      <Wallet size={28} />

                    ) : item.name ===
                      "Stripe" ? (

                      <Landmark size={28} />

                    ) : (

                      <CreditCard size={28} />

                    )}

                  </div>

                  <div>

                    <h2 className="text-2xl font-black">
                      {item.name}
                    </h2>

                    <p className="mt-1 text-sm text-gray-400">
                      {item.method}
                    </p>

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

                  <button className="rounded-2xl bg-sky-500 px-4 py-3 font-bold text-[var(--text-color)]">

                    Configure

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

            <ShieldCheck
              size={24}
              className="text-sky-400"
            />

            <h2 className="text-2xl font-black">
              Payment Features
            </h2>

          </div>

          <div className="mt-5 space-y-4">

            <FeatureItem text="UPI & QR Payments" />

            <FeatureItem text="Realtime Transaction Tracking" />

            <FeatureItem text="Instant Refund System" />

            <FeatureItem text="Fraud Protection Layer" />

            <FeatureItem text="Secure Payment Encryption" />

          </div>

        </div>

        <div className="rounded-[30px] border border-white/10 bg-[#151515] p-6">

          <div className="flex items-center gap-3">

            <TrendingUp
              size={24}
              className="text-green-400"
            />

            <h2 className="text-2xl font-black">
              Payment Analytics
            </h2>

          </div>

          <div className="mt-6 space-y-5">

            <ProgressItem
              title="Success Transactions"
              value="98%"
            />

            <ProgressItem
              title="Refund Processing"
              value="91%"
            />

            <ProgressItem
              title="Gateway Stability"
              value="95%"
            />

          </div>

        </div>

      </div>

      {/* STATUS */}

      <div className="mt-8 rounded-[32px] bg-gradient-to-r from-sky-500 to-cyan-500 p-7 text-[var(--text-color)]">

        <div className="flex items-center gap-3">

          <CheckCircle2 size={30} />

          <h2 className="text-3xl font-black">
            Payment System Active
          </h2>

        </div>

        <p className="mt-4 max-w-2xl text-sm font-medium">

          All payment gateways are securely connected
          with realtime transaction monitoring.

        </p>

        <button className="mt-6 rounded-2xl bg-black px-5 py-3 font-bold text-[var(--button-text-color)]">

          Open Payment Center

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
              Gateway Verification Pending
            </h3>

            <p className="mt-2 text-sm text-gray-300">

              Stripe international gateway requires
              additional KYC verification.

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

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500 text-[var(--text-color)]">

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

function FeatureItem({
  text
}: {
  text: string;
}) {

  return (

    <div className="flex items-center gap-3 rounded-2xl bg-[#0f0f0f] p-4">

      <ShieldCheck
        size={18}
        className="text-sky-400"
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
