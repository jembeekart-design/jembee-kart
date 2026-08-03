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

    // 1. Legacy & Direct Colors
    if (theme.primaryColor) root.style.setProperty("--primary-color", theme.primaryColor);
    if (theme.secondaryColor) root.style.setProperty("--secondary-color", theme.secondaryColor);
    if (theme.backgroundColor) root.style.setProperty("--background-color", theme.backgroundColor);
    if (theme.surfaceColor) root.style.setProperty("--surface-color", theme.surfaceColor);
    if (theme.cardColor) root.style.setProperty("--card-color", theme.cardColor);
    if (theme.textColor) root.style.setProperty("--text-color", theme.textColor);
    if (theme.mutedTextColor) root.style.setProperty("--muted-text-color", theme.mutedTextColor);
    if (theme.borderColor) root.style.setProperty("--border-color", theme.borderColor);

    // 2. Modern Semantic Theme Tokens Mapping (Fixes background & surface color bugs)
    root.style.setProperty("--color-page-background", theme.pageBackground || theme.backgroundColor || "#0f172a");
    root.style.setProperty("--color-card-background", theme.cardBackground || theme.cardColor || "#1e293b");
    root.style.setProperty("--color-surface", theme.surfaceColor || "#334155");
    root.style.setProperty("--color-primary-button", theme.primaryButtonColor || theme.buttonColor || theme.primaryColor || "#3b82f6");
    root.style.setProperty("--color-secondary-button", theme.secondaryButtonColor || theme.secondaryColor || "#64748b");
    root.style.setProperty("--text-primary", theme.textColor || theme.primaryColor || "#f8fafc");
    root.style.setProperty("--text-secondary", theme.textSecondary || theme.mutedTextColor || "#cbd5e1");
    root.style.setProperty("--color-border", theme.borderColor || "#334155");
    root.style.setProperty("--color-header", theme.headerBackground || theme.cardColor || "#1e293b");
    root.style.setProperty("--color-input-background", theme.inputBackground || theme.cardColor || "#1e293b");

    // 3. Buttons & Interaction
    if (theme.buttonTextColor) root.style.setProperty("--button-text-color", theme.buttonTextColor);
    if (theme.hoverColor) root.style.setProperty("--hover-color", theme.hoverColor);
    if (theme.buttonColor) root.style.setProperty("--button-color", theme.buttonColor);
    if (theme.buttonHoverColor) root.style.setProperty("--button-hover-color", theme.buttonHoverColor);

    // 4. Spacing & Shapes
    if (theme.borderRadius !== undefined) {
      root.style.setProperty("--border-radius", typeof theme.borderRadius === 'number' ? `${theme.borderRadius}px` : theme.borderRadius);
    }
    if (theme.buttonRadius !== undefined) {
      root.style.setProperty("--button-radius", `${theme.buttonRadius}px`);
    }
    if (theme.cardRadius !== undefined) {
      root.style.setProperty("--card-radius", `${theme.cardRadius}px`);
    }
    
    // 5. Typography
    if (theme.fontFamily) root.style.setProperty("--font-family", theme.fontFamily);
    if (theme.headingSize) root.style.setProperty("--heading-size", `${theme.headingSize}px`);
    if (theme.bodySize) root.style.setProperty("--body-size", `${theme.bodySize}px`);

  }, [theme]);

  if (loading) return null;

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
