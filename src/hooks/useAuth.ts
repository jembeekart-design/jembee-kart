import { useAuthStore } from "@/store/auth.store";

export const useAuth = () => {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  return {
    user,
    setUser,
  };
};

// THEME ADMIN PANEL SE CHANGE HOGA
