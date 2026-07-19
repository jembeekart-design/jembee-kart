"use client";

import { useState } from "react";
import {
  Wrench,
  Eye,
  RotateCcw,
  Play,
  Loader2,
} from "lucide-react";

export default function AutoFixCenter() {
  const [loading, setLoading] = useState(false);

  async function run(action: string) {
    try {
      setLoading(true);

      // बाद में यहाँ API call करेंगे
      console.log(action);

      await new Promise((resolve) =>
        setTimeout(resolve, 1000)
      );

    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-xl border bg-white p-6 shadow-sm">

      <div className="flex items-center gap-3">

        <div className="rounded-lg bg-blue-100 p-3">
          <Wrench
            size={22}
            className="text-blue-600"
          />
        </div>

        <div>
          <h2 className="text-xl font-bold">
            Auto Fix Center
          </h2>

          <p className="text-sm text-gray-500">
            Preview, Auto Fix and Rollback your project.
          </p>
        </div>

      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-4">

        <button
          onClick={() => run("scan")}
          disabled={loading}
          className="rounded-lg bg-blue-600 px-4 py-3 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          <div className="flex items-center justify-center gap-2">

            {loading ? (
              <Loader2
                className="animate-spin"
                size={18}
              />
            ) : (
              <Play size={18} />
            )}

            Run Scan

          </div>
        </button>

        <button
          onClick={() => run("preview")}
          disabled={loading}
          className="rounded-lg bg-orange-500 px-4 py-3 text-white hover:bg-orange-600 disabled:opacity-50"
        >
          <div className="flex items-center justify-center gap-2">
            <Eye size={18} />
            Preview
          </div>
        </button>

        <button
          onClick={() => run("autofix")}
          disabled={loading}
          className="rounded-lg bg-green-600 px-4 py-3 text-white hover:bg-green-700 disabled:opacity-50"
        >
          <div className="flex items-center justify-center gap-2">
            <Wrench size={18} />
            Auto Fix
          </div>
        </button>

        <button
          onClick={() => run("rollback")}
          disabled={loading}
          className="rounded-lg bg-red-600 px-4 py-3 text-white hover:bg-red-700 disabled:opacity-50"
        >
          <div className="flex items-center justify-center gap-2">
            <RotateCcw size={18} />
            Rollback
          </div>
        </button>

      </div>

      <div className="mt-6 rounded-lg border bg-gray-50 p-4">

        <p className="font-semibold">
          Status
        </p>

        <p className="mt-2 text-sm text-gray-600">
          {loading
            ? "Mission Control is processing..."
            : "System Ready"}
        </p>

      </div>

    </section>
  );
}
