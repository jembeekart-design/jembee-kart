"use client";

import Link from "next/link";

const items = [
  { title: "Home", route: "/", icon: "⌂" },
  { title: "Shorts", route: "/shorts", icon: "▶" },
  { title: "Create", route: "/videos/upload", icon: "+" },
  { title: "Learn", route: "/learn/school", icon: "▤" },
  { title: "Profile", route: "/account", icon: "●" },
];

export default function BottomNavbar() {
  return (
    <nav aria-label="Video navigation" className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--border-color)] bg-[var(--card-color)]/95 shadow-2xl backdrop-blur-xl md:hidden">
      <div className="grid grid-cols-5">
        {items.map((item) => (
          <Link key={item.title} href={item.route} className="flex flex-col items-center justify-center gap-1 py-3 transition hover:bg-[var(--primary-color)]">
            <span className="text-2xl" aria-hidden="true">{item.icon}</span>
            <span className="text-[11px] font-bold text-[var(--text-color)]">{item.title}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
