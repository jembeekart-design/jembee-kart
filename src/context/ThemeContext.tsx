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

    // Build semantic tokens with safe fallbacks (admin-controlled)
    const pageBackground =
      (theme as any).pageBackground || theme.backgroundColor || theme.cardColor || theme.primaryColor || "#F8F9FE";
    const surface = (theme as any).surfaceColor || theme.cardColor || theme.backgroundColor || theme.primaryColor || "#FFFFFF";
    const cardBg = theme.cardColor || (theme as any).surfaceColor || theme.backgroundColor || "#FFFFFF";
    const sectionBg = (theme as any).sectionBackground || (theme as any).surfaceColor || theme.cardColor || theme.backgroundColor || "#F1F5F9";
    const headerBg = (theme as any).headerBackground || theme.primaryColor || (theme as any).surfaceColor || theme.cardColor || "#4F46E5";
    const inputBg = (theme as any).inputBackground || theme.cardColor || (theme as any).surfaceColor || "#FFFFFF";
    const border = theme.borderColor || (theme as any).cardBorderColor || "#E5E7EB";
    const primaryBtn = (theme as any).primaryButtonColor || theme.buttonColor || theme.primaryColor || "#4F46E5";
    const secondaryBtn = (theme as any).secondaryButtonColor || theme.secondaryColor || "#7C3AED";
    const textPrimary = theme.textColor || "#111827";
    const textSecondary = (theme as any).secondaryTextColor || theme.mutedTextColor || "#6B7280";
    const textMuted = theme.mutedTextColor || "#9CA3AF";
    const success = theme.successColor || "#10B981";
    const warning = theme.warningColor || "#F59E0B";
    const danger = theme.dangerColor || "#EF4444";

    // Preserve legacy variables (avoid breaking existing components)
    root.style.setProperty("--primary-color", theme.primaryColor || primaryBtn);
    root.style.setProperty("--secondary-color", theme.secondaryColor || secondaryBtn);
    root.style.setProperty("--background-color", theme.backgroundColor || pageBackground);
    root.style.setProperty("--card-color", cardBg);
    root.style.setProperty("--text-color", textPrimary);
    root.style.setProperty("--muted-text-color", textMuted);
    root.style.setProperty("--border-color", border);

    // New semantic tokens
    root.style.setProperty("--color-page-background", pageBackground);
    root.style.setProperty("--color-surface", surface);
    root.style.setProperty("--color-card-background", cardBg);
    root.style.setProperty("--color-section-background", sectionBg);
    root.style.setProperty("--color-header", headerBg);
    root.style.setProperty("--color-input-background", inputBg);
    root.style.setProperty("--color-border", border);
    root.style.setProperty("--color-primary-button", primaryBtn);
    root.style.setProperty("--color-secondary-button", secondaryBtn);
    root.style.setProperty("--text-primary", textPrimary);
    root.style.setProperty("--text-secondary", textSecondary);
    root.style.setProperty("--text-muted", textMuted);
    root.style.setProperty("--color-success", success);
    root.style.setProperty("--color-warning", warning);
    root.style.setProperty("--color-danger", danger);

    // Interaction / buttons (legacy)
    root.style.setProperty("--button-color", theme.buttonColor || primaryBtn);
    root.style.setProperty("--button-text-color", theme.buttonTextColor || "#FFFFFF");
    root.style.setProperty("--button-hover-color", theme.buttonHoverColor || primaryBtn);

    // Shapes & typography
    if (theme.borderRadius) root.style.setProperty("--border-radius", typeof theme.borderRadius === "number" ? `${theme.borderRadius}px` : String(theme.borderRadius));
    if ((theme as any).buttonRadius) root.style.setProperty("--button-radius", `${(theme as any).buttonRadius}px`);
    if ((theme as any).cardRadius) root.style.setProperty("--card-radius", `${(theme as any).cardRadius}px`);
    if (theme.fontFamily) root.style.setProperty("--font-family", theme.fontFamily);

    // Preserve extra variables already used elsewhere
    root.style.setProperty("--header-background", (theme as any).headerBackground || "");
    root.style.setProperty("--searchbar-color", (theme as any).searchBarColor || "");
    root.style.setProperty("--card-border-color", (theme as any).cardBorderColor || "");
    root.style.setProperty("--navbar-color", (theme as any).navbarColor || "");

  }, [theme]);

  if (loading) return null;

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
