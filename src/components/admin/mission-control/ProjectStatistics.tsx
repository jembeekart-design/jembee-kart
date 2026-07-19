"use client";

import {
  FolderGit2,
  FileCode2,
  Database,
  ShieldCheck,
  Clock,
  Activity,
} from "lucide-react";

const stats = [
  {
    title: "Project Files",
    value: "--",
    icon: FileCode2,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    title: "Firestore Collections",
    value: "--",
    icon: Database,
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    title: "Governance Health",
    value: "--",
    icon: ShieldCheck,
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    title: "Build Status",
    value: "Ready",
    icon: Activity,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
];

export default function ProjectStatistics() {
  return (
    <section className="rounded-xl border bg-white p-6 shadow-sm">

      <div className="flex items-center gap-3 mb-6">

        <div className="rounded-lg bg-cyan-100 p-3">
          <FolderGit2
            size={24}
            className="text-cyan-600"
          />
        </div>

        <div>
          <h2 className="text-xl font-bold">
            Project Statistics
          </h2>

          <p className="text-sm text-gray-500">
            Live overview of your JembeeKart project.
          </p>
        </div>

      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-lg border p-5"
            >
              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm text-gray-500">
                    {item.title}
                  </p>

                  <h3 className="mt-2 text-3xl font-bold">
                    {item.value}
                  </h3>

                </div>

                <div
                  className={`rounded-lg p-3 ${item.bg}`}
                >
                  <Icon
                    size={24}
                    className={item.color}
                  />
                </div>

              </div>
            </div>
          );
        })}

      </div>

      <div className="mt-6 rounded-lg border bg-gray-50 p-5">

        <div className="flex items-center gap-2 mb-3">

          <Clock
            size={18}
            className="text-gray-500"
          />

          <span className="font-semibold">
            Last Analysis
          </span>

        </div>

        <p className="text-sm text-gray-600">
          No project analysis has been executed yet.
          Run Mission Control Scan to generate live statistics.
        </p>

      </div>

    </section>
  );
}
