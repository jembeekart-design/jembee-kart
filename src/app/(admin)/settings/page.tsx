'use client';

import { useEffect, useState } from "react";
import Link from "next/link";

export default function SettingsPage() {
  const [themeColor, setThemeColor] = useState("#6366f1");

  const [storeName, setStoreName] = useState("JembeeKart");
  const [defaultMargin, setDefaultMargin] = useState(100);
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("themeColor");
    if (saved) setThemeColor(saved);

    // future: load from Firestore
  }, []);

  const saveSettings = () => {
    const data = {
      storeName,
      defaultMargin,
      notifications,
    };

    console.log("Settings:", data);
    alert("Settings Saved (Firestore later)");
  };

  return (
    <div className="space-y-6 text-white">
      {/* Title */}
      <h1 className="text-3xl font-bold">⚙️ Settings</h1>

      <div className="glass p-6 rounded-2xl space-y-5">
        {/* Store Name */}
        <div>
          <label className="text-sm opacity-70">
            Store Name
          </label>
          <input
            type="text"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            className="w-full p-3 mt-1 rounded-xl bg-white/10 border border-white/20"
          />
        </div>

        {/* Default Margin */}
        <div>
          <label className="text-sm opacity-70">
            Default Margin (₹)
          </label>
          <input
            type="number"
            value={defaultMargin}
            onChange={(e) =>
              setDefaultMargin(Number(e.target.value))
            }
            className="w-full p-3 mt-1 rounded-xl bg-white/10 border border-white/20"
          />
        </div>

        {/* Notifications Toggle */}
        <div className="flex items-center justify-between">
          <span>Enable Notifications</span>

          <button
            onClick={() => setNotifications(!notifications)}
            className={`px-4 py-1 rounded-full text-sm ${
              notifications
                ? "bg-green-500/30 text-green-400"
                : "bg-red-500/30 text-red-400"
            }`}
          >
            {notifications ? "Enabled" : "Disabled"}
          </button>
        </div>

        {/* Quick Links */}
        <div className="space-y-2">
          <p className="text-sm opacity-70">Quick Settings</p>

          <div className="flex gap-3 flex-wrap">
            <Link href="/theme">
              <button
                className="px-4 py-2 rounded-xl"
                style={{
                  border: `1px solid ${themeColor}`,
                  color: themeColor,
                }}
              >
                🎨 Theme Settings
              </button>
            </Link>

            <Link href="/settings/qikink">
              <button
                className="px-4 py-2 rounded-xl"
                style={{
                  border: `1px solid ${themeColor}`,
                  color: themeColor,
                }}
              >
                🔗 Qikink API
              </button>
            </Link>
          </div>
        </div>

        {/* Save */}
        <button
          onClick={saveSettings}
          className="px-6 py-2 rounded-xl font-medium"
          style={{
            background: themeColor,
            boxShadow: `0 0 20px ${themeColor}55`,
          }}
        >
          Save Settings
        </button>
      </div>

      {/* Info */}
      <div className="glass p-4 rounded-xl text-sm opacity-70">
        Manage your store configuration, margins, and integrations from here.
      </div>
    </div>
  );
}
