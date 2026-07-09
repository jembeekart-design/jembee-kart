"use client";

export const dynamic = "force-dynamic";

import {
  Store,
  Users,
  BadgeCheck,
  Wallet,
  TrendingUp,
  ShoppingBag,
  ShieldCheck,
  Search,
  Filter,
  Eye,
  Ban,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";

const vendors = [

  {
    name: "Fashion Hub",
    owner: "Rahul Kumar",
    sales: "₹4.2L",
    status: "Verified"
  },

  {
    name: "Tech World",
    owner: "Aman Ali",
    sales: "₹8.9L",
    status: "Pending"
  },

  {
    name: "Beauty Store",
    owner: "Sneha Singh",
    sales: "₹2.7L",
    status: "Verified"
  },

  {
    name: "Mobile Planet",
    owner: "Priya Kumari",
    sales: "₹6.1L",
    status: "Blocked"
  }

];

export default function VendorManagerPage() {

  return (

    <main className="min-h-screen bg-[#090909] p-4 text-[var(--button-text-color)]">

      {/* HEADER */}

      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        <div className="flex items-center gap-4">

          <div className="flex h-16 w-16 items-center justify-center rounded-[28px] bg-emerald-500">

            <Store
              size={30}
              className="text-[var(--text-color)]"
            />

          </div>

          <div>

            <h1 className="text-3xl font-black">
              Vendor Manager
            </h1>

            <p className="mt-1 text-sm text-gray-400">
              Manage sellers, vendors & marketplace stores
            </p>

          </div>

        </div>

        <button className="rounded-2xl bg-emerald-500 px-5 py-3 font-bold text-[var(--text-color)]">

          Add Vendor

        </button>

      </div>

      {/* STATS */}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

        <StatCard
          title="Total Vendors"
          value="4.2K"
          icon={<Users size={22} />}
        />

        <StatCard
          title="Verified"
          value="3.8K"
          icon={<BadgeCheck size={22} />}
        />

        <StatCard
          title="Vendor Sales"
          value="₹48L"
          icon={<Wallet size={22} />}
        />

        <StatCard
          title="Products"
          value="82K"
          icon={<ShoppingBag size={22} />}
        />

      </div>

      {/* SEARCH */}

      <div className="mt-8 flex flex-col gap-4 md:flex-row">

        <div className="flex flex-1 items-center gap-3 rounded-[24px] border border-white/10 bg-[#151515] px-4 py-3">

          <Search
            size={20}
            className="text-gray-400"
          />

          <input
            type="text"
            placeholder="Search vendors..."
            className="w-full bg-transparent outline-none placeholder:text-[var(--muted-text-color)]"
          />

        </div>

        <button className="flex items-center justify-center gap-2 rounded-[24px] bg-[#151515] px-5 py-3 font-bold">

          <Filter size={18} />

          Filter

        </button>

      </div>

      {/* VENDOR LIST */}

      <div className="mt-8 space-y-4">

        {vendors.map(
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

                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500 text-2xl font-black text-[var(--text-color)]">

                    {item.name.charAt(
                      0
                    )}

                  </div>

                  <div>

                    <h2 className="text-2xl font-black">
                      {item.name}
                    </h2>

                    <p className="mt-1 text-sm text-gray-400">
                      Owner:
                      {" "}
                      {item.owner}
                    </p>

                    <h3 className="mt-2 text-lg font-bold text-emerald-400">

                      {item.sales}

                    </h3>

                  </div>

                </div>

                <div className="flex flex-wrap items-center gap-3">

                  <div
                    className={`rounded-full px-4 py-2 text-sm font-bold ${
                      item.status ===
                      "Verified"
                        ? "bg-[var(--success-color)]/20 text-green-400"
                        : item.status ===
                          "Pending"
                        ? "bg-[var(--warning-color)]/20 text-yellow-400"
                        : "bg-[var(--danger-color)]/20 text-red-400"
                    }`}
                  >

                    {item.status}

                  </div>

                  <button className="flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 font-bold text-[var(--text-color)]">

                    <Eye size={18} />

                    View

                  </button>

                  <button className="flex items-center gap-2 rounded-2xl bg-[var(--danger-color)] px-4 py-3 font-bold">

                    <Ban size={18} />

                    Block

                  </button>

                </div>

              </div>

            </div>

          )
        )}

      </div>

      {/* ANALYTICS */}

      <div className="mt-8 grid gap-5 md:grid-cols-2">

        <div className="rounded-[30px] border border-white/10 bg-[#151515] p-6">

          <div className="flex items-center gap-3">

            <TrendingUp
              size={24}
              className="text-green-400"
            />

            <h2 className="text-2xl font-black">
              Vendor Growth
            </h2>

          </div>

          <div className="mt-6 space-y-5">

            <ProgressItem
              title="Monthly Growth"
              value="78%"
            />

            <ProgressItem
              title="Sales Increase"
              value="92%"
            />

            <ProgressItem
              title="Active Stores"
              value="84%"
            />

          </div>

        </div>

        <div className="rounded-[30px] border border-white/10 bg-[#151515] p-6">

          <div className="flex items-center gap-3">

            <ShieldCheck
              size={24}
              className="text-cyan-400"
            />

            <h2 className="text-2xl font-black">
              Verification Features
            </h2>

          </div>

          <div className="mt-5 space-y-4">

            <FeatureItem text="Vendor KYC Verification" />

            <FeatureItem text="Realtime Fraud Detection" />

            <FeatureItem text="Secure Seller Payments" />

            <FeatureItem text="Automated Commission System" />

            <FeatureItem text="Performance Tracking" />

          </div>

        </div>

      </div>

      {/* STATUS */}

      <div className="mt-8 rounded-[32px] bg-gradient-to-r from-emerald-500 to-green-600 p-7 text-[var(--text-color)]">

        <div className="flex items-center gap-3">

          <CheckCircle2 size={30} />

          <h2 className="text-3xl font-black">
            Marketplace Active
          </h2>

        </div>

        <p className="mt-4 max-w-2xl text-sm font-medium">

          Vendor marketplace system is operating smoothly
          with realtime analytics & seller management.

        </p>

        <button className="mt-6 rounded-2xl bg-black px-5 py-3 font-bold text-[var(--button-text-color)]">

          Manage Marketplace

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
              Pending Vendor Approvals
            </h3>

            <p className="mt-2 text-sm text-gray-300">

              Some vendors are waiting for KYC review
              & approval verification.

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

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-[var(--text-color)]">

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

      <BadgeCheck
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
