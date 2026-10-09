"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase/config";
import { useAdminConfig } from "@/lib/admin-config/provider";
import type { Theme } from "@/types/theme";

interface ThemeContextType {
  theme: Theme;
  setTheme: React.Dispatch<React.SetStateAction<Theme>>;
}

export const ThemeContext = createContext<ThemeContextType>({} as ThemeContextType);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { config } = useAdminConfig();
  const [theme, setTheme] = useState<Theme>(config.theme as Theme);

  useEffect(() => {
    if (config.theme) {
      setTheme((previous) => ({
        ...config.theme,
        headerBackground: previous.headerBackground ?? config.theme.headerBackground,
        searchBarColor: previous.searchBarColor ?? config.theme.searchBarColor,
        buttonColor: previous.buttonColor ?? config.theme.buttonColor,
        cardBorderColor: previous.cardBorderColor ?? config.theme.cardBorderColor,
      } as Theme));
    }
  }, [config.theme]);

  useEffect(() => {
    const ref = doc(db, "admin_settings", "customize");

    const unsubscribe = onSnapshot(ref, (snap) => {
      if (!snap.exists()) return;

      const saved = snap.data();

      setTheme((previous) => ({
        ...previous,
        headerBackground: saved.headerBackground ?? previous.headerBackground,
        searchBarColor: saved.searchBarColor ?? previous.searchBarColor,
        buttonColor: saved.buttonColor ?? previous.buttonColor,
        cardBorderColor: saved.cardBorderColor ?? previous.cardBorderColor,
      } as Theme));
    });

    return () => unsubscribe();
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
