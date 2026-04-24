'use client';

import { useEffect, useState } from "react";
import { onAuthChange } from "@/lib/auth";
import { User } from "firebase/auth";

export default function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ✅ Admin check (basic for now)
  const isAdmin =
    typeof window !== "undefined" &&
    localStorage.getItem("isAdmin") === "true";

  return {
    user,
    loading,
    isAdmin,
  };
}
