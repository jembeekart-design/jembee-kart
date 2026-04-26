'use client';

import { useEffect } from "react";
import type { Metadata } from "next";
import "../styles/globals.css";
import ThemeProvider from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "Jembee Kart Admin",
  description: "Premium Glassmorphism Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  useEffect(() => {
    const root = document.documentElement;

    // 🔥 Smooth animation
    root.style.transition =
      "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";

    // 🎨 Theme load
    const color = localStorage.getItem("themeColor") || "#0f172a";
    const mode =
      localStorage.getItem("darkMode") === "false" ? "light" : "dark";

    // 🎯 Apply theme
    root.style.setProperty("--primary", color);

    root.classList.remove("light", "dark");
    root.classList.add(mode);

    // 🔥 STATUS + BOTTOM BAR FIX
    let meta = document.querySelector('meta[name="theme-color"]');

    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "theme-color");
      document.head.appendChild(meta);
    }

    meta.setAttribute("content", color);

  }, []);

  return (
    <html lang="en">
      <head>
        {/* 🔥 fallback color */}
        <meta name="theme-color" content="#0f172a" />
      </head>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
