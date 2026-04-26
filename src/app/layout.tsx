'use client';

import { useEffect } from "react";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  useEffect(() => {
    const root = document.documentElement;

    // 🔥 Smooth transition (premium feel)
    root.style.transition =
      "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";

    // 🎨 Theme load from admin/localStorage
    const color = localStorage.getItem("themeColor") || "#6366f1";
    const mode =
      localStorage.getItem("darkMode") === "false" ? "light" : "dark";

    // 🎯 Apply color
    root.style.setProperty("--primary", color);

    // 🌙 Apply mode
    root.classList.remove("light", "dark");
    root.classList.add(mode);

    // 🔝 Status bar + browser UI color
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
      <body>{children}</body>
    </html>
  );
}
