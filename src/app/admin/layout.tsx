"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase/config";

import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminNavbar from "@/components/admin/AdminNavbar";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/admin/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <div className="flex min-h-screen bg-[#090909] text-white">

      {/* Sidebar */}
      <aside className="hidden lg:flex">
        <AdminSidebar />
      </aside>

      {/* Main Section */}
      <div className="flex flex-1 flex-col min-w-0">

        {/* Navbar */}
        <header className="sticky top-0 z-40">
          <AdminNavbar />
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto w-full max-w-[1800px]">
            {children}
          </div>
        </main>

      </div>

    </div>
  );
}
