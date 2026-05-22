"use client";

export const dynamic = "force-dynamic";

import {
  UserCog,
  ShieldCheck,
  Users,
  Lock,
  Search,
  Filter,
  Eye,
  Ban,
  CheckCircle2,
  AlertTriangle,
  Crown,
  Activity,
  Settings
} from "lucide-react";

const subadmins = [

  {
    name: "Rahul Admin",
    role: "Order Manager",
    status: "Active"
  },

  {
    name: "Aman Support",
    role: "Customer Support",
    status: "Pending"
  },

  {
    name: "Sneha Finance",
    role: "Finance Manager",
    status: "Active"
  },

  {
    name: "Priya Moderator",
    role: "Content Moderator",
    status: "Blocked"
  }

];

export default function SubadminManagerPage() {

  return (

    <main className="min-h-screen bg-[#090909] p-4 text-white">

      {/* HEADER */}

      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        <div className="flex items-center gap-4">

          <div className="flex h-16 w-16 items-center justify-center rounded-[28px] bg-violet-500">

            <UserCog
              size={30}
              className="text-black"
            />

          </div>

          <div>

            <h1 className="text-3xl font-black">
              Subadmin Manager
            </h1>

            <p className="mt-1 text-sm text-gray-400">
              Manage admin roles, permissions & moderators
            </p>

          </div>

        </div>

        <button className="rounded-2xl bg-violet-500 px-5 py-3 font-bold text-black">

          Add Subadmin

        </button>

      </div>

      {/* STATS */}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

        <StatCard
          title="Total Subadmins"
          value="128"
          icon={<Users size={22} />}
        />

        <StatCard
          title="Active"
          value="112"
          icon={<ShieldCheck size={22} />}
        />

        <StatCard
          title="Roles"
          value="18"
          icon={<Crown size={22} />}
        />

        <StatCard
          title="Permissions"
          value="64"
          icon={<Lock size={22} />}
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
            placeholder="Search subadmins..."
            className="w-full bg-transparent outline-none placeholder:text-gray-500"
          />

        </div>

        <button className="flex items-center justify-center gap-2 rounded-[24px] bg-[#151515] px-5 py-3 font-bold">

          <Filter size={18} />

          Filter

        </button>

      </div>

      {/* SUBADMINS */}

      <div className="mt-8 space-y-4">

        {subadmins.map(
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

                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500 text-2xl font-black text-black">

                    {item.name.charAt(
                      0
                    )}

                  </div>

                  <div>

                    <h2 className="text-2xl font-black">
                      {item.name}
                    </h2>

                    <p className="mt-1 text-sm text-gray-400">
                      {item.role}
                    </p>

                  </div>

                </div>

                <div className="flex flex-wrap items-center gap-3">

                  <div
                    className={`rounded-full px-4 py-2 text-sm font-bold ${
                      item.status ===
                      "Active"
                        ? "bg-green-500/20 text-green-400"
                        : item.status ===
                          "Pending"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >

                    {item.status}

                  </div>

                  <button className="flex items-center gap-2 rounded-2xl bg-violet-500 px-4 py-3 font-bold text-black">

                    <Eye size={18} />

                    View

                  </button>

                  <button className="flex items-center gap-2 rounded-2xl bg-red-500 px-4 py-3 font-bold">

                    <Ban size={18} />

                    Block

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

            <Settings
              size={24}
              className="text-violet-400"
            />

            <h2 className="text-2xl font-black">
              Admin Features
            </h2>

          </div>

          <div className="mt-5 space-y-4">

            <FeatureItem text="Custom role permissions" />

            <FeatureItem text="Realtime activity logs" />

            <FeatureItem text="Secure admin authentication" />

            <FeatureItem text="Module access control" />

            <FeatureItem text="Admin analytics tracking" />

          </div>

        </div>

        <div className="rounded-[30px] border border-white/10 bg-[#151515] p-6">

          <div className="flex items-center gap-3">

            <Activity
              size={24}
              className="text-green-400"
            />

            <h2 className="text-2xl font-black">
              Admin Performance
            </h2>

          </div>

          <div className="mt-6 space-y-5">

            <ProgressItem
              title="Task Completion"
              value="88%"
            />

            <ProgressItem
              title="Response Rate"
              value="94%"
            />

            <ProgressItem
              title="Security Compliance"
              value="97%"
            />

          </div>

        </div>

      </div>

      {/* STATUS */}

      <div className="mt-8 rounded-[32px] bg-gradient-to-r from-violet-500 to-fuchsia-600 p-7 text-black">

        <div className="flex items-center gap-3">

          <CheckCircle2 size={30} />

          <h2 className="text-3xl font-black">
            Admin System Active
          </h2>

        </div>

        <p className="mt-4 max-w-2xl text-sm font-medium">

          Subadmin roles & permissions are securely
          managed with realtime monitoring system.

        </p>

        <button className="mt-6 rounded-2xl bg-black px-5 py-3 font-bold text-white">

          Manage Permissions

        </button>

      </div>

      {/* ALERT */}

      <div className="mt-8 rounded-[28px] border border-yellow-500/20 bg-yellow-500/10 p-5">

        <div className="flex items-start gap-4">

          <AlertTriangle
            size={24}
            className="text-yellow-400"
          />

          <div>

            <h3 className="text-xl font-black text-yellow-400">
              Pending Access Requests
            </h3>

            <p className="mt-2 text-sm text-gray-300">

              Some subadmins are waiting for role
              approval & permission verification.

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

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500 text-black">

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
        className="text-violet-400"
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
