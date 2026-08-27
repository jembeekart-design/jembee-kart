"use client";

import { useState } from "react";

export default function BackupCard() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function createBackup() {
    setLoading(true);

    try {
      const res = await fetch("/api/mission-control/backup", {
        method: "POST",
      });

      const data = await res.json();
      setResult(data);
    } catch (e) {
      console.error(e);
    }

    setLoading(false);
  }

  return (
    <div className="rounded-xl border p-4 space-y-3">
      <h2 className="text-xl font-bold">
        Backup Engine
      </h2>

      <button
        onClick={createBackup}
        className="rounded bg-blue-600 px-4 py-2 text-white"
      >
        {loading ? "Creating..." : "Create Backup"}
      </button>

      {result && (
        <pre className="text-xs overflow-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
