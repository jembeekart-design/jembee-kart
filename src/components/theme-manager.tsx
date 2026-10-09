"use client";

import { useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase/config";
import { useAdminConfig } from "@/lib/admin-config/provider";

function rgb(color: string): [number, number, number] | null {
  const hex = color.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!hex) return null;
  let h = hex[1];
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function luminance(color: string): number {
  const values = rgb(color);
  if (!values) return 0.5;
  const channels = values.map((v) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function readableText(background: string, preferred?: string): string {
  if (preferred && rgb(preferred)) {
    const contrast = (a: string, b: string) => {
      const x = luminance(a);
      const y = luminance(b);
      return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
    };
    if (contrast(background, preferred) >= 4.5) return preferred;
  }
  return luminance(background) > 0.45 ? "#111827" : "#FFFFFF";
}

export function ThemeManager({ children }: { children: React.ReactNode }) {
  const { config } = useAdminConfig();

  useEffect(() => {
    const root = document.documentElement;
    const ref = doc(db, "admin_settings", "customize");

    const unsubscribe = onSnapshot(ref, (snap) => {
      const adminTheme = snap.exists() ? snap.data() : {};
      const theme = config.theme || {};

      // Admin Theme Builder is the source of truth for its four saved colours.
      const headerBg = adminTheme.headerBackground || "#ffffff";
      const buttonBg = adminTheme.buttonColor || "#ffffff";
      const border = adminTheme.cardBorderColor || "#e5e7eb";
      const searchBg = adminTheme.searchBarColor || "#f3f4f6";
      const pageBg = theme.pageBackground || theme.backgroundColor || "#f8fafc";
      const cardBg = theme.cardColor || "#ffffff";
      const text = readableText(pageBg, theme.textColor);
      const buttonText = readableText(buttonBg, theme.buttonTextColor);
      const headerText = readableText(headerBg);

      const vars: Record<string, string> = {
        "--header-color": headerBg,
        "--search-bar-color": searchBg,
        "--primary-color": buttonBg,
        "--button-color": buttonBg,
        "--button-text-color": buttonText,
        "--border-color": border,
        "--card-color": cardBg,
        "--background": pageBg,
        "--text": text,
        "--background-color": pageBg,
        "--color-page-background": pageBg,
        "--color-card-background": cardBg,
        "--color-surface": cardBg,
        "--color-header": headerBg,
        "--color-input-background": searchBg,
        "--color-border": border,
        "--color-primary-button": buttonBg,
        "--text-color": text,
        "--text-primary": text,
        "--text-secondary": readableText(cardBg, theme.textSecondary || "#6b7280"),
        "--text-muted": readableText(cardBg, theme.mutedTextColor || "#6b7280"),
        "--text-on-header": headerText,
        "--text-on-primary": buttonText,
        "--button-hover-color": theme.buttonHoverColor || buttonBg,
        "--secondary-color": theme.secondaryColor || buttonBg,
        "--color-secondary-button": theme.secondaryButtonColor || theme.secondaryColor || buttonBg,
        "--color-section-background": theme.sectionBackground || cardBg,
        "--color-success": theme.successColor || "#10b981",
        "--color-warning": theme.warningColor || "#f59e0b",
        "--color-danger": theme.dangerColor || "#ef4444",
      };

      Object.entries(vars).forEach(([name, value]) => {
        root.style.setProperty(name, value);
      });

      if (theme.borderRadius) root.style.setProperty("--border-radius", String(theme.borderRadius));
      if (theme.fontFamily) root.style.setProperty("--font-family", theme.fontFamily);
    });

    return () => unsubscribe();
  }, [config.theme]);

  return <>{children}</>;
}
