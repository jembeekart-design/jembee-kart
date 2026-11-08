"use client";

import { createContext, useContext, useState } from "react";
import type { Theme } from "@/types/theme";

const JEMBEE_SHORTS_THEME = {
  primaryColor: "#06B6D4",
  secondaryColor: "#8B5CF6",
  backgroundColor: "#05070B",
  surfaceColor: "#111827",
  cardColor: "#111827",
  textColor: "#F8FAFC",
  headingColor: "#F8FAFC",
  subTextColor: "#CBD5E1",
  mutedTextColor: "#94A3B8",
  borderColor: "#263244",
  buttonColor: "#06B6D4",
  buttonHoverColor: "#0891B2",
  buttonTextColor: "#03131A",
  darkMode: true,
} as unknown as Theme;

interface ThemeContextType {
  theme: Theme;
  setTheme: React.Dispatch<React.SetStateAction<Theme>>;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: JEMBEE_SHORTS_THEME,
  setTheme: () => undefined,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(JEMBEE_SHORTS_THEME);
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
