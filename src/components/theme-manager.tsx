"use client";

import { useEffect } from "react";
import { useAdminConfig } from "@/lib/admin-config/provider";

export function ThemeManager({ children }: { children: React.ReactNode }) {
  const { config } = useAdminConfig();
  const theme = config.theme;

  useEffect(() => {
    if (!theme) return;

    const root = document.documentElement;

    // 1. Colors & Basic Variables
    root.style.setProperty("--primary-color", theme.primaryColor);
    root.style.setProperty("--secondary-color", theme.secondaryColor);
    root.style.setProperty("--background-color", theme.backgroundColor);
    root.style.setProperty("--card-color", theme.cardColor);
    root.style.setProperty("--text-color", theme.textColor);
    root.style.setProperty("--muted-text-color", theme.mutedTextColor);
    root.style.setProperty("--border-color", theme.borderColor);
    
    // 2. Buttons & Interaction
    root.style.setProperty("--button-color", theme.buttonColor);
    root.style.setProperty("--button-text-color", theme.buttonTextColor);
    root.style.setProperty("--button-hover-color", theme.buttonHoverColor || theme.buttonColor);
    
    // 3. Spacing & Shapes
    root.style.setProperty("--border-radius", theme.borderRadius);
    
    // 4. Header & Navigation
    root.style.setProperty("--header-background", theme.headerBackground);
    root.style.setProperty("--searchbar-color", theme.searchBarColor);
    
    // 5. Success/Warning/Danger
    root.style.setProperty("--success-color", theme.successColor);
    root.style.setProperty("--warning-color", theme.warningColor);
    root.style.setProperty("--danger-color", theme.dangerColor);

    // 6. Font
    root.style.setProperty("--font-family", theme.fontFamily || "Inter");

  }, [theme]);

  return <>{children}</>;
}
