"use client";

import { useEffect, useState } from "react";
import { userStore } from "@/shared/store/userStore";

export const useAuth = () => {
  const [state, setState] = useState(userStore.get());

  useEffect(() => {
    return userStore.subscribe(setState);
  }, []);

  return {
    user: state.user,
    loading: state.loading,
    login: userStore.setUser,
    logout: userStore.logout,
  };
};