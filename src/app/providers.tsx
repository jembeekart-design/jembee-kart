"use client";

import { ThemeProvider } from "@/context/ThemeContext";
import { AdminConfigProvider } from "@/lib/admin-config/provider";

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({
  children,
}: ProvidersProps) {
  return (
    <AdminConfigProvider>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </AdminConfigProvider>
  );
}
