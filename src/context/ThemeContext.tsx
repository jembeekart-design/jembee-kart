"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import type { Theme } from "@/types/theme"; // Naya wala interface

interface ThemeContextType {
  theme: Theme;
  setTheme: React.Dispatch<React.SetStateAction<Theme>>;
}

// Default theme wahi rakhein jo aapne ThemeBuilderPage mein rakha hai
const defaultTheme: Theme = {
  primaryColor: "#3b82f6",
  secondaryColor: "#64748b",
  backgroundColor: "#ffffff",
  surfaceColor: "#f8fafc",
  cardColor: "#ffffff",
  textColor: "#0f172a",
  mutedTextColor: "#64748b",
  headingColor: "#020617",
  borderColor: "#e2e8f0",
  successColor: "#22c55e",
  warningColor: "#f59e0b",
  dangerColor: "#ef4444",
  infoColor: "#0ea5e9",
  buttonTextColor: "#ffffff",
  inputBackgroundColor: "#ffffff",
  inputBorderColor: "#cbd5e1",
  sidebarColor: "#1e293b",
  headerColor: "#ffffff",
  footerColor: "#f8fafc",
  linkColor: "#3b82f6",
  hoverColor: "#2563eb",
  activeColor: "#1d4ed8",
  fontFamily: "Inter",
  headingFont: "Inter",
  bodyFont: "Inter",
  headingSize: 32,
  bodySize: 16,
  letterSpacing: "normal",
  lineHeight: 1.5,
  textTransform: "none",
  fontWeight: "600",
  borderRadius: 8,
  buttonRadius: 8,
  cardRadius: 12,
  inputRadius: 6,
  borderWidth: 1,
  shadow: "md",
  shadowOpacity: 0.1,
  buttonStyle: "filled",
  buttonSize: "md",
  buttonHoverEffect: "scale",
  buttonIconPosition: "left",
  animationStyle: "fade",
};

const ThemeContext = createContext<ThemeContextType>({
  theme: defaultTheme,
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);

  // Jab bhi 'theme' state update ho, CSS variables update karein
  useEffect(() => {
    const root = document.documentElement;
    
    // Yahan saari mapping update hogi
    root.style.setProperty("--primary-color", theme.primaryColor);
    root.style.setProperty("--background-color", theme.backgroundColor);
    root.style.setProperty("--text-color", theme.textColor);
    root.style.setProperty("--border-radius", `${theme.borderRadius}px`);
    // ... baki sabhi variables yahan add karein
    
  }, [theme]);

  // Firebase se load karne ka logic
  useEffect(() => {
    async function loadTheme() {
      try {
        const snap = await getDoc(doc(db, "admin_settings", "customize"));
        if (snap.exists()) {
          setTheme({ ...defaultTheme, ...(snap.data() as Theme) });
        }
      } catch (error) {
        console.error("Theme load error", error);
      }
    }
    loadTheme();
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
