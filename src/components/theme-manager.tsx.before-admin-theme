"use client";

import { useEffect } from "react";
import { useAdminConfig } from "@/lib/admin-config/provider";

function rgb(color: string): [number, number, number] | null {
  const value = color.trim();

  const hex = value.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    let h = hex[1];
    if (h.length === 3) h = h.split("").map((c) => c + c).join("");
    return [
      parseInt(h.slice(0, 2), 16),
      parseInt(h.slice(2, 4), 16),
      parseInt(h.slice(4, 6), 16),
    ];
  }

  const parsed = value.match(/^rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/i);
  if (parsed) return [Number(parsed[1]), Number(parsed[2]), Number(parsed[3])];

  return null;
}

function luminance(color: string): number | null {
  const values = rgb(color);
  if (!values) return null;

  const channels = values.map((v) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrast(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  if (la === null || lb === null) return 0;
  const light = Math.max(la, lb);
  const dark = Math.min(la, lb);
  return (light + 0.05) / (dark + 0.05);
}

function readableText(background: string, preferred?: string): string {
  if (preferred && contrast(background, preferred) >= 4.5) return preferred;
  return contrast(background, "#111827") >= contrast(background, "#FFFFFF")
    ? "#111827"
    : "#FFFFFF";
}

export function ThemeManager({ children }: { children: React.ReactNode }) {
  const { config } = useAdminConfig();
  const theme = config.theme || {};

  useEffect(() => {
    const root = document.documentElement;

    const pageBackground =
      theme.pageBackground || theme.backgroundColor || "#F8F9FE";
    const surface = theme.surfaceColor || theme.cardColor || "#FFFFFF";
    const cardBg = theme.cardColor || theme.surfaceColor || "#FFFFFF";
    const sectionBg = theme.sectionBackground || theme.surfaceColor || "#F1F5F9";
    const headerBg = theme.headerBackground || theme.primaryColor || "#4F46E5";
    const inputBg = theme.inputBackground || theme.cardColor || "#FFFFFF";
    const border = theme.borderColor || theme.cardBorderColor || "#E5E7EB";
    const primaryBtn = theme.primaryButtonColor || theme.buttonColor || theme.primaryColor || "#4F46E5";
    const secondaryBtn = theme.secondaryButtonColor || theme.secondaryColor || "#0284c7";

    const textPrimary = readableText(pageBackground, theme.textColor);
    const textSecondary = readableText(surface, theme.textSecondary || "#6B7280");
    const textMuted = readableText(surface, theme.mutedTextColor || "#6B7280");
    const buttonText = readableText(primaryBtn, theme.buttonTextColor);
    const secondaryButtonText = readableText(secondaryBtn);
    const headerText = readableText(headerBg);

    const vars: Record<string, string> = {
      "--primary-color": theme.primaryColor || primaryBtn,
      "--secondary-color": theme.secondaryColor || secondaryBtn,
      "--background-color": theme.backgroundColor || pageBackground,
      "--card-color": cardBg,
      "--text-color": textPrimary,
      "--muted-text-color": textMuted,
      "--border-color": border,
      "--color-page-background": pageBackground,
      "--color-surface": surface,
      "--color-card-background": cardBg,
      "--color-section-background": sectionBg,
      "--color-header": headerBg,
      "--color-input-background": inputBg,
      "--color-border": border,
      "--color-primary-button": primaryBtn,
      "--color-secondary-button": secondaryBtn,
      "--text-primary": textPrimary,
      "--text-secondary": textSecondary,
      "--text-muted": textMuted,
      "--button-color": theme.buttonColor || primaryBtn,
      "--button-text-color": buttonText,
      "--button-hover-color": theme.buttonHoverColor || primaryBtn,
      "--text-on-header": headerText,
      "--text-on-primary": buttonText,
      "--text-on-secondary": secondaryButtonText,
      "--color-success": theme.successColor || "#10B981",
      "--color-warning": theme.warningColor || "#F59E0B",
      "--color-danger": theme.dangerColor || "#EF4444",
    };

    Object.entries(vars).forEach(([name, value]) => {
      root.style.setProperty(name, value);
    });

    if (theme.borderRadius) root.style.setProperty("--border-radius", String(theme.borderRadius));
    if (theme.fontFamily) root.style.setProperty("--font-family", theme.fontFamily);
  }, [theme]);

  return <>{children}</>;
}
