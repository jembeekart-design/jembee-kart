'use client';
import { useEffect } from "react";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const root = document.documentElement;
    root.style.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";

    // Admin/LocalStorage Logic
    const color = localStorage.getItem("themeColor") || "#6366f1";
    const mode = localStorage.getItem("darkMode") === "false" ? "light" : "dark";

    root.style.setProperty("--primary", color);
    root.classList.remove("light", "dark");
    root.classList.add(mode);

    const meta = document.querySelector('meta[name="theme-color"]') || document.createElement("meta");
    meta.setAttribute("name", "theme-color");
    meta.setAttribute("content", color);
    if (!document.head.contains(meta)) document.head.appendChild(meta);
  }, []);

  return <>{children}</>;
}
