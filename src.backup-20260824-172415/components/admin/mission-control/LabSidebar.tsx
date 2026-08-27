"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  ScanSearch,
  Wrench,
  Brain,
  BarChart3,
  FolderKanban,
  Settings,
} from "lucide-react";

const menus = [
  {
    title: "Dashboard",
    href: "/admin/mission-control/lab",
    icon: LayoutDashboard,
  },
  {
    title: "Enterprise Scanner",
    href: "/admin/mission-control/lab/scanner",
    icon: ScanSearch,
  },
  {
    title: "Auto Fix Center",
    href: "/admin/mission-control/lab/autofix",
    icon: Wrench,
  },
  {
    title: "AI Advisor",
    href: "/admin/mission-control/lab/ai",
    icon: Brain,
  },
  {
    title: "Code Quality",
    href: "/admin/mission-control/lab/quality",
    icon: BarChart3,
  },
  {
    title: "Project Statistics",
    href: "/admin/mission-control/lab/statistics",
    icon: FolderKanban,
  },
  {
    title: "Settings",
    href: "/admin/mission-control/lab/settings",
    icon: Settings,
  },
];

export default function LabSidebar() {
  return (
    <aside className="w-72 rounded-xl border bg-white p-4 shadow-sm">
      <h2 className="mb-6 text-xl font-bold">
        🚀 Mission Lab
      </h2>

      <nav className="space-y-2">
        {menus.map((menu) => {
          const Icon = menu.icon;

          return (
            <Link
              key={menu.href}
              href={menu.href}
              className="flex items-center gap-3 rounded-lg px-4 py-3 transition hover:bg-gray-100"
            >
              <Icon size={20} />
              <span>{menu.title}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
