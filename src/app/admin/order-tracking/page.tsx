"use client";

export const dynamic = "force-dynamic";

import {
  Truck,
  Package,
  MapPin,
  Clock3,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Activity,
  User,
  ShoppingBag,
  RefreshCw
} from "lucide-react";

const orders = [

  {
    id: "#ORD1024",
    customer: "Rahul Sharma",
    location: "Delhi",
    status: "Delivered"
  },

  {
    id: "#ORD1025",
    customer: "Sneha Singh",
    location: "Mumbai",
    status: "Shipped"
  },

  {
    id: "#ORD1026",
    customer: "Aman Khan",
    location: "Kolkata",
    status: "Pending"
  },

  {
    id: "#ORD1027",
    customer: "Priya Kumari",
    location: "Patna",
    status: "Cancelled"
  }

];

export default function OrderTrackingPage() {

  return (

    <main className="min-h-screen bg-[#090909] p-4 text-[var(--button-text-color)]">

      {/* HEADER */}

      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        <div className="flex items-center gap-4">

          <div className="flex h-16 w-16 items-center justify-center rounded-[28px] bg-orange-500">

            <Truck
              size={30}
              className="text-[var(--text-color)]"
            />

          </div>

          <div>

            <h1 className="text-3xl font-black">
              Order Tracking
            </h1>

            <p className="mt-1 text-sm text-gray-400">
              Realtime order delivery & shipment monitoring
            </p>

          </div>

        </div>

        <button className="flex items-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 font-bold text-[var(--text-color)]">

          <RefreshCw size={18} />

          Refresh Orders

        </button>

      </div>

      {/* STATS */}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

        <StatCard
          title="Total Orders"
          value="28K"
          icon={<ShoppingBag size={22} />}
        />

        <StatCard
          title="Delivered"
          value="21K"
          icon={<CheckCircle2 size={22} />}
        />

        <StatCard
          title="Shipped"
          value="4.2K"
          icon={<Truck size={22} />}
        />

        <StatCard
          title="Pending"
          value="2.8K"
          icon={<Clock3 size={22} />}
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
            placeholder="Search orders..."
            className="w-full bg-transparent outline-none placeholder:text-[var(--muted-text-color)]"
          />

        </div>

        <button className="flex items-center justify-center gap-2 rounded-[24px] bg-[#151515] px-5 py-3 font-bold">

          <Filter size={18} />

          Filter

        </button>

      </div>

      {/* ORDER LIST */}

      <div className="mt-8 space-y-4">

        {orders.map(
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

                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500 text-[var(--text-color)]">

                    <Package size={28} />

                  </div>

                  <div>

                    <h2 className="text-2xl font-black">
                      {item.id}
                    </h2>

                    <div className="mt-2 flex items-center gap-2 text-sm text-gray-400">

                      <User size={15} />

                      {item.customer}

                    </div>

                    <div className="mt-1 flex items-center gap-2 text-sm text-gray-400">

                      <MapPin size={15} />

                      {item.location}

                    </div>

                  </div>

                </div>

                <div className="flex flex-wrap items-center gap-3">

                  <div
                    className={`rounded-full px-4 py-2 text-sm font-bold ${
                      item.status ===
                      "Delivered"
                        ? "bg-[var(--success-color)]/20 text-green-400"
                        : item.status ===
                          "Shipped"
                        ? "bg-cyan-500/20 text-cyan-400"
                        : item.status ===
                          "Pending"
                        ? "bg-[var(--warning-color)]/20 text-yellow-400"
                        : "bg-[var(--danger-color)]/20 text-red-400"
                    }`}
                  >

                    {item.status}

                  </div>

                  <button className="rounded-2xl bg-orange-500 px-4 py-3 font-bold text-[var(--text-color)]">

                    Track Order

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

            <Activity
              size={24}
              className="text-green-400"
            />

            <h2 className="text-2xl font-black">
              Delivery Performance
            </h2>

          </div>

          <div className="mt-6 space-y-5">

            <ProgressItem
              title="On-Time Delivery"
              value="94%"
            />

            <ProgressItem
              title="Shipping Accuracy"
              value="97%"
            />

            <ProgressItem
              title="Customer Satisfaction"
              value="91%"
            />

          </div>

        </div>

        <div className="rounded-[30px] border border-white/10 bg-[#151515] p-6">

          <div className="flex items-center gap-3">

            <Truck
              size={24}
              className="text-orange-400"
            />

            <h2 className="text-2xl font-black">
              Tracking Features
            </h2>

          </div>

          <div className="mt-5 space-y-4">

            <FeatureItem text="Realtime GPS Tracking" />

            <FeatureItem text="Instant Delivery Alerts" />

            <FeatureItem text="Courier Integration" />

            <FeatureItem text="Delivery Verification" />

            <FeatureItem text="Shipment Analytics" />

          </div>

        </div>

      </div>

      {/* STATUS */}

      <div className="mt-8 rounded-[32px] bg-gradient-to-r from-orange-500 to-yellow-500 p-7 text-[var(--text-color)]">

        <div className="flex items-center gap-3">

          <CheckCircle2 size={30} />

          <h2 className="text-3xl font-black">
            Tracking System Active
          </h2>

        </div>

        <p className="mt-4 max-w-2xl text-sm font-medium">

          Realtime shipment & delivery tracking system
          is working smoothly across all regions.

        </p>

        <button className="mt-6 rounded-2xl bg-black px-5 py-3 font-bold text-[var(--button-text-color)]">

          Open Delivery Center

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
              Delivery Delay Warning
            </h3>

            <p className="mt-2 text-sm text-gray-300">

              Some shipments may be delayed due to
              weather & logistics issues.

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

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500 text-[var(--text-color)]">

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

      <Truck
        size={18}
        className="text-orange-400"
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
