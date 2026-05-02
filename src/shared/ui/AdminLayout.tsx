"use client";

export const AdminLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="flex min-h-screen bg-background text-white">
      {/* Sidebar */}
      <div className="w-64 bg-surface p-5 border-r border-white/10">
        <h1 className="text-xl font-bold mb-6">Jembee Admin</h1>

        <ul className="space-y-3">
          <li className="hover:text-primary cursor-pointer">Dashboard</li>
          <li className="hover:text-primary cursor-pointer">Orders</li>
          <li className="hover:text-primary cursor-pointer">Products</li>
          <li className="hover:text-primary cursor-pointer">Users</li>
          <li className="hover:text-primary cursor-pointer">Settings</li>
        </ul>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">{children}</div>
    </div>
  );
};
