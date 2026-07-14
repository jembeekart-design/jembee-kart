"use client";

import { useAdminConfig } from "@/lib/admin-config/provider";

export function ThemeLoader({ children }: { children: React.ReactNode }) {
  const { config } = useAdminConfig();
  const theme = config?.theme; // Provider se theme data lein

  if (!theme) return <>{children}</>;

  // CSS Variables yahan define karein
  const themeStyles = {
    "--background": theme.backgroundColor,
    "--text": theme.textColor,
    "--primary": theme.primaryColor,
    "--card": theme.cardColor,
  } as React.CSSProperties;

  return (
    <div style={themeStyles} className="contents">
      {children}
    </div>
  );
}
