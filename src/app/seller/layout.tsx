"use client";

export default function SellerLayout({ children }: any) {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "linear-gradient(135deg,#020617,#0f172a)",
        color: "white",
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: 250,
          padding: 20,
          backdropFilter: "blur(var(--glass-blur))",
          background: "rgba(255,255,255,var(--glass-opacity))",
        }}
      >
        <h2>Seller Panel</h2>

        <div onClick={() => (location.href = "/seller/dashboard")}>Dashboard</div>
        <div onClick={() => (location.href = "/seller/products")}>Products</div>
        <div onClick={() => (location.href = "/seller/orders")}>Orders</div>
        <div onClick={() => (location.href = "/seller/earnings")}>Earnings</div>
        <div onClick={() => (location.href = "/seller/affiliate")}>Affiliate</div>
        <div onClick={() => (location.href = "/seller/analytics")}>Analytics</div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: 20 }}>{children}</div>
    </div>
  );
}