"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";

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
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        console.log("========== ADMIN AUTH ==========");

        if (!user) {
          console.log("No Logged In User");
          setAuthorized(false);
          setLoading(false);
          return;
        }

        console.log("UID:", user.uid);
        console.log("Email:", user.email);

        const snap = await getDoc(doc(db, "users", user.uid));

        if (!snap.exists()) {
          console.log("User document not found");
          setAuthorized(false);
          setLoading(false);
          return;
        }

        const data = snap.data();

        console.log("Firestore Data:", data);

        const allowed =
          data.role === "admin" ||
          data.role === "super_admin";

        console.log("Role:", data.role);
        console.log("Allowed:", allowed);

        setAuthorized(allowed);
      } catch (err) {
        console.error("Admin Error:", err);
        setAuthorized(false);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black text-white text-xl">
        Checking Authorization...
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-black text-white">
        <h1 className="text-4xl font-bold text-red-500">
          Access Denied
        </h1>

        <p className="mt-4 text-gray-400">
          You are not an Admin.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#090909] text-white">

      <aside className="hidden lg:flex">
        <AdminSidebar />
      </aside>

      <div className="flex flex-1 flex-col min-w-0">

        <header className="sticky top-0 z-40">
          <AdminNavbar />
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto w-full max-w-[1800px]">
            {children}
          </div>
        </main>

      </div>

    </div>
  );
}
