'use client';

import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [themeColor, setThemeColor] = useState("#6366f1");

  useEffect(() => {
    const saved = localStorage.getItem("themeColor");
    if (saved) setThemeColor(saved);
  }, []);

  const stats = [
    { title: "Total Products", value: "120" },
    { title: "Total Orders", value: "45" },
    { title: "Revenue", value: "₹12,500" },
    { title: "Active Banners", value: "3" },
  ];

  return (
    <div className="space-y-6 text-white">
      {/* Heading */}
      <h1 className="text-3xl font-bold">📊 Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((item, index) => (
          <div
            key={index}
            className="p-5 rounded-2xl glass shadow-lg"
            style={{
              borderColor: themeColor,
              boxShadow: `0 0 20px ${themeColor}33`,
            }}
          >
            <p className="text-sm opacity-70">{item.title}</p>
            <h2
              className="text-2xl font-bold"
              style={{ color: themeColor }}
            >
              {item.value}
            </h2>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="glass p-5 rounded-xl">
          <h2 className="font-semibold mb-2">🛒 Add Product</h2>
          <p className="text-sm opacity-70">
            Import product from Qikink
          </p>
        </div>

        <div className="glass p-5 rounded-xl">
          <h2 className="font-semibold mb-2">🎉 Festival Banner</h2>
          <p className="text-sm opacity-70">
            Manage homepage banners
          </p>
        </div>

        <div className="glass p-5 rounded-xl">
          <h2 className="font-semibold mb-2">⚡ Flash Sale</h2>
          <p className="text-sm opacity-70">
            Create limited-time offers
          </p>
        </div>
      </div>

      {/* Activity Section */}
      <div className="glass p-6 rounded-2xl">
        <h2 className="text-xl font-semibold mb-3">📦 Recent Activity</h2>

        <ul className="space-y-2 text-sm opacity-80">
          <li>✔️ New order received</li>
          <li>✔️ Product imported from Qikink</li>
          <li>✔️ Banner updated</li>
        </ul>
      </div>
    </div>
  );
}
