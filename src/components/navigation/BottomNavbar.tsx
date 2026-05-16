"use client";

import Link from "next/link";

export default function BottomNavbar() {
  const navigationItems = [
    {
      title: "Home",
      route: "/",
      icon: "🏠"
    },
    {
      title: "Category",
      route: "/categories",
      icon: "📂"
    },
    {
      title: "Cart",
      route: "/cart",
      icon: "🛒"
    },
    {
      title: "Affiliate",
      route: "/affiliate",
      icon: "💰"
    },
    {
      title: "Account",
      route: "/account",
      icon: "👤"
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 shadow-2xl backdrop-blur-xl md:hidden">

      <div className="grid grid-cols-5">

        {navigationItems.map((item) => {
          return (
            <Link
              key={item.title}
              href={item.route}
              className="flex flex-col items-center justify-center gap-1 py-3 transition-all duration-300 hover:bg-blue-50"
            >

              <span className="text-2xl">
                {item.icon}
              </span>

              <span className="text-[11px] font-semibold text-gray-700">
                {item.title}
              </span>

            </Link>
          );
        })}

      </div>

    </nav>
  );
}
