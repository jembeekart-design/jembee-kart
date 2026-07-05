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
  const [debug, setDebug] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (!user) {
          setDebug("❌ User not logged in");
          setLoading(false);
          return;
        }

        const userRef = doc(db, "users", user.uid);
        let userSnap = await getDoc(userRef);

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

        const allowedRoles = [
          "admin",
          "super_admin",
        ];

        setDebug(`
UID:
${user.uid}

EMAIL:
${user.email}

DOCUMENT EXISTS:
${userSnap.exists()}

ROLE:
${userData?.role}

ALLOWED:
${allowedRoles.includes(userData?.role)}

FULL DATA:

${JSON.stringify(userData, null, 2)}
`);

        if (!allowedRoles.includes(userData?.role)) {
          setLoading(false);
          return;
        }

        setAuthorized(true);
      } catch (e) {
        setDebug(String(e));
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black text-white">
        Loading...
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <h1 className="text-3xl font-bold mb-6">
          ADMIN DEBUG
        </h1>

        <pre className="whitespace-pre-wrap text-sm">
          {debug}
        </pre>
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
