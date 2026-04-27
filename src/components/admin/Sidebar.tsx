'use client';

import { useRouter } from "next/navigation";

export default function Sidebar() {
  const router = useRouter();

  const menu = [
    { name: "Dashboard", path: "/admin" },
    { name: "Products", path: "/admin/products" },
    { name: "Orders", path: "/admin/orders" },
    { name: "Categories", path: "/admin/categories" },
    { name: "Festival Banner", path: "/admin/marketing/festival-banner" },
    { name: "Flash Sale", path: "/admin/marketing/flash-sale" },
    { name: "Offers", path: "/admin/marketing/offers" },
    { name: "Notifications", path: "/admin/notifications" },
    { name: "Theme Settings", path: "/admin/theme" },
    { name: "Settings", path: "/admin/settings" },
  ];

  return (
    <aside className="sidebar glass">

      <h2 className="logo text-primary">JEMBEE</h2>

      <div className="menu">
        {menu.map((item, i) => (
          <div
            key={i}
            className="menu-item"
            onClick={() => router.push(item.path)}
          >
            {item.name}
          </div>
        ))}
      </div>

    </aside>
  );
}
