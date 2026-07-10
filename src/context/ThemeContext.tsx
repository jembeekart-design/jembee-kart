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
    // Agar theme empty hai toh ruk jayein
    if (!theme || Object.keys(theme).length === 0) return;

    const root = document.documentElement;

    // 1. Colors
    root.style.setProperty("--primary-color", theme.primaryColor);
    root.style.setProperty("--secondary-color", theme.secondaryColor);
    root.style.setProperty("--background-color", theme.backgroundColor);
    root.style.setProperty("--surface-color", theme.surfaceColor);
    root.style.setProperty("--card-color", theme.cardColor);
    root.style.setProperty("--text-color", theme.textColor);
    root.style.setProperty("--muted-text-color", theme.mutedTextColor);
    root.style.setProperty("--border-color", theme.borderColor);
    
    // 2. Buttons & Interaction
    root.style.setProperty("--button-text-color", theme.buttonTextColor);
    root.style.setProperty("--hover-color", theme.hoverColor);
    
    // 3. Spacing & Shapes
    root.style.setProperty("--border-radius", typeof theme.borderRadius === 'number' ? `${theme.borderRadius}px` : theme.borderRadius);
    root.style.setProperty("--button-radius", `${theme.buttonRadius}px`);
    root.style.setProperty("--card-radius", `${theme.cardRadius}px`);
    
    // 4. Typography
    root.style.setProperty("--font-family", theme.fontFamily);
    root.style.setProperty("--heading-size", `${theme.headingSize}px`);
    root.style.setProperty("--body-size", `${theme.bodySize}px`);

  }, [theme]);

  if (loading) return null;

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
