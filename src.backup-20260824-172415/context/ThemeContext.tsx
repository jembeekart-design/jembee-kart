"use client";
import { createContext, useContext, useState, useEffect } from "react";
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
        setTheme(config.theme as Theme);
    }
  }, [config.theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
