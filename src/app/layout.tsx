import type { Metadata } from "next";
import "./globals.css";

import Providers from "./providers";
import { ThemeLoader } from "@/components/ThemeLoader";
import SystemSeeder from "@/components/SystemSeeder";

export const metadata: Metadata = {
  title: "JembeeKart",
  description: "AI Ecommerce Ecosystem",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({
  children,
}: Readonly<RootLayoutProps>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <Providers>

          {/* Auto create missing Firestore settings */}
          <SystemSeeder />

          <ThemeLoader>
            <div className="min-h-screen w-full overflow-x-hidden bg-[var(--background)] text-[var(--text)] transition-colors duration-300">
              {children}
            </div>
          </ThemeLoader>

        </Providers>
      </body>
    </html>
  );
}
