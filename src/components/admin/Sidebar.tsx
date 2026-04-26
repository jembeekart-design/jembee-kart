'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

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

  return (
    <aside className="w-72 min-h-screen glass-guardian border-r border-white/10 p-6 hidden md:flex flex-col">
      {/* 🚀 Logo Area with Guardian Glow */}
      <div className="mb-10 px-2">
        <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-[var(--guardian-start)] to-[var(--guardian-end)] bg-clip-text text-transparent">
          JEMBEE KART
        </h1>
        <p className="text-[10px] uppercase tracking-[3px] text-white/40 font-bold">
          Admin Ecosystem
        </p>
      </div>

      {/* 🧭 Navigation Menu */}
      <nav className="flex-1 space-y-1.5">
        {menu.map((item) => {
          const active = pathname === item.path;

          return (
            <Link key={item.name} href={item.path}>
              <div
                className={`group relative flex items-center gap-4 p-3.5 rounded-[var(--glass-radius)] transition-all duration-300 ${
                  active 
                    ? "glass-normal border-white/20" 
                    : "hover:bg-white/5 border border-transparent"
                }`}
              >
                {/* Active Indicator (Guardian Line) */}
                {active && (
                  <div className="absolute left-0 w-1 h-6 bg-gradient-to-b from-[var(--guardian-start)] to-[var(--guardian-end)] rounded-full shadow-[0_0_10px_var(--primary)]" />
                )}

                <span className={`text-xl transition-transform duration-300 group-hover:scale-110 ${active ? 'filter drop-shadow-[0_0_8px_var(--primary)]' : 'opacity-70'}`}>
                  {item.icon}
                </span>
                
                <span className={`text-sm font-medium transition-colors ${active ? 'text-white' : 'text-white/60 group-hover:text-white'}`}>
                  {item.name}
                </span>

                {/* Subtle Hover Glow */}
                {!active && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[var(--glass-radius)]" />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* 👤 Admin Profile Footer */}
      <div className="mt-auto pt-6 border-t border-white/10">
        <div className="glass-normal p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[var(--guardian-start)] to-[var(--guardian-end)] p-[2px]">
            <div className="w-full h-full rounded-full bg-[#0f172a] flex items-center justify-center text-xs">
              AD
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-white">Admin User</p>
            <p className="text-[10px] text-white/50">Production Manager</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
