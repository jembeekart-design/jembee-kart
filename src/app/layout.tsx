'use client';

import { useEffect } from "react";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  useEffect(() => {
    const color = localStorage.getItem("themeColor") || "#6366f1";
    const mode = localStorage.getItem("darkMode") === "false" ? "light" : "dark";

    // 🎨 CSS variable set (पूरे app के लिए)
    document.documentElement.style.setProperty("--primary", color);

    // 🌙 Dark / Light mode
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(mode);

    // 🔥 Status bar + browser UI color
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
