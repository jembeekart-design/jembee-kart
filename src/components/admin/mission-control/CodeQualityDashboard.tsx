"use client";

import {
  FileCode2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  BarChart3,
} from "lucide-react";

const metrics = [
  {
    title: "Files Scanned",
    value: "0",
    icon: FileCode2,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    title: "Passed Checks",
    value: "0",
    icon: CheckCircle2,
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    title: "Warnings",
    value: "0",
    icon: AlertTriangle,
    color: "text-yellow-600",
    bg: "bg-yellow-50",
  },
  {
    title: "Critical Issues",
    value: "0",
    icon: XCircle,
    color: "text-red-600",
    bg: "bg-red-50",
  },
];

export default function CodeQualityDashboard() {
  return (
    <section className="rounded-xl border bg-white p-6 shadow-sm">

      <div className="flex items-center gap-3 mb-6">

        <div className="rounded-lg bg-indigo-100 p-3">
          <BarChart3
            size={24}
            className="text-indigo-600"
          />
        </div>

        <div>
          <h2 className="text-xl font-bold">
            Code Quality Dashboard
          </h2>

          <p className="text-sm text-gray-500">
            Overall code quality and scanner statistics.
          </p>
        </div>

      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <div
              key={metric.title}
              className="rounded-lg border p-5"
            >
              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm text-gray-500">
                    {metric.title}
                  </p>

                  <h3 className="mt-2 text-3xl font-bold">
                    {metric.value}
                  </h3>
                </div>

                <div
                  className={`rounded-lg p-3 ${metric.bg}`}
                >
                  <Icon
                    className={metric.color}
                    size={24}
                  />
                </div>

              </div>
            </div>
          );
        })}

      </div>

      <div className="mt-6 rounded-lg border bg-gray-50 p-5">

        <h3 className="font-semibold">
          Quality Score
        </h3>

        <div className="mt-4 h-3 overflow-hidden rounded-full bg-gray-200">

          <div
            className="h-full rounded-full bg-green-500"
            style={{ width: "0%" }}
          />

        </div>

        <div className="mt-2 flex justify-between text-sm text-gray-500">
          <span>0%</span>
          <span>Waiting for scan...</span>
        </div>

      </div>

    </section>
  );
}
