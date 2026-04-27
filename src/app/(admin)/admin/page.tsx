'use client';

import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();

  const pages = [
    // ADMIN CORE
    { name: "Dashboard", path: "/admin" },
    { name: "Products", path: "/products" },
    { name: "Import Qikink", path: "/products/import-qikink" },
    { name: "Edit Product", path: "/products/edit/1" },

    // ORDERS
    { name: "Orders", path: "/orders" },
    { name: "Order Details", path: "/orders/1" },
    { name: "Qikink Sync", path: "/orders/qikink-sync" },

    // CATEGORY
    { name: "Categories", path: "/categories" },

    // MARKETING
    { name: "Festival Banner", path: "/marketing/festival-banner" },
    { name: "Add Banner", path: "/marketing/festival-banner/add" },
    { name: "Edit Banner", path: "/marketing/festival-banner/edit/1" },

    { name: "Flash Sale", path: "/marketing/flash-sale" },
    { name: "Add Flash Sale", path: "/marketing/flash-sale/add" },

    { name: "Offers", path: "/marketing/offers" },

    // THEME
    { name: "Theme Settings", path: "/theme" },
    { name: "Theme Colors", path: "/theme/colors" },

    // NOTIFICATION
    { name: "Notifications", path: "/notifications" },

    // SETTINGS
    { name: "Settings", path: "/settings" },
    { name: "Qikink Settings", path: "/settings/qikink" },

    // AUTH
    { name: "Login Page", path: "/login" },
  ];

  return (
    <div style={{ padding: 20 }}>

      <h1 className="text-primary">⚙️ Admin Panel</h1>
      <p className="text-muted">Manage your entire app from here</p>

      {/* 🔥 BUTTON GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 15,
          marginTop: 20,
        }}
      >
        {pages.map((item, i) => (
          <button
            key={i}
            onClick={() => router.push(`/admin${item.path}`)}
            className="btn btn-primary"
            style={{
              padding: "20px",
              borderRadius: "var(--radius)",
              background: "var(--primary)",
              color: "#fff",
              boxShadow: "0 0 15px var(--primary)",
              textAlign: "center",
              fontSize: 14,
            }}
          >
            {item.name}
          </button>
        ))}
      </div>

    </div>
  );
}
