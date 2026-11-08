import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

import Providers from "./providers";
import SystemSeeder from "@/components/SystemSeeder";
import MonetagScriptGate from "@/components/MonetagScriptGate";

export const metadata: Metadata = {
  title: {
    default: "JEMBEE PLAY",
    template: "%s | JEMBEE PLAY",
  },
  description: "JEMBEE PLAY — Watch, Learn, Create, Share and Earn.",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "JEMBEE PLAY",
    description: "Watch, learn, create and share on JEMBEE PLAY.",
    siteName: "JEMBEE PLAY",
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
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#06B6D4" />
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://jembee-kart1.firebaseapp.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://firestore.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googleapis.com" crossOrigin="anonymous" />
        <Script
          id="google-adsense"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7471322988540402"
          strategy="lazyOnload"
          crossOrigin="anonymous"
        />
              <meta name="monetag" content="ffc36b1add65212e386c64b0bf1e6c0e" />
        

      </head>

      <body className="min-h-screen antialiased">
        <Providers>
          <MonetagScriptGate />

          {/* Auto create missing Firestore settings */}
          <SystemSeeder />

          <div className="min-h-screen w-full overflow-x-hidden bg-[var(--background)] text-[var(--text)]">
            {children}
          </div>

        </Providers>
      </body>
    </html>
  );
}
