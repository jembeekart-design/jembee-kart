import type { ReactNode } from "react";

import AdminSidebar from "@/components/admin/AdminSidebar";

import AdminNavbar from "@/components/admin/AdminNavbar";

export default function AdminLayout({
  children
}: {
  children: ReactNode;
}) {

  return (

    <div className="flex min-h-screen bg-[#090909]">

      {/* SIDEBAR */}

      <AdminSidebar />

      {/* MAIN AREA */}

      <div className="flex flex-1 flex-col">

        {/* NAVBAR */}

        <AdminNavbar />

        {/* PAGE CONTENT */}

        <main className="flex-1 overflow-y-auto p-4">

          {children}

        </main>

      </div>

    </div>

  );

}
