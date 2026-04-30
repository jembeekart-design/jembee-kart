"use client";

// src/shared/auth/authProvider.tsx

import React, { createContext, useContext, useEffect, useState } from "react";
import { onUserChange } from "../firebase/auth";
import { getUserRole } from "../firebase/auth";
import { saveSession, clearSession } from "./session";

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onUserChange(async (firebaseUser: any) => {
      if (firebaseUser) {
        const role = await getUserRole(firebaseUser.uid);

        setUser(firebaseUser);
        setRole(role);
        saveSession({ ...firebaseUser, role });
      } else {
        setUser(null);
        setRole("user");
        clearSession();
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);