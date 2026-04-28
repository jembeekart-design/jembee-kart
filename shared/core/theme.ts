// 🎯 Theme Mode
export type ThemeMode = "dark" | "light"

// 🎨 Theme Types
export type Theme = {
  primary: string
  secondary: string

  background: string
  surface: string

  text: string
  mutedText: string

  glassBg: string
  glassBorder: string
  blur: string
  shadow: string

  statusBar: string

  success: string
  error: string
  warning: string

  radius: string
  spacing: string

  gradient: string
}

// 🌙 DARK THEME (MAIN)
export const darkTheme: Theme = {
  primary: "#6C5CE7",
  secondary: "#00CEC9",

  background: "#0b0f19",
  surface: "#111827",

  text: "#ffffff",
  mutedText: "#9CA3AF",

  glassBg: "rgba(255,255,255,0.08)",
  glassBorder: "rgba(255,255,255,0.15)",
  blur: "14px",
  shadow: "0 8px 40px rgba(0,0,0,0.6)",

  statusBar: "#0b0f19",

  success: "#00C853",
  error: "#FF3B30",
  warning: "#FFB300",

  radius: "18px",
  spacing: "16px",

  gradient: "linear-gradient(135deg,#6C5CE7,#00CEC9)"
}

// ☀️ LIGHT THEME
export const lightTheme: Theme = {
  ...darkTheme,

  background: "#ffffff",
  surface: "#f3f4f6",

  text: "#111827",
  mutedText: "#6b7280",

  glassBg: "rgba(0,0,0,0.05)",
  glassBorder: "rgba(0,0,0,0.1)",

  statusBar: "#ffffff"
}

// 🎯 THEME SELECTOR
export const getTheme = (mode: ThemeMode): Theme => {
  return mode === "light" ? lightTheme : darkTheme
}
