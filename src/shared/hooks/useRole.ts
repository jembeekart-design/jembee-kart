"use client";

export const useRole = () => {
  const role = "admin"; // future: from Firebase/Auth

  return {
    isAdmin: role === "admin",
    isSeller: role === "seller",
  };
};
