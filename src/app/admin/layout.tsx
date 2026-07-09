"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { auth, db } from "@/firebase/config";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // Admin login page ko allow karo
      if (pathname === "/admin/login") {
        setLoading(false);
        return;
      }

      // Login nahi hai
      if (!user) {
        router.replace("/admin/login");
        return;
      }

      try {
        // Firestore me uid se user search karo
        const q = query(
          collection(db, "users"),
          where("uid", "==", user.uid)
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          router.replace("/");
          return;
        }

        const userData = snapshot.docs[0].data();
        const role = userData.role;

        // Sirf admin aur super_admin allow
        if (role !== "admin" && role !== "super_admin") {
          router.replace("/");
          return;
        }

        setLoading(false);
      } catch (error) {
        console.error("Admin Auth Error:", error);
        router.replace("/");
      }
    });

    return () => unsubscribe();
  }, [router, pathname]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900 text-green-400">
        Loading...
      </div>
    );
  }

  return <>{children}</>;
}
