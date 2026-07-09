"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
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
        // Firestore se user document lao
        const userDoc = await getDoc(doc(db, "users", user.uid));

        if (!userDoc.exists()) {
          router.replace("/");
          return;
        }

        const role = userDoc.data().role;

        // Sirf admin aur super_admin allow
        if (role !== "admin" && role !== "super_admin") {
          router.replace("/");
          return;
        }

        // Sab sahi hai
        setLoading(false);
      } catch (error) {
        console.error(error);
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
