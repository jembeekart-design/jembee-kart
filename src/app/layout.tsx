import type { Metadata } from "next";
import "./globals.css";

import Providers from "./providers";
import { ThemeManager } from "@/components/theme-manager";
import SystemSeeder from "@/components/SystemSeeder";

export const metadata: Metadata = {
  metadataBase: new URL("https://jembee-kart.vercel.app"),
  title: {
    default: "JembeeKart | Online Shopping & Rewards",
    template: "%s | JembeeKart",
  },
  description: "Explore a wide range of products at JembeeKart. Shop online and participate in our rewards programme.",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "JembeeKart",
    description: "Explore a wide range of products at JembeeKart.",
    url: "https://jembee-kart.vercel.app",
    siteName: "JembeeKart",
    locale: "en_IN",
    type: "website",
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({
  children,
}: Readonly<RootLayoutProps>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7471322988540402"
          crossOrigin="anonymous"
        />
      </head>

      <body className="min-h-screen antialiased">
        <Providers>

          {/* Auto create missing Firestore settings */}
          <SystemSeeder />

          <ThemeManager>
            <div className="min-h-screen w-full overflow-x-hidden bg-[var(--background)] text-[var(--text)] transition-colors duration-300">
              {children}
            </div>
          </ThemeManager>

        </Providers>
      </body>
    </html>
  );
}
