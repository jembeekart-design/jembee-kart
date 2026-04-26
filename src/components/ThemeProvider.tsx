'use client';

import { useEffect } from "react";

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {

  useEffect(() => {
    const root = document.documentElement;

    // 🔥 Smooth animation
    root.style.transition =
      "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";

    const color = localStorage.getItem("themeColor") || "#0f172a";
    const mode =
      localStorage.getItem("darkMode") === "false" ? "light" : "dark";

    // 🎨 Apply theme
    root.style.setProperty("--primary", color);

    root.classList.remove("light", "dark");
    root.classList.add(mode);

    // 🔝 Status + bottom bar color
    let meta = document.querySelector('meta[name="theme-color"]');

    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "theme-color");
      document.head.appendChild(meta);
    }

    meta.setAttribute("content", color);

  }, []);

  return <>{children}</>;
}
