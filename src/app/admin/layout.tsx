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
        let userSnap = await getDoc(userRef);

        // Auto create document
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

        const allowedRoles = ["admin", "super_admin"];

        if (!allowedRoles.includes(userData?.role)) {
          router.replace("/403");
          return;
        }

        setAuthorized(true);
      } catch (error) {
        console.error(error);
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

  if (!authorized) return null;

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
