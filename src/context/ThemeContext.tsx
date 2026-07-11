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
    // ==============================
// Extra Theme Variables
// ==============================

// Header
root.style.setProperty("--header-background", theme.headerBackground || "");
root.style.setProperty("--header-text-color", theme.headerTextColor || "");
root.style.setProperty("--header-icon-color", theme.headerIconColor || "");

// Search Bar
root.style.setProperty("--searchbar-color", theme.searchBarColor || "");
root.style.setProperty("--searchbar-text-color", theme.searchBarTextColor || "");
root.style.setProperty("--searchbar-placeholder-color", theme.searchBarPlaceholderColor || "");
root.style.setProperty("--searchbar-border-color", theme.searchBarBorderColor || "");

// Buttons
root.style.setProperty("--button-color", theme.buttonColor || "");
root.style.setProperty("--button-hover-color", theme.buttonHoverColor || "");
root.style.setProperty("--button-text-color", theme.buttonTextColor || "");

// Cards
root.style.setProperty("--card-color", theme.cardColor || "");
root.style.setProperty("--card-border-color", theme.cardBorderColor || "");
root.style.setProperty("--card-shadow-color", theme.cardShadowColor || "");

// Borders
root.style.setProperty("--border-color", theme.borderColor || "");

// Navigation
root.style.setProperty("--navbar-color", theme.navbarColor || "");
root.style.setProperty("--bottom-nav-color", theme.bottomNavColor || "");
root.style.setProperty("--bottom-nav-active-color", theme.bottomNavActiveColor || "");

// Text
root.style.setProperty("--primary-text-color", theme.textColor || "");
root.style.setProperty("--secondary-text-color", theme.mutedTextColor || "");

// Background
root.style.setProperty("--background-color", theme.backgroundColor || "");
root.style.setProperty("--surface-color", theme.surfaceColor || "");

// Banner
root.style.setProperty("--banner-background", theme.bannerBackground || "");

// Category
root.style.setProperty("--category-background", theme.categoryBackground || "");
root.style.setProperty("--category-text-color", theme.categoryTextColor || "");

// Product
root.style.setProperty("--product-card-color", theme.productCardColor || "");
root.style.setProperty("--price-color", theme.priceColor || "");
root.style.setProperty("--offer-color", theme.offerColor || "");

// Footer
root.style.setProperty("--footer-background", theme.footerBackground || "");
root.style.setProperty("--footer-text-color", theme.footerTextColor || "");

  }, [theme]);

  if (loading) return null;

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
