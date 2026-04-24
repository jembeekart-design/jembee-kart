'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const menu = [
  { name: "Dashboard", path: "/admin", icon: "📊" },
  { name: "Products", path: "/products", icon: "🛒" },
  { name: "Orders", path: "/orders", icon: "📦" },
  { name: "Categories", path: "/categories", icon: "📂" },
  { name: "Festival Banner", path: "/marketing/festival-banner", icon: "🎉" },
  { name: "Flash Sale", path: "/marketing/flash-sale", icon: "⚡" },
  { name: "Offers", path: "/marketing/offers", icon: "🎟" },
  { name: "Notifications", path: "/notifications", icon: "🔔" },
  { name: "Theme", path: "/theme", icon: "🎨" },
  { name: "Settings", path: "/settings", icon: "⚙️" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [themeColor, setThemeColor] = useState("#6366f1");

  useEffect(() => {
    const saved = localStorage.getItem("themeColor");
    if (saved) setThemeColor(saved);
  }, []);

  return (
    <aside className="w-64 min-h-screen glass p-4 hidden md:block">
      {/* Logo */}
      <h1
        className="text-xl font-bold mb-6"
        style={{ color: themeColor }}
      >
        🚀 Admin Panel
      </h1>

      {/* Menu */}
      <nav className="space-y-2">
        {menu.map((item) => {
          const active = pathname === item.path;

          return (
            <Link key={item.name} href={item.path}>
              <div
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition ${
                  active ? "bg-white/10" : "hover:bg-white/5"
                }`}
                style={
                  active
                    ? {
                        border: `1px solid ${themeColor}`,
                        boxShadow: `0 0 15px ${themeColor}33`,
                      }
                    : {}
                }
              >
                <span>{item.icon}</span>
                <span className="text-sm">{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
