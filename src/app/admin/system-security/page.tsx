"use client";

export const dynamic = "force-dynamic";

import {
  Shield,
  Lock,
  KeyRound,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Users,
  Globe,
  Fingerprint,
  ShieldCheck,
  Bell,
  Ban,
  Search,
  RefreshCw
} from "lucide-react";

const securityLogs = [

  {
    event: "Admin Login",
    user: "Rahul Admin",
    status: "Success"
  },

  {
    event: "Failed Login Attempt",
    user: "Unknown Device",
    status: "Blocked"
  },

  {
    event: "Password Changed",
    user: "Sneha Finance",
    status: "Success"
  },

  {
    event: "Unauthorized Access",
    user: "External IP",
    status: "Warning"
  }

];

export default function SystemSecurityPage() {

  return (

    <main className="min-h-screen bg-[#090909] p-4 text-[var(--button-text-color)]">

      {/* HEADER */}

      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        <div className="flex items-center gap-4">

          <div className="flex h-16 w-16 items-center justify-center rounded-[28px] bg-[var(--danger-color)]">

            <Shield
              size={30}
              className="text-[var(--text-color)]"
            />

          </div>

          <div>

            <h1 className="text-3xl font-black">
              System Security
            </h1>

            <p className="mt-1 text-sm text-gray-400">
              Security protection, firewall & access monitoring
            </p>

          </div>

        </div>

        <button className="flex items-center gap-2 rounded-2xl bg-[var(--danger-color)] px-5 py-3 font-bold text-[var(--text-color)]">

          <RefreshCw size={18} />

          Run Security Scan

        </button>

      </div>

      {/* STATS */}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

        <StatCard
          title="Threats Blocked"
          value="2.4K"
          icon={<Ban size={22} />}
        />

        <StatCard
          title="Secure Logins"
          value="18K"
          icon={<Lock size={22} />}
        />

        <StatCard
          title="Firewall"
          value="Active"
          icon={<ShieldCheck size={22} />}
        />

        <StatCard
          title="Alerts"
          value="12"
          icon={<Bell size={22} />}
        />

      </div>

      {/* SECURITY FEATURES */}

      <div className="mt-8 grid gap-5 md:grid-cols-2">

        <div className="rounded-[30px] border border-white/10 bg-[#151515] p-6">

          <div className="flex items-center gap-3">

            <KeyRound
              size={24}
              className="text-red-400"
            />

            <h2 className="text-2xl font-black">
              Protection Features
            </h2>

          </div>

          <div className="mt-5 space-y-4">

            <FeatureItem text="2FA Authentication" />

            <FeatureItem text="Realtime Firewall Protection" />

            <FeatureItem text="Biometric Verification" />

            <FeatureItem text="Encrypted Database Security" />

            <FeatureItem text="Admin Access Monitoring" />

          </div>

        </div>

        <div className="rounded-[30px] border border-white/10 bg-[#151515] p-6">

          <div className="flex items-center gap-3">

            <Activity
              size={24}
              className="text-green-400"
            />

            <h2 className="text-2xl font-black">
              Security Performance
            </h2>

          </div>

          <div className="mt-6 space-y-5">

            <ProgressItem
              title="Firewall Strength"
              value="96%"
            />

            <ProgressItem
              title="Threat Detection"
              value="92%"
            />

            <ProgressItem
              title="Access Security"
              value="98%"
            />

          </div>

        </div>

      </div>

      {/* SECURITY LOGS */}

      <div className="mt-8 rounded-[30px] border border-white/10 bg-[#151515] p-6">

        <div className="mb-6 flex items-center justify-between">

          <div className="flex items-center gap-3">

            <Eye
              size={24}
              className="text-cyan-400"
            />

            <h2 className="text-2xl font-black">
              Security Logs
            </h2>

          </div>

          <button className="flex items-center gap-2 rounded-2xl bg-[#0f0f0f] px-4 py-2 font-bold">

            <Search size={18} />

            Search Logs

          </button>

        </div>

        <div className="space-y-4">

          {securityLogs.map(
            (
              item,
              index
            ) => (

              <div
                key={index}
                className="flex flex-col gap-5 rounded-2xl bg-[#0f0f0f] p-5 lg:flex-row lg:items-center lg:justify-between"
              >

                <div className="flex items-center gap-4">

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--danger-color)] text-[var(--text-color)]">

                    <Fingerprint size={24} />

                  </div>

                  <div>

                    <h3 className="text-xl font-black">
                      {item.event}
                    </h3>

                    <p className="mt-1 text-sm text-gray-400">
                      {item.user}
                    </p>

                  </div>

                </div>

                <div
                  className={`rounded-full px-4 py-2 text-sm font-bold ${
                    item.status ===
                    "Success"
                      ? "bg-[var(--success-color)]/20 text-green-400"
                      : item.status ===
                        "Blocked"
                      ? "bg-[var(--danger-color)]/20 text-red-400"
                      : "bg-[var(--warning-color)]/20 text-yellow-400"
                  }`}
                >

                  {item.status}

                </div>

              </div>

            )
          )}

        </div>

      </div>

      {/* EXTRA CARDS */}

      <div className="mt-8 grid gap-5 md:grid-cols-3">

        <InfoCard
          title="Connected Devices"
          value="124"
          icon={<Users size={24} />}
        />

        <InfoCard
          title="Global Protection"
          value="Enabled"
          icon={<Globe size={24} />}
        />

        <InfoCard
          title="Realtime Monitoring"
          value="24x7"
          icon={<ShieldCheck size={24} />}
        />

      </div>

      {/* STATUS */}

      <div className="mt-8 rounded-[32px] bg-gradient-to-r from-red-500 to-orange-500 p-7 text-[var(--text-color)]">

        <div className="flex items-center gap-3">

          <CheckCircle2 size={30} />

          <h2 className="text-3xl font-black">
            Security System Active
          </h2>

        </div>

        <p className="mt-4 max-w-2xl text-sm font-medium">

          Your ecommerce platform is protected with
          advanced firewall security & realtime monitoring.

        </p>

        <button className="mt-6 rounded-2xl bg-black px-5 py-3 font-bold text-[var(--button-text-color)]">

          Open Security Center

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
              Security Warning
            </h3>

            <p className="mt-2 text-sm text-gray-300">

              Multiple failed login attempts detected
              from unknown devices.

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

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--danger-color)] text-[var(--text-color)]">

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
        className="text-red-400"
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

function InfoCard({
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

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--danger-color)] text-[var(--text-color)]">

        {icon}

      </div>

      <h2 className="mt-5 text-2xl font-black">
        {value}
      </h2>

      <p className="mt-2 text-sm text-gray-400">
        {title}
      </p>

    </div>

  );
}
