"use client";

import { ReactNode } from "react";
import { AdminConfigProvider } from "@/lib/admin-config/provider";

interface AppProvidersProps {
  children: ReactNode;
}

export default function AppProviders({
  children,
}: AppProvidersProps) {
  return (
    <AdminConfigProvider>
      {children}
    </AdminConfigProvider>
  );
}
