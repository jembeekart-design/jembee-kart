"use client";

import { useState } from "react";
import {
  Shield,
  Database,
  Palette,
  FileCode,
  Activity,
  CheckCircle2,
} from "lucide-react";

const scanners = [
  {
    title: "Theme Scanner",
    icon: Palette,
    status: "Ready",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    title: "Firestore Scanner",
    icon: Database,
    status: "Ready",
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    title: "Business Rule Scanner",
    icon: Shield,
    status: "Ready",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    title: "Duplicate Code Scanner",
    icon: FileCode,
    status: "Ready",
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
  {
    title: "Performance Scanner",
    icon: Activity,
    status: "Coming Soon",
    color: "text-gray-600",
    bg: "bg-gray-100",
  },
  {
    title: "Security Scanner",
    icon: CheckCircle2,
    status: "Coming Soon",
    color: "text-red-600",
    bg: "bg-red-50",
  },
];

export default function EnterpriseScannerDashboard() {
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);

  async function runEnterpriseScan() {
    try {
      setLoading(true);

      const response = await fetch("/api/mission-control/run", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Scan failed");
      }

      setScanResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-xl border bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-xl font-bold">
            Enterprise Scanner Dashboard
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Monitor all governance scanners from one place.
          </p>
        </div>

        <button
          onClick={runEnterpriseScan}
          disabled={loading}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Scanning..." : "Run Enterprise Scan"}
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {scanners.map((scanner) => {
          const Icon = scanner.icon;

          return (
            <div
              key={scanner.title}
              className="rounded-lg border p-5 transition hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div
                  className={`rounded-lg p-3 ${scanner.bg}`}
                >
                  <Icon
                    className={scanner.color}
                    size={24}
                  />
                </div>

                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold">
                  {scanner.status}
                </span>
              </div>

              <h3 className="mt-4 text-lg font-semibold">
                {scanner.title}
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Scanner is available in Mission Control.
              </p>
            </div>
          );
        })}
      </div>

      {scanResult && (
        <div className="mt-6 rounded-lg border bg-gray-50 p-4">
          <h3 className="font-semibold">Latest Scan Result</h3>

          <pre className="mt-3 overflow-auto rounded bg-black p-3 text-xs text-green-400">
            {JSON.stringify(scanResult, null, 2)}
          </pre>
        </div>
      )}
    </section>
  );
}
