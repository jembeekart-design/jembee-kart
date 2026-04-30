"use client";

// src/shared/auth/authGuard.tsx

import { useAuth } from "./authProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const AuthGuard = ({ children, requiredRole }: any) => {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) router.push("/login");
      if (requiredRole && role !== requiredRole) router.push("/");
    }
  }, [user, role, loading]);

  if (loading) return <div className="text-white">Loading...</div>;

  return children;
};