"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import type { Theme } from "@/types/theme";

interface ThemeContextType {
  theme: Theme;
  setTheme: React.Dispatch<React.SetStateAction<Theme>>;
}

export const ThemeContext = createContext<ThemeContextType>({} as ThemeContextType);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>({} as Theme);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTheme() {
      try {
        const docSnap = await getDoc(doc(db, "admin_settings", "customize"));
        if (docSnap.exists()) {
          setTheme(docSnap.data() as Theme);
        }
      } catch (error) {
        console.error("Theme load error:", error);
      } finally {
        setLoading(false);
      }
    }
    loadTheme();
  }, []);

  useEffect(() => {
    if (!theme || Object.keys(theme).length === 0) return;
    const root = document.documentElement;
    // Saare CSS Variables yahan define karein
    root.style.setProperty("--primary-color", theme.primaryColor);
    root.style.setProperty("--background-color", theme.backgroundColor);
    root.style.setProperty("--text-color", theme.textColor);
  }, [theme]);

  if (loading) return null;

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
