'use client';

import { useEffect, useState } from "react";

export default function QikinkSyncPage() {
  const [themeColor, setThemeColor] = useState("#6366f1");
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("themeColor");
    if (saved) setThemeColor(saved);
  }, []);

  // 🔥 Fake sync (replace with real API)
  const syncOrders = async () => {
    setLoading(true);
    setLogs([]);

    const steps = [
      "Connecting to Qikink API...",
      "Fetching orders...",
      "Matching with local database...",
      "Updating statuses...",
      "Sync completed successfully ✅",
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise((res) => setTimeout(res, 800));
      setLogs((prev) => [...prev, steps[i]]);
    }

    setLoading(false);
  };

  return (
    <div className="space-y-6 text-white">
      {/* Title */}
      <h1 className="text-3xl font-bold">
        🔄 Qikink Order Sync
      </h1>

      {/* Sync Card */}
      <div className="glass p-6 rounded-2xl space-y-4">
        <p className="opacity-70 text-sm">
          Sync your orders with Qikink to update status and track shipments.
        </p>

        <button
          onClick={syncOrders}
          disabled={loading}
          className="px-5 py-2 rounded-xl font-medium"
          style={{
            background: themeColor,
            boxShadow: `0 0 20px ${themeColor}55`,
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Syncing..." : "Start Sync"}
        </button>
      </div>

      {/* Logs */}
      <div className="glass p-6 rounded-2xl">
        <h2 className="text-xl font-semibold mb-3">
          📜 Sync Logs
        </h2>

        <div className="space-y-2 text-sm opacity-80">
          {logs.length === 0 && (
            <p className="opacity-50">No logs yet</p>
          )}

          {logs.map((log, index) => (
            <div key={index} className="flex items-center gap-2">
              <span style={{ color: themeColor }}>●</span>
              {log}
            </div>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="glass p-4 rounded-xl text-sm opacity-70">
        This will fetch all latest orders from Qikink and update their status in your system.
      </div>
    </div>
  );
}
