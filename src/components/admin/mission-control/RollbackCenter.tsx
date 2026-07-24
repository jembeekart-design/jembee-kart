"use client";

import { RotateCcw } from "lucide-react";

export default function RollbackCenter() {
  return (
    <section className="rounded-xl border bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Rollback Center</h2>

        <p className="text-sm text-gray-500">
          Restore your project using GitHub or local Git history.
        </p>
      </div>

      <div className="rounded-lg border bg-gray-50 p-5">
        <RotateCcw className="mb-3 h-8 w-8 text-blue-600" />

        <h3 className="font-semibold">
          Rollback via Git History
        </h3>

        <p className="mt-2 text-sm text-gray-500">
          Mission Control recommends restoring your project using Git commits
          created from Termux or GitHub.
        </p>

        <button
          type="button"
          className="mt-5 w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          onClick={() =>
            alert(
              "Rollback is managed through GitHub / Git history."
            )
          }
        >
          View Rollback Guide
        </button>
      </div>
    </section>
  );
}
