"use client";

import { useAuth } from "@/hooks/useAuth";

export const ProfileScreen = () => {
  const { user } = useAuth();

  return (
    <div style={{ padding: 20, color: "white" }}>
      <h2>Profile</h2>

      <p>{user?.name}</p>
    </div>
  );
};