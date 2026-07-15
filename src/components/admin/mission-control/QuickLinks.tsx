"use client";

import Link from "next/link";

const links = [
  {
    title: "Dashboard",
    href: "/admin",
  },
  {
    title: "Orders",
    href: "/admin/orders",
  },
  {
    title: "Products",
    href: "/admin/products",
  },
  {
    title: "Users",
    href: "/admin/users",
  },
  {
    title: "Theme Builder",
    href: "/admin/theme",
  },
  {
    title: "Settings",
    href: "/admin/settings",
  },
];

export default function QuickLinks() {
  return (
    <section className="space-y-4">
      <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">
        Quick Navigation
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {links.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-xl border p-4 text-center hover:bg-gray-50 transition"
          >
            <p className="font-semibold text-sm">
              {item.title}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
