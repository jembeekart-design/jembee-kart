"use client";
import { createContext, useContext, useState, useEffect } from "react";
import type { Theme } from "@/types/theme";

interface ThemeContextType {
  theme: Theme;
  setTheme: React.Dispatch<React.SetStateAction<Theme>>;
}

export const ThemeContext = createContext<ThemeContextType>({} as ThemeContextType);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Initial state ko 'as Theme' cast karna zaroori ho sakta hai agar default values kam hain
  const [theme, setTheme] = useState<Theme>({} as Theme);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
