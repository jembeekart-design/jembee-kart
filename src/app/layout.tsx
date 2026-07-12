import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import { ThemeLoader } from "@/components/ThemeLoader"; // Ye file hum banayenge
import { AdminConfigProvider } from "@/lib/admin-config/provider";
export const metadata: Metadata = {
  title: "JembeeKart",
  description: "AI Ecommerce Ecosystem",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
  <AdminConfigProvider>
    <ThemeLoader>
      <div className="w-full overflow-hidden">
        {children}
      </div>
    </ThemeLoader>
  </AdminConfigProvider>
</Providers>
      </body>
    </html>
  );
}
