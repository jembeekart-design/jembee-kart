"use client";

import { AdminLayout } from "@/shared/ui/AdminLayout";
import { AdminChart } from "@/shared/ui/AdminChart";
import { OrdersTable } from "@/shared/ui/OrdersTable";
import { ProductManager } from "@/shared/ui/ProductManager";
import { NotificationBell } from "@/shared/ui/NotificationBell";
import { useRole } from "@/hooks/useRole";

export default function Dashboard() {
  const { isAdmin } = useRole();

  if (!isAdmin) {
    return <div>Access Denied</div>;
  }

  return (
    <AdminLayout>
      {/* Top bar */}
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <NotificationBell />
      </div>

      {/* Chart */}
      <AdminChart />

      {/* Orders */}
      <OrdersTable />

      {/* Product */}
      <ProductManager />
    </AdminLayout>
  );
}
