'use client';

import { useEffect, useState } from "react";

export default function QikinkSettingsPage() {
  const [themeColor, setThemeColor] = useState("#6366f1");

  const [apiKey, setApiKey] = useState("");
  const [storeId, setStoreId] = useState("");
  const [webhook, setWebhook] = useState("");

  const [status, setStatus] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("themeColor");
    if (saved) setThemeColor(saved);

    // Load saved config
    const savedApi = localStorage.getItem("qikink_api");
    const savedStore = localStorage.getItem("qikink_store");
    const savedWebhook = localStorage.getItem("qikink_webhook");

    if (savedApi) setApiKey(savedApi);
    if (savedStore) setStoreId(savedStore);
    if (savedWebhook) setWebhook(savedWebhook);
  }, []);

  const testConnection = async () => {
    setStatus("Testing connection...");

    // 🔥 Dummy API test (replace later)
    setTimeout(() => {
      if (apiKey && storeId) {
        setStatus("✅ Connected successfully");
      } else {
        setStatus("❌ Invalid credentials");
      }
    }, 1000);
  };

  const saveSettings = () => {
    localStorage.setItem("qikink_api", apiKey);
    localStorage.setItem("qikink_store", storeId);
    localStorage.setItem("qikink_webhook", webhook);

    alert("Qikink Settings Saved 🚀");
  };

  return (
    <div className="space-y-6 text-white">
      {/* Title */}
      <h1 className="text-3xl font-bold">
        🔗 Qikink API Settings
      </h1>

      <div className="glass p-6 rounded-2xl space-y-5">
        {/* API Key */}
        <div>
          <label className="text-sm opacity-70">
            API Key
          </label>
          <input
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter Qikink API Key"
            className="w-full p-3 mt-1 rounded-xl bg-white/10 border border-white/20"
          />
        </div>

        {/* Store ID */}
        <div>
          <label className="text-sm opacity-70">
            Store ID
          </label>
          <input
            type="text"
            value={storeId}
            onChange={(e) => setStoreId(e.target.value)}
            placeholder="Enter Store ID"
            className="w-full p-3 mt-1 rounded-xl bg-white/10 border border-white/20"
          />
        </div>

        {/* Webhook */}
        <div>
          <label className="text-sm opacity-70">
            Webhook URL
          </label>
          <input
            type="text"
            value={webhook}
            onChange={(e) => setWebhook(e.target.value)}
            placeholder="https://yourapp.com/api/webhook"
            className="w-full p-3 mt-1 rounded-xl bg-white/10 border border-white/20"
          />
        </div>

        {/* Test Button */}
        <div className="flex gap-3">
          <button
            onClick={testConnection}
            className="px-5 py-2 rounded-xl font-medium"
            style={{
              border: `1px solid ${themeColor}`,
              color: themeColor,
            }}
          >
            Test Connection
          </button>

          <button
            onClick={saveSettings}
            className="px-5 py-2 rounded-xl font-medium"
            style={{
              background: themeColor,
              boxShadow: `0 0 20px ${themeColor}55`,
            }}
          >
            Save Settings
          </button>
        </div>

        {/* Status */}
        {status && (
          <div
            className="text-sm mt-2"
            style={{
              color: status.includes("✅")
                ? "#22c55e"
                : "#ef4444",
            }}
          >
            {status}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="glass p-4 rounded-xl text-sm opacity-70">
        Connect your Qikink account to enable product import, order sync, and automation.
      </div>
    </div>
  );
}
