'use client';

import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();

  const pages = [
    { name: "Dashboard", path: "/admin" },
    { name: "Products", path: "/admin/products" },
    { name: "Import Qikink", path: "/admin/products/import-qikink" },

    { name: "Edit Product", path: "/admin/products/edit/1" },
    { name: "Orders", path: "/admin/orders" },
    { name: "Order Details", path: "/admin/orders/1" },

    { name: "Qikink Sync", path: "/admin/orders/qikink-sync" },
    { name: "Categories", path: "/admin/categories" },
    { name: "Festival Banner", path: "/admin/marketing/festival-banner" },

    { name: "Add Banner", path: "/admin/marketing/festival-banner/add" },
    { name: "Edit Banner", path: "/admin/marketing/festival-banner/edit/1" },
    { name: "Flash Sale", path: "/admin/marketing/flash-sale" },

    { name: "Add Flash Sale", path: "/admin/marketing/flash-sale/add" },
    { name: "Offers", path: "/admin/marketing/offers" },
    { name: "Theme Settings", path: "/admin/theme" },

    { name: "Theme Colors", path: "/admin/theme/colors" },
    { name: "Notifications", path: "/admin/notifications" },
    { name: "Settings", path: "/admin/settings" },

    { name: "Qikink Settings", path: "/admin/settings/qikink" },
    { name: "Login Page", path: "/login" },
  ];

  return (
    <div>

      <div className="glass card glow">
        <h1 className="text-primary">⚙️ Admin Panel</h1>
        <p className="text-muted">Manage your entire app</p>
      </div>

      <div className="admin-grid">
        {pages.map((item, i) => (
          <button
            key={i}
            className="admin-btn"
            onClick={() => router.push(item.path)}
          >
            {item.name}
          </button>
        ))}
      </div>

    </div>
  );
}
