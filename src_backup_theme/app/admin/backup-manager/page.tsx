"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";

import {
  Database,
  Download,
  Upload,
  Clock3,
  ShieldCheck,
  HardDrive,
  RefreshCw,
  Save,
  Trash2,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";

const backups = [
  {
    name: "backup-12-june.zip",
    size: "2.4 GB",
    status: "Completed"
  },
  {
    name: "backup-10-june.zip",
    size: "2.1 GB",
    status: "Completed"
  },
  {
    name: "backup-08-june.zip",
    size: "1.9 GB",
    status: "Failed"
  }
];

export default function BackupManagerPage() {

  const [autoBackup, setAutoBackup] =
    useState(true);

  return (

    <main className="min-h-screen bg-[#0b0b0b] p-4 text-white">

      {/* HEADER */}

      <div className="mb-8 flex items-center justify-between">

        <div className="flex items-center gap-4">

          <div className="flex h-16 w-16 items-center justify-center rounded-[28px] bg-green-500">

            <Database
              size={30}
              className="text-black"
            />

          </div>

          <div>

            <h1 className="text-3xl font-black">
              Backup Manager
            </h1>

            <p className="mt-1 text-sm text-gray-400">
              Manage system backups & restore points
            </p>

          </div>

        </div>

        <button className="flex items-center gap-2 rounded-2xl bg-green-500 px-5 py-3 font-bold text-black">

          <Save size={18} />

          Save Settings

        </button>

      </div>

      {/* STATS */}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

        <StatCard
          title="Backups"
          value="28"
          icon={<HardDrive size={22} />}
        />

        <StatCard
          title="Storage"
          value="42GB"
          icon={<Database size={22} />}
        />

        <StatCard
          title="Success Rate"
          value="98%"
          icon={<ShieldCheck size={22} />}
        />

        <StatCard
          title="Last Backup"
          value="2h Ago"
          icon={<Clock3 size={22} />}
        />

      </div>

      {/* AUTO BACKUP */}

      <div className="mt-6 rounded-[28px] border border-white/10 bg-[#151515] p-5">

        <div className="flex items-center justify-between">

          <div>

            <h2 className="text-2xl font-black">
              Automatic Backup
            </h2>

            <p className="mt-1 text-sm text-gray-400">
              Enable scheduled cloud backups
            </p>

          </div>

          <button
            onClick={() =>
              setAutoBackup(
                !autoBackup
              )
            }
            className={`rounded-full px-5 py-2 font-bold ${
              autoBackup
                ? "bg-green-500 text-black"
                : "bg-red-500"
            }`}
          >

            {autoBackup
              ? "Enabled"
              : "Disabled"}

          </button>

        </div>

      </div>

      {/* BACKUP LIST */}

      <div className="mt-6 space-y-4">

        {backups.map(
          (
            item,
            index
          ) => (

            <div
              key={index}
              className="rounded-[28px] border border-white/10 bg-[#151515] p-5"
            >

              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                <div>

                  <h2 className="text-2xl font-black">
                    {item.name}
                  </h2>

                  <p className="mt-2 text-sm text-gray-400">
                    File Size:
                    {" "}
                    {item.size}
                  </p>

                </div>

                <div className="flex items-center gap-3">

                  <div
                    className={`rounded-full px-4 py-1 text-sm font-bold ${
                      item.status ===
                      "Completed"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >

                    {item.status}

                  </div>

                  <button className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">

                    <Download size={18} />

                  </button>

                  <button className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-500/20 text-red-400">

                    <Trash2 size={18} />

                  </button>

                </div>

              </div>

            </div>

          )
        )}

      </div>

      {/* ACTIONS */}

      <div className="mt-6 flex flex-wrap gap-4">

        <button className="flex items-center gap-2 rounded-2xl bg-green-500 px-6 py-3 font-bold text-black">

          <Upload size={18} />

          Create Backup

        </button>

        <button className="flex items-center gap-2 rounded-2xl bg-cyan-500 px-6 py-3 font-bold text-black">

          <RefreshCw size={18} />

          Restore Backup

        </button>

      </div>

      {/* SECURITY */}

      <div className="mt-6 rounded-[30px] bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-black">

        <div className="flex items-center gap-3">

          <CheckCircle2 size={26} />

          <h2 className="text-3xl font-black">
            Secure Cloud Backup
          </h2>

        </div>

        <p className="mt-3 max-w-2xl text-sm font-medium">

          All backups are encrypted and securely stored
          in cloud storage with realtime sync protection.

        </p>

      </div>

      {/* WARNING */}

      <div className="mt-6 rounded-[28px] border border-yellow-500/20 bg-yellow-500/10 p-5">

        <div className="flex items-start gap-4">

          <AlertTriangle
            size={24}
            className="text-yellow-400"
          />

          <div>

            <h3 className="text-xl font-black text-yellow-400">
              Important
            </h3>

            <p className="mt-2 text-sm text-gray-300">

              Always create backup before major updates
              or database modifications.

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

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-500 text-black">

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
