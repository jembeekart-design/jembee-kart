"use client";

import { useEffect } from "react";
import { useAdminConfig } from "@/lib/admin-config/provider";

export function ThemeManager({ children }: { children: React.ReactNode }) {
  const { config } = useAdminConfig();
  const theme = config.theme || {};

  useEffect(() => {
    if (!theme) return;

    const root = document.documentElement;

    // Semantic theme tokens (admin-controlled). Fall back conservatively to avoid
    // large areas being painted by the accent/primary color.
    const pageBackground =
      theme.pageBackground || theme.backgroundColor || theme.cardColor || theme.primaryColor || "#F8F9FE";
    const surface = theme.surfaceColor || theme.cardColor || theme.backgroundColor || theme.primaryColor || "#FFFFFF";
    const cardBg = theme.cardColor || theme.surfaceColor || theme.backgroundColor || "#FFFFFF";
    const sectionBg = theme.sectionBackground || theme.surfaceColor || theme.cardColor || theme.backgroundColor || "#F1F5F9";
    const headerBg = theme.headerBackground || theme.primaryColor || theme.surfaceColor || theme.cardColor || "#4F46E5";
    const inputBg = theme.inputBackground || theme.cardColor || theme.surfaceColor || "#FFFFFF";
    const border = theme.borderColor || theme.cardBorderColor || "#E5E7EB";
    const primaryBtn = theme.primaryButtonColor || theme.buttonColor || theme.primaryColor || "#4F46E5";
    const secondaryBtn = theme.secondaryButtonColor || theme.secondaryColor || "#7C3AED";
    const textPrimary = theme.textColor || "#111827";
    const textSecondary = theme.textSecondary || theme.mutedTextColor || "#6B7280";
    const textMuted = theme.mutedTextColor || "#9CA3AF";
    const success = theme.successColor || "#10B981";
    const warning = theme.warningColor || "#F59E0B";
    const danger = theme.dangerColor || "#EF4444";

    // 1. Preserve legacy variables (so older components that still use them won't break)
    root.style.setProperty("--primary-color", theme.primaryColor || primaryBtn);
    root.style.setProperty("--secondary-color", theme.secondaryColor || secondaryBtn);
    root.style.setProperty("--background-color", theme.backgroundColor || pageBackground);
    root.style.setProperty("--card-color", cardBg);
    root.style.setProperty("--text-color", textPrimary);
    root.style.setProperty("--muted-text-color", textMuted);
    root.style.setProperty("--border-color", border);

    // 2. New semantic tokens required by the app
    root.style.setProperty("--color-page-background", pageBackground);
    root.style.setProperty("--color-surface", surface);
    root.style.setProperty("--color-card-background", cardBg);
    root.style.setProperty("--color-section-background", sectionBg);
    root.style.setProperty("--color-header", headerBg);
    root.style.setProperty("--color-input-background", inputBg);
    root.style.setProperty("--color-border", border);
    root.style.setProperty("--color-primary-button", primaryBtn);
    root.style.setProperty("--color-secondary-button", secondaryBtn);
    root.style.setProperty("--text-primary", textPrimary);
    root.style.setProperty("--text-secondary", textSecondary);
    root.style.setProperty("--text-muted", textMuted);
    root.style.setProperty("--color-success", success);
    root.style.setProperty("--color-warning", warning);
    root.style.setProperty("--color-danger", danger);

    // Interaction / buttons (legacy)
    root.style.setProperty("--button-color", theme.buttonColor || primaryBtn);
    root.style.setProperty("--button-text-color", theme.buttonTextColor || "#FFFFFF");
    root.style.setProperty("--button-hover-color", theme.buttonHoverColor || primaryBtn);

    // Shapes & typography
    if (theme.borderRadius) root.style.setProperty("--border-radius", String(theme.borderRadius));
    if (theme.fontFamily) root.style.setProperty("--font-family", theme.fontFamily);

  }, [theme]);

  return <>{children}</>;
}
