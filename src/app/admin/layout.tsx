"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/firebase/config";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // 1. Check if user is logged in
      if (!user) {
        router.replace("/login");
        return;
      }

      try {
        // 2. Fetch user document from Firestore
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);

        // 3. Verify user exists and has admin role
        if (!snap.exists()) {
          router.replace("/");
          return;
        }

        const userData = snap.data();
        const isAdmin = userData.role === "admin" || userData.role === "super_admin";

        if (!isAdmin) {
          router.replace("/");
          return;
        }

        // 4. Everything is valid, stop loading
        setLoading(false);
      } catch (error) {
        console.error("Error verifying admin:", error);
        router.replace("/");
      }
    });

    return () => unsubscribe();
  }, [router]);

  // 5. Show loading state until auth/admin check completes
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading Admin Dashboard...</p>
      </div>
    );
  }

  return <>{children}</>;
}
