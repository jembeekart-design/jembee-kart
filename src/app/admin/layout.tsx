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
        console.log("========== ADMIN DEBUG ==========");

        if (!user) {
          console.log("❌ User not logged in");
          router.replace("/admin/login");
          return;
        }

        console.log("✅ Firebase User:", user);
        console.log("UID:", user.uid);
        console.log("Email:", user.email);

        const userRef = doc(db, "users", user.uid);

        let userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          console.log("⚠ User document not found");
          console.log("Creating new document...");

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

          console.log("✅ Document Created");

          userSnap = await getDoc(userRef);
        }

        const userData = userSnap.data();

        console.log("Firestore Document:", userData);
        console.log("Firestore UID:", userData?.uid);
        console.log("Firestore Email:", userData?.email);
        console.log("Firestore Role:", userData?.role);

        const allowedRoles = [
          "admin",
          "super_admin",
        ];

        console.log("Allowed Roles:", allowedRoles);

        if (!allowedRoles.includes(userData?.role)) {
          console.log("❌ ACCESS DENIED");
          console.log("Current Role:", userData?.role);

          router.replace("/403");
          return;
        }

        console.log("✅ ADMIN ACCESS GRANTED");

        setAuthorized(true);
      } catch (err) {
        console.error("🔥 Admin Authentication Error");
        console.error(err);

        router.replace("/admin/login");
      } finally {
        console.log("========== END DEBUG ==========");
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
