"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";

import {
  FileClock,
  Trash2,
  RefreshCcw,
  ShieldAlert,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

interface LogItem {
  id: number;
  type: string;
  message: string;
  time: string;
}

export default function LogsPage() {

  const [logs, setLogs] =
    useState<LogItem[]>([
      {
        id: 1,
        type: "success",
        message:
          "User login successful",
        time: "2 min ago"
      },
      {
        id: 2,
        type: "warning",
        message:
          "High server memory usage",
        time: "10 min ago"
      },
      {
        id: 3,
        type: "error",
        message:
          "Payment gateway timeout",
        time: "30 min ago"
      }
    ]);

  function refreshLogs() {

    alert(
      "Logs Refreshed"
    );
  }

  function clearLogs() {

    setLogs([]);

    alert(
      "All Logs Cleared"
    );
  }

  return (

    <main className="min-h-screen bg-[var(--primary-color)] p-4 text-[var(--button-text-color)]">

      {/* HEADER */}

      <div className="mb-8 flex items-center justify-between">

        <div className="flex items-center gap-4">

          <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-[var(--warning-color)]">

            <FileClock size={30} />

          </div>

          <div>

            <h1 className="text-3xl font-black">
              System Logs
            </h1>

            <p className="mt-1 text-sm text-[var(--muted-text-color)]">
              Monitor server & application activity
            </p>

          </div>

        </div>

        <div className="flex gap-3">

          <button
            onClick={refreshLogs}
            className="flex items-center gap-2 rounded-2xl bg-[var(--primary-color)] px-5 py-3 text-sm font-bold"
          >

            <RefreshCcw size={18} />

            Refresh

          </button>

          <button
            onClick={clearLogs}
            className="flex items-center gap-2 rounded-2xl bg-[var(--danger-color)] px-5 py-3 text-sm font-bold"
          >

            <Trash2 size={18} />

            Clear

          </button>

        </div>

      </div>

      {/* STATS */}

      <div className="grid grid-cols-3 gap-4">

        <div className="rounded-[30px] bg-[var(--primary-color)] p-5">

          <CheckCircle
            size={28}
            className="text-[var(--success-color)]"
          />

          <p className="mt-4 text-sm text-[var(--muted-text-color)]">
            Successful Events
          </p>

          <h2 className="mt-2 text-3xl font-black">
            124
          </h2>

        </div>

        <div className="rounded-[30px] bg-[var(--primary-color)] p-5">

          <AlertTriangle
            size={28}
            className="text-[var(--warning-color)]"
          />

          <p className="mt-4 text-sm text-[var(--muted-text-color)]">
            Warnings
          </p>

          <h2 className="mt-2 text-3xl font-black">
            8
          </h2>

        </div>

        <div className="rounded-[30px] bg-[var(--primary-color)] p-5">

          <ShieldAlert
            size={28}
            className="text-[var(--danger-color)]"
          />

          <p className="mt-4 text-sm text-[var(--muted-text-color)]">
            Errors
          </p>

          <h2 className="mt-2 text-3xl font-black">
            3
          </h2>

        </div>

      </div>

      {/* LOGS LIST */}

      <div className="mt-6 space-y-5">

        {logs.map(
          (item) => (

            <div
              key={item.id}
              className="rounded-[30px] bg-[var(--primary-color)] p-5"
            >

              <div className="flex items-start justify-between gap-4">

                <div>

                  <div className="flex items-center gap-3">

                    {item.type ===
                    "success" ? (

                      <CheckCircle
                        size={22}
                        className="text-[var(--success-color)]"
                      />

                    ) : item.type ===
                      "warning" ? (

                      <AlertTriangle
                        size={22}
                        className="text-[var(--warning-color)]"
                      />

                    ) : (

                      <ShieldAlert
                        size={22}
                        className="text-[var(--danger-color)]"
                      />

                    )}

                    <h2 className="text-xl font-black capitalize">
                      {item.type}
                    </h2>

                  </div>

                  <p className="mt-4 text-sm text-[var(--text-color)]">
                    {item.message}
                  </p>

                </div>

                <span className="rounded-full bg-[var(--card-color)]/40 px-4 py-2 text-sm text-[var(--muted-text-color)]">

                  {item.time}

                </span>

              </div>

            </div>

          )
        )}

      </div>

      {/* FOOTER */}

      <div className="mt-6 rounded-[30px] bg-gradient-to-r from-[var(--primary-color)] to-[var(--primary-color)] p-6">

        <h2 className="text-3xl font-black">
          Activity Monitoring
        </h2>

        <p className="mt-2 text-[var(--button-text-color)]/80">
          Track every important system event & error
        </p>

      </div>

    </main>
  );
}
