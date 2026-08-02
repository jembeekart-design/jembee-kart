// src/lib/theme/themeClasses.ts

export const themeClasses = {
  // Buttons
  primaryButton:
    "bg-[var(--color-primary-button)] text-[var(--button-text-color)] hover:opacity-90 rounded-[var(--button-radius)]",

  secondaryButton:
    "bg-[var(--color-secondary-button)] text-[var(--button-text-color)] hover:opacity-90 rounded-[var(--button-radius)]",

  outlineButton:
    "border border-[var(--color-border)] text-[var(--text-primary)] bg-transparent rounded-[var(--button-radius)]",

  // Cards
  card:
    "bg-[var(--color-card-background)] border border-[var(--color-border)] rounded-[var(--card-radius)] shadow",

  // Inputs
  input:
    "bg-[var(--color-input-background)] border border-[var(--color-border)] text-[var(--text-primary)] rounded-[var(--input-radius)]",

  // Text
  heading:
    "text-[var(--text-primary)] font-bold",

  body:
    "text-[var(--text-primary)]",

  muted:
    "text-[var(--text-muted)]",

  // Background
  page:
    "bg-[var(--color-page-background)] text-[var(--text-primary)]",

  // Border
  border:
    "border border-[var(--color-border)]",

  // Badge
  success:
    "bg-[var(--color-success)] text-[var(--button-text-color)]",

  warning:
    "bg-[var(--color-warning)] text-[var(--text-primary)]",

  danger:
    "bg-[var(--color-danger)] text-[var(--button-text-color)]",
};
