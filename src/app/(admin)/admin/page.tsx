'use client';

import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();

  const pages = [
    { name: "Dashboard", path: "/admin" },
    { name: "Products", path: "/products" },
    { name: "Import Qikink", path: "/products/import-qikink" },
    { name: "Edit Product", path: "/products/edit/1" },

    { name: "Orders", path: "/orders" },
    { name: "Order Details", path: "/orders/1" },
    { name: "Qikink Sync", path: "/orders/qikink-sync" },

    { name: "Categories", path: "/categories" },

    { name: "Festival Banner", path: "/marketing/festival-banner" },
    { name: "Add Banner", path: "/marketing/festival-banner/add" },
    { name: "Edit Banner", path: "/marketing/festival-banner/edit/1" },

    { name: "Flash Sale", path: "/marketing/flash-sale" },
    { name: "Add Flash Sale", path: "/marketing/flash-sale/add" },

    { name: "Offers", path: "/marketing/offers" },

    { name: "Theme Settings", path: "/theme" },
    { name: "Theme Colors", path: "/theme/colors" },

    { name: "Notifications", path: "/notifications" },

    { name: "Settings", path: "/settings" },
    { name: "Qikink Settings", path: "/settings/qikink" },

    { name: "Login Page", path: "/login" },
  ];

  return (
    <div className="admin-container">

      {/* 🔥 Header */}
      <div className="glass card header">
        <h1 className="text-primary">⚙️ Admin Panel</h1>
        <p className="text-muted">Manage your entire app from here</p>
      </div>

      {/* 🔥 Grid */}
      <div className="grid">
        {pages.map((item, i) => (
          <button
            key={i}
            onClick={() => router.push(`/admin${item.path}`)}
            className="glass button-card"
          >
            {item.name}
          </button>
        ))}
      </div>

    </div>
  );
}
