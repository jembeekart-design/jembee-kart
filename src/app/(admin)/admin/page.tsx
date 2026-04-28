'use client';

import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();

  const pages = [
    { name: "Dashboard", path: "/admin", icon: "📊" },
    { name: "Products", path: "/admin/products", icon: "📦" },
    { name: "Import Qikink", path: "/admin/products/import-qikink", icon: "⬇️" },

    { name: "Edit Product", path: "/admin/products/edit/1", icon: "✏️" },
    { name: "Orders", path: "/admin/orders", icon: "🧾" },
    { name: "Order Details", path: "/admin/orders/1", icon: "📄" },

    { name: "Qikink Sync", path: "/admin/orders/qikink-sync", icon: "🔄" },
    { name: "Categories", path: "/admin/categories", icon: "📂" },
    { name: "Festival Banner", path: "/admin/marketing/festival-banner", icon: "🎉" },

    { name: "Add Banner", path: "/admin/marketing/festival-banner/add", icon: "➕" },
    { name: "Edit Banner", path: "/admin/marketing/festival-banner/edit/1", icon: "🖼️" },
    { name: "Flash Sale", path: "/admin/marketing/flash-sale", icon: "⚡" },

    { name: "Add Flash Sale", path: "/admin/marketing/flash-sale/add", icon: "🔥" },
    { name: "Offers", path: "/admin/marketing/offers", icon: "🏷️" },
    { name: "Theme Settings", path: "/admin/theme", icon: "🎨" },

    { name: "Theme Colors", path: "/admin/theme/colors", icon: "🟣" },
    { name: "Notifications", path: "/admin/notifications", icon: "🔔" },
    { name: "Settings", path: "/admin/settings", icon: "⚙️" },

    { name: "Qikink Settings", path: "/admin/settings/qikink", icon: "🛠️" },
    { name: "Login Page", path: "/login", icon: "🔐" },
  ];

  return (
    <div>

      {/* HEADER */}
      <div className="glass card glow">
        <h1 className="text-primary">⚙️ Admin Panel</h1>
        <p className="text-muted">Manage your entire app</p>
      </div>

      {/* GRID */}
      <div className="admin-grid-icon">
        {pages.map((item, i) => (
          <div
            key={i}
            className="admin-tile glass"
            onClick={() => router.push(item.path)}
          >
            <div className="admin-icon">{item.icon}</div>
            <div className="admin-label">{item.name}</div>
          </div>
        ))}
      </div>

    </div>
  );
}
