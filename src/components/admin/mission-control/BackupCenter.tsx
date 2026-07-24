"use client";

import { useState } from "react";

export default function BackupCenter() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function createBackup() {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/mission-control/backup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "create",
        }),
      });

      const data = await res.json();

      setMessage(data.message);
    } catch {
      setMessage("Backup failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border p-6">
      <h2 className="text-xl font-bold">
        Backup Engine
      </h2>

      <p className="mt-2 text-sm text-gray-500">
        Create a complete backup before running Auto Fix.
      </p>

      <button
        onClick={createBackup}
        disabled={loading}
        className="mt-4 rounded bg-blue-600 px-4 py-2 text-white"
      >
        {loading ? "Creating..." : "Create Backup"}
      </button>

      {message && (
        <p className="mt-4 text-sm">
          {message}
        </p>
      )}
    </div>
  );
}
