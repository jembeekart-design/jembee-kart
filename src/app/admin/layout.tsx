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
      if (!user) {
        router.replace("/login");
        return;
      }
console.log("Auth UID:", user.uid);
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);
console.log("Exists:", snap.exists());
      if (!snap.exists()) {
        router.replace("/");
        return;
      }

      const data = snap.data();

console.log("User Data:", data);
console.log("Role:", data.role);


      if (data.role !== "admin" && data.role !== "super_admin") {
        router.replace("/");
        return;
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  return <>{children}</>;
}
