"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  Shield,
} from "lucide-react";

interface ScanResult {
  id: string;
  name: string;
  status: "passed" | "warning" | "failed";
  message: string;
  scannedAt: string;
}

export default function RecentScanResults() {
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadScans() {
      try {
        const res = await fetch("/api/mission-control/scanner-results");
        const json = await res.json();

        if (json.success) {
          setScans(json.scanners);
        }
      } catch (err) {
        console.error("Failed to load scanner results:", err);
      } finally {
        setLoading(false);
      }
    }

    loadScans();
  }, []);

  if (loading) {
    return (
      <section className="rounded-xl border bg-white p-6 shadow-sm">
        Loading scanner results...
      </section>
    );
  }

  return (
    <section className="rounded-xl border bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">
          Recent Scan Results
        </h2>

        <p className="text-sm text-gray-500">
          Latest governance scan history
        </p>
      </div>

      <div className="space-y-4">
        {scans.map((scan) => {
          const Icon =
            scan.status === "passed"
              ? CheckCircle2
              : scan.status === "warning"
              ? AlertTriangle
              : Shield;

          const iconColor =
            scan.status === "passed"
              ? "text-[var(--primary-color)]"
              : scan.status === "warning"
              ? "text-yellow-600"
              : "text-[var(--danger-color)]";

          return (
            <div
              key={scan.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-5 w-5 ${iconColor}`} />

                <div>
                  <h3 className="font-medium">
                    {scan.name}
                  </h3>

                  <p className="text-sm text-gray-500">
                    {scan.message}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />

                {new Date(scan.scannedAt).toLocaleTimeString()}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
