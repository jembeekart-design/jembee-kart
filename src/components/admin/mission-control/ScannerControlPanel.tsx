"use client";

import {
  Palette,
  Database,
  Shield,
  FileCode,
  Wrench,
  Play,
  Eye,
} from "lucide-react";

const scanners = [
  {
    name: "Theme Scanner",
    description: "Detect hardcoded colors and theme issues.",
    icon: Palette,
  },
  {
    name: "Firestore Scanner",
    description: "Validate Firestore collections and queries.",
    icon: Database,
  },
  {
    name: "Security Scanner",
    description: "Check authentication and security rules.",
    icon: Shield,
  },
  {
    name: "Duplicate Code Scanner",
    description: "Find duplicate code blocks.",
    icon: FileCode,
  },
];

export default function ScannerControlPanel() {
  return (
    <section className="rounded-xl border bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">
          Scanner Control Panel
        </h2>

        <p className="text-sm text-gray-500">
          Run and manage project scanners.
        </p>
      </div>

      <div className="space-y-4">
        {scanners.map((scanner) => {
          const Icon = scanner.icon;

          return (
            <div
              key={scanner.name}
              className="flex flex-col gap-4 rounded-xl border p-5 lg:flex-row lg:items-center lg:justify-between"
            >
              <div className="flex items-start gap-4">
                <Icon className="mt-1 h-7 w-7 text-blue-600" />

                <div>
                  <h3 className="font-semibold">
                    {scanner.name}
                  </h3>

                  <p className="text-sm text-gray-500">
                    {scanner.description}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                  <Play size={16} />
                  Run
                </button>

                <button className="flex items-center gap-2 rounded-lg border px-4 py-2 hover:bg-gray-100">
                  <Eye size={16} />
                  Preview
                </button>

                <button className="flex items-center gap-2 rounded-lg border px-4 py-2 hover:bg-gray-100">
                  <Wrench size={16} />
                  Auto Fix
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
