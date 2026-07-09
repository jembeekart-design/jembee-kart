// src/lib/theme/themeClasses.ts

export const themeClasses = {
  // Buttons
  primaryButton:
    "bg-[var(--primary-color)] text-[var(--button-text-color)] hover:opacity-90 rounded-[var(--button-radius)]",

  secondaryButton:
    "bg-[var(--secondary-color)] text-[var(--button-text-color)] hover:opacity-90 rounded-[var(--button-radius)]",

  outlineButton:
    "border border-[var(--border-color)] text-[var(--text-color)] bg-transparent rounded-[var(--button-radius)]",

  // Cards
  card:
    "bg-[var(--card-color)] border border-[var(--border-color)] rounded-[var(--card-radius)] shadow",

  // Inputs
  input:
    "bg-[var(--card-color)] border border-[var(--border-color)] text-[var(--text-color)] rounded-[var(--input-radius)]",

  // Text
  heading:
    "text-[var(--text-color)] font-bold",

  body:
    "text-[var(--text-color)]",

  muted:
    "text-[var(--muted-text-color)]",

  // Background
  page:
    "bg-[var(--background-color)] text-[var(--text-color)]",

  // Border
  border:
    "border border-[var(--border-color)]",

  // Badge
  success:
    "bg-[var(--success-color)] text-[var(--button-text-color)]",

  warning:
    "bg-[var(--warning-color)] text-[var(--text-color)]",

  danger:
    "bg-[var(--danger-color)] text-[var(--button-text-color)]",
};
