"use client";

import { useEffect, useState } from "react";

type Role = "admin" | "seller" | "user" | null;

export const useRole = () => {
  const [role, setRole] = useState<Role>(null);

  useEffect(() => {
    // 👉 future: Firebase / API से आएगा
    const savedRole = localStorage.getItem("role") as Role;
    setRole(savedRole || "user");
  }, []);

  return {
    role,
    isAdmin: role === "admin",
    isSeller: role === "seller",
  };
};
