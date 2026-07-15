"use client";

import { CartProvider } from "@/context/CartContext";
import { AdminConfigProvider } from "@/lib/admin-config/provider";
import { ThemeManager } from "@/components/theme-manager";

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({
  children,
}: ProvidersProps) {
  return (
    <AdminConfigProvider>
      <ThemeManager>
        <CartProvider>
          {children}
        </CartProvider>
      </ThemeManager>
    </AdminConfigProvider>
  );
}
