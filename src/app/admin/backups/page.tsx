"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";

import {
  DatabaseBackup,
  Download,
  Upload,
  Trash2,
  Clock3,
  CheckCircle,
  HardDrive
} from "lucide-react";

interface BackupItem {
  id: number;
  name: string;
  date: string;
  size: string;
  status: string;
}

export default function BackupsPage() {

  const [backups, setBackups] =
    useState<BackupItem[]>([
      {
        id: 1,
        name: "backup-01.zip",
        date: "20 May 2026",
        size: "120 MB",
        status: "completed"
      },
      {
        id: 2,
        name: "backup-02.zip",
        date: "21 May 2026",
        size: "142 MB",
        status: "completed"
      }
    ]);

  function createBackup() {

    const newBackup = {
      id: Date.now(),
      name:
        `backup-${Date.now()}.zip`,
      date:
        new Date().toLocaleDateString(),
      size: "100 MB",
      status: "completed"
    };

    setBackups((prev) => [
      newBackup,
      ...prev
    ]);

    alert(
      "Backup Created Successfully"
    );
  }

  function deleteBackup(
    id: number
  ) {

    setBackups((prev) =>
      prev.filter(
        (item) =>
          item.id !== id
      )
    );
  }

  return (

    <main className="min-h-screen bg-[#0b0b0b] p-4 text-[var(--button-text-color)]">

      {/* HEADER */}

      <div className="mb-8 flex items-center gap-4">

        <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-emerald-500">

          <DatabaseBackup size={30} />

        </div>

        <div>

          <h1 className="text-3xl font-black">
            Backups Manager
          </h1>

          <p className="mt-1 text-sm text-[var(--muted-text-color)]">
            Create & restore system backups
          </p>

        </div>

      </div>

      {/* STATS */}

      <div className="grid grid-cols-3 gap-4">

        <div className="rounded-[30px] bg-[#151515] p-5">

          <DatabaseBackup
            size={28}
            className="text-cyan-400"
          />

          <p className="mt-4 text-sm text-[var(--muted-text-color)]">
            Total Backups
          </p>

          <h2 className="mt-2 text-3xl font-black">
            {backups.length}
          </h2>

        </div>

        <div className="rounded-[30px] bg-[#151515] p-5">

          <HardDrive
            size={28}
            className="text-pink-400"
          />

          <p className="mt-4 text-sm text-[var(--muted-text-color)]">
            Storage Used
          </p>

          <h2 className="mt-2 text-3xl font-black">
            2.3 GB
          </h2>

        </div>

        <div className="rounded-[30px] bg-[#151515] p-5">

          <Clock3
            size={28}
            className="text-yellow-400"
          />

          <p className="mt-4 text-sm text-[var(--muted-text-color)]">
            Last Backup
          </p>

          <h2 className="mt-2 text-2xl font-black">
            Today
          </h2>

        </div>

      </div>

      {/* ACTIONS */}

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">

        <button
          onClick={createBackup}
          className="rounded-[30px] bg-gradient-to-r from-cyan-500 to-blue-600 p-6 text-left"
        >

          <Download size={32} />

          <h2 className="mt-5 text-2xl font-black">
            Create Backup
          </h2>

          <p className="mt-2 text-[var(--button-text-color)]/80">
            Generate latest database backup
          </p>

        </button>

        <button
          className="rounded-[30px] bg-gradient-to-r from-violet-600 to-fuchsia-600 p-6 text-left"
        >

          <Upload size={32} />

          <h2 className="mt-5 text-2xl font-black">
            Restore Backup
          </h2>

          <p className="mt-2 text-[var(--button-text-color)]/80">
            Restore previous backup files
          </p>

        </button>

      </div>

      {/* BACKUP LIST */}

      <div className="mt-6 space-y-5">

        {backups.map(
          (item) => (

            <div
              key={item.id}
              className="rounded-[30px] bg-[#151515] p-5"
            >

              <div className="flex items-center justify-between gap-4">

                <div>

                  <h2 className="text-2xl font-black break-all">
                    {item.name}
                  </h2>

                  <div className="mt-3 flex flex-wrap gap-3 text-sm text-[var(--muted-text-color)]">

                    <span>
                      {item.date}
                    </span>

                    <span>
                      {item.size}
                    </span>

                  </div>

                  <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--success-color)] px-4 py-2 text-sm font-bold">

                    <CheckCircle size={16} />

                    {item.status}

                  </div>

                </div>

                <button
                  onClick={() =>
                    deleteBackup(
                      item.id
                    )
                  }
                  className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--danger-color)]"
                >

                  <Trash2 size={22} />

                </button>

              </div>

            </div>

          )
        )}

      </div>

      {/* FOOTER */}

      <div className="mt-6 rounded-[30px] bg-gradient-to-r from-emerald-500 to-cyan-500 p-6">

        <h2 className="text-3xl font-black">
          Backup Protection
        </h2>

        <p className="mt-2 text-[var(--button-text-color)]/80">
          Secure your JembeeKart data & restore anytime
        </p>

      </div>

    </main>
  );
}
