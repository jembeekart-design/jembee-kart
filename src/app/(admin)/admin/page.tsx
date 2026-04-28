'use client';

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<number | null>(null);

  const sections = [
    {
      title: "📊 Dashboard & Analytics",
      items: [
        { name: "Dashboard", path: "/admin/dashboard", icon: "📊" },
        { name: "Analytics", path: "/admin/analytics", icon: "📈" },
        { name: "Reports", path: "/admin/analytics", icon: "📑" },
      ],
    },
    {
      title: "📦 Product Management",
      items: [
        { name: "All Products", path: "/admin/products", icon: "📦" },
        { name: "Add Product", path: "/admin/products", icon: "➕" },
        { name: "Edit Product", path: "/admin/products", icon: "✏️" },
        { name: "Import Qikink", path: "/admin/qikink", icon: "⬇️" },
      ],
    },
    {
      title: "🧾 Orders System",
      items: [
        { name: "Orders", path: "/admin/orders", icon: "🧾" },
        { name: "Order Details", path: "/admin/orders", icon: "📄" },
        { name: "Track Orders", path: "/admin/orders", icon: "🚚" },
        { name: "Sync Orders", path: "/admin/qikink", icon: "🔄" },
      ],
    },
    {
      title: "🤝 Affiliate System",
      items: [
        { name: "Sellers", path: "/admin/sellers", icon: "🧑‍💼" },
        { name: "Payout Requests", path: "/admin/payouts", icon: "💰" },
        { name: "Approve Payout", path: "/admin/payouts", icon: "✅" },
      ],
    },
    {
      title: "🎯 Marketing & Growth",
      items: [
        { name: "Banners", path: "/admin/banners", icon: "🖼️" },
        { name: "Add Banner", path: "/admin/banners", icon: "➕" },
        { name: "Coupons", path: "/admin/coupons", icon: "🏷️" },
        { name: "Flash Sale", path: "/admin/settings", icon: "⚡" },
        { name: "Offers", path: "/admin/coupons", icon: "🎁" },
      ],
    },
    {
      title: "⚙️ System Control",
      items: [
        { name: "Settings", path: "/admin/settings", icon: "⚙️" },
        { name: "Theme Settings", path: "/admin/settings", icon: "🎨" },
        { name: "Theme Colors", path: "/admin/settings", icon: "🟣" },
        { name: "Notifications", path: "/admin/settings", icon: "🔔" },
        { name: "Security", path: "/admin/settings", icon: "🔐" },
      ],
    },
    {
      title: "🔄 Integrations",
      items: [
        { name: "Qikink Settings", path: "/admin/qikink", icon: "🛠️" },
        { name: "Sync Products", path: "/admin/qikink", icon: "🔁" },
        { name: "Sync Orders", path: "/admin/qikink", icon: "🔄" },
      ],
    },
  ];

  const handleNavigate = (path: string, index: number) => {
    setLoading(index);

    setTimeout(() => {
      router.push(path);
      setLoading(null);
    }, 200);
  };

  return (
    <div>

      {/* 🔥 HEADER */}
      <div className="glass card glow">
        <h1 className="text-primary">⚙️ Admin Panel</h1>
        <p className="text-muted">Full control of your business</p>
      </div>

      {/* 🔥 QUICK STATS */}
      <div className="admin-grid-icon">
        <div className="admin-tile glass">
          <div className="admin-icon">💰</div>
          <div className="admin-label">₹12,450 Revenue</div>
        </div>
        <div className="admin-tile glass">
          <div className="admin-icon">🧾</div>
          <div className="admin-label">120 Orders</div>
        </div>
        <div className="admin-tile glass">
          <div className="admin-icon">👥</div>
          <div className="admin-label">35 Users</div>
        </div>
        <div className="admin-tile glass">
          <div className="admin-icon">🔥</div>
          <div className="admin-label">Flash Active</div>
        </div>
      </div>

      {/* 🔥 FULL SECTIONS */}
      {sections.map((section, sIndex) => (
        <div key={sIndex} style={{ marginTop: "25px" }}>

          <h3 className="text-primary" style={{ marginBottom: "10px" }}>
            {section.title}
          </h3>

          <div className="admin-grid-icon">
            {section.items.map((item, i) => {
              const index = sIndex * 20 + i;

              return (
                <div
                  key={i}
                  className="admin-tile glass"
                  onClick={() => handleNavigate(item.path, index)}
                  style={{
                    opacity: loading === index ? 0.6 : 1,
                  }}
                >
                  <div className="admin-icon">
                    {loading === index ? "⏳" : item.icon}
                  </div>

                  <div className="admin-label">
                    {item.name}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      ))}

    </div>
  );
}
