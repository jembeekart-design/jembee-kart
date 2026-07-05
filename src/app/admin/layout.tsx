"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "@/firebase/config";

import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminNavbar from "@/components/admin/AdminNavbar";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (!user) {
          router.replace("/admin/login");
          return;
        }

        const userRef = doc(db, "users", user.uid);
        let userSnap = await getDoc(userRef);

        // Auto create user document
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            uid: user.uid,
            email: user.email ?? "",
            displayName: user.displayName ?? "",
            photoURL: user.photoURL ?? "",
            role: "user",
            isActive: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });

          userSnap = await getDoc(userRef);
        }

        const userData = userSnap.data();

        const allowed =
          userData?.role === "admin" ||
          userData?.role === "super_admin";

        if (!allowed) {
          router.replace("/admin/login");
          return;
        }

        setAuthorized(true);
      } catch (error) {
        console.error("Admin Auth Error:", error);
        router.replace("/admin/login");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#090909] text-white text-lg font-semibold">
        Checking Authorization...
      </div>
    );
  }

  if (!authorized) return null;

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
