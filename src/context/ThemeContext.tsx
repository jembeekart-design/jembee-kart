"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import type { Theme } from "@/types/theme";

// Default theme object (taaki build time par empty na rahe)
const defaultTheme: Theme = {
  primaryColor: "#3b82f6",
  secondaryColor: "#64748b",
  backgroundColor: "#ffffff",
  surfaceColor: "#f8fafc",
  cardColor: "#ffffff",
  textColor: "#0f172a",
  // ... baki sabhi required fields default values ke saath
} as Theme;

interface ThemeContextType {
  theme: Theme;
  setTheme: React.Dispatch<React.SetStateAction<Theme>>;
}

export const ThemeContext = createContext<ThemeContextType>({} as ThemeContextType);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // useState ko 'defaultTheme' se initialize karein, 'null' se nahi
  const [theme, setTheme] = useState<Theme>(defaultTheme);
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
    const root = document.documentElement;
    root.style.setProperty("--primary-color", theme.primaryColor);
    root.style.setProperty("--secondary-color", theme.secondaryColor);
    // ... baki properties
  }, [theme]);

  // Loading state handling
  if (loading) return null; 

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
