"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "@/firebase/config";

import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminNavbar from "@/components/admin/AdminNavbar";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();

  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (!user) {
          router.replace("/admin/login");
          return;
        }

        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          router.replace("/admin/login");
          return;
        }

        const userData = userSnap.data();

        const allowedRoles = [
          "super_admin",
          "admin",
        ];

        if (!allowedRoles.includes(userData.role)) {
          router.replace("/403");
          return;
        }

        setAuthorized(true);
      } catch (error) {
        console.error("Admin Authentication Error:", error);
        router.replace("/admin/login");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#090909] text-white">
        Checking Authorization...
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-[#090909] text-white">

      {/* Sidebar */}
      <aside className="hidden lg:flex">
        <AdminSidebar />
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col min-w-0">

        {/* Navbar */}
        <header className="sticky top-0 z-40">
          <AdminNavbar />
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto w-full max-w-[1800px]">
            {children}
          </div>
        </main>

      </div>

    </div>
  );
}
