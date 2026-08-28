"use client";

import { useAdminConfig } from "@/lib/admin-config/provider";

export function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { config } = useAdminConfig();
  const { theme } = config;

  // Dynamic CSS variables inject karna
  const themeStyles = {
    "--primary-color": theme.primaryColor,
    "--secondary-color": theme.secondaryColor,
    "--background-color": theme.backgroundColor,
    "--card-color": theme.cardColor,
    "--text-color": theme.textColor,
  } as React.CSSProperties;

  return (
    <div style={themeStyles} className="min-h-screen">
      {children}
    </div>
  );
}
