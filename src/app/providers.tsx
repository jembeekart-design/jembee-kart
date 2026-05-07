"use client";

import AppProvider from "@/providers/AppProvider";
import AuthProvider from "@/providers/AuthProvider";
import ThemeProvider from "@/providers/ThemeProvider";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppProvider>
      <AuthProvider>
        <ThemeProvider>{children}</ThemeProvider>
      </AuthProvider>
    </AppProvider>
  );
}

// THEME ADMIN PANEL SE CHANGE HOGA
