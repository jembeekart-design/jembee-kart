"use client";

import { useState } from "react";

export default function RollbackCard() {
  const [backupPath, setBackupPath] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function rollback() {
    setLoading(true);

    try {
      const res = await fetch("/api/mission-control/rollback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ backupPath }),
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
        Rollback Engine
      </h2>

      <input
        value={backupPath}
        onChange={(e) => setBackupPath(e.target.value)}
        placeholder="Backup Path"
        className="w-full rounded border p-2"
      />

      <button
        onClick={rollback}
        className="rounded bg-red-600 px-4 py-2 text-white"
      >
        {loading ? "Rolling Back..." : "Rollback"}
      </button>

      {result && (
        <pre className="text-xs overflow-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
