"use client";

type Role = "admin" | "seller" | "user";

export const useRole = () => {
  // 🔥 future: Firebase / auth से आएगा
  const role: Role = "admin";

  return {
    role,
    isAdmin: role === "admin",
    isSeller: role === "seller",
  };
};
