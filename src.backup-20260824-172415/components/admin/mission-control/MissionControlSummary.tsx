"use client";

import { useEffect, useState } from "react";
import {
  FolderOpen,
  Database,
  Copy,
  AlertTriangle,
  Clock,
  Timer,
} from "lucide-react";

interface SummaryData {
  success: boolean;
  generatedAt: string;
  duration: number;
  scanners: {
    firestore: {
      scannedFiles?: number;
      collections?: number;
    };
    duplicate: {
      duplicates?: number;
      duplicateGroups?: number;
    };
    rules: {
      issueCount?: number;
    };
  };
}

export default function MissionControlSummary() {
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSummary() {
      try {
        const res = await fetch("/api/mission-control/summary");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadSummary();
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border bg-white p-6">
        Loading Mission Control Summary...
      </div>
    );
  }

  if (!data?.success) {
    return (
      <div className="rounded-xl border border-red-300 bg-red-50 p-6">
        Failed to load Mission Control Summary.
      </div>
    );
  }

  const cards = [
    {
      title: "Scanned Files",
      value: data.scanners.firestore.scannedFiles ?? 0,
      icon: FolderOpen,
    },
    {
      title: "Firestore Collections",
      value: data.scanners.firestore.collections ?? 0,
      icon: Database,
    },
    {
      title: "Duplicate Files",
      value:
        data.scanners.duplicate.duplicates ??
        data.scanners.duplicate.duplicateGroups ??
        0,
      icon: Copy,
    },
    {
      title: "Hardcoded Rules",
      value: data.scanners.rules.issueCount ?? 0,
      icon: AlertTriangle,
    },
  ];

  return (
    <section className="rounded-xl border bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">
          Mission Control Summary
        </h2>

        <p className="text-sm text-gray-500">
          Live project analysis
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="rounded-xl border p-5"
            >
              <Icon className="mb-3 h-7 w-7 text-blue-600" />

              <h3 className="text-sm text-gray-500">
                {card.title}
              </h3>

              <p className="mt-2 text-3xl font-bold">
                {card.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="flex items-center gap-3 rounded-lg border p-4">
          <Clock className="text-green-600" />

          <div>
            <p className="text-sm text-gray-500">
              Last Scan
            </p>

            <p className="font-medium">
              {new Date(data.generatedAt).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-lg border p-4">
          <Timer className="text-indigo-600" />

          <div>
            <p className="text-sm text-gray-500">
              Scan Duration
            </p>

            <p className="font-medium">
              {data.duration} ms
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
