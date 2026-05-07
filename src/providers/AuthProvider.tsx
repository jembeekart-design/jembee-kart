"use client";

import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext(null);

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    console.log("Auth Initialized");
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// THEME ADMIN PANEL SE CHANGE HOGA
