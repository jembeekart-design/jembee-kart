"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase/config";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (pathname === "/admin/login") {
      setLoading(false);
      setError("");
      return;
    }

    let active = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!active) return;

      setLoading(true);
      setError("");

      if (!user) {
        router.replace("/admin/login");
        return;
      }

      try {
        const token = await user.getIdToken();

        const response = await fetch("/api/auth/admin-check", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        if (!active) return;

        if (response.status === 401 || response.status === 403) {
          router.replace("/");
          return;
        }

        if (!response.ok) {
          setError("Admin verification failed. Please try again.");
          setLoading(false);
          return;
        }

        const result = await response.json();

        if (result.isAdmin !== true) {
          router.replace("/");
          return;
        }

        setLoading(false);
      } catch (err) {
        console.error("Admin Auth Error:", err);
        if (active) {
          setError("Admin verification failed. Check your connection and retry.");
          setLoading(false);
        }
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [router, pathname]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--card-color)] text-[var(--success-color)]">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="rounded bg-black px-4 py-2 text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
