"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation"; // usePathname import karein
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase/config";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname(); // Current page ka path check karne ke liye
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // Agar user login page par hai, toh redirect mat karo
      if (pathname === "/admin/login") {
        setLoading(false);
        return;
      }

      if (!user) {
        router.replace("/admin/login");
      } else {
        setLoading(false);
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
