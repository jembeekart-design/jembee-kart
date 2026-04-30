"use client";

export default function AdminLayout({ children }: any) {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "linear-gradient(135deg,#0f172a,#1e293b)",
        color: "white",
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: 250,
          padding: 20,
          backdropFilter: "blur(12px)",
          background: "rgba(255,255,255,0.1)",
        }}
      >
        <h2>Admin</h2>

        <div onClick={() => (location.href = "/admin/dashboard")}>Dashboard</div>
        <div onClick={() => (location.href = "/admin/products")}>Products</div>
        <div onClick={() => (location.href = "/admin/orders")}>Orders</div>
        <div onClick={() => (location.href = "/admin/users")}>Users</div>
        <div onClick={() => (location.href = "/admin/analytics")}>Analytics</div>
        <div onClick={() => (location.href = "/admin/settings")}>Settings</div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: 20 }}>{children}</div>
    </div>
  );
}