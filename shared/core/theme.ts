// 🎨 Theme Types (Full Control)
export type Theme = {
  // base colors
  primary: string
  secondary: string
  background: string
  surface: string
  text: string
  mutedText: string

  // glass / morphism
  glassBg: string
  glassBorder: string
  blur: string
  shadow: string

  // status + system
  statusBar: string
  success: string
  error: string
  warning: string

  // layout
  radius: string
  spacing: string

  // effects
  gradient: string
}

// 🔥 Default Theme (fallback)
export const defaultTheme: Theme = {
  primary: "#6C5CE7",
  secondary: "#00CEC9",

  background: "#0b0f19",
  surface: "#111827",

  text: "#ffffff",
  mutedText: "#9CA3AF",

  // 🔥 Glass UI
  glassBg: "rgba(255,255,255,0.08)",
  glassBorder: "rgba(255,255,255,0.15)",
  blur: "12px",
  shadow: "0 8px 32px rgba(0,0,0,0.4)",

  // system
  statusBar: "#0b0f19",
  success: "#00C853",
  error: "#FF3B30",
  warning: "#FFB300",

  // layout
  radius: "16px",
  spacing: "16px",

  // effect
  gradient: "linear-gradient(135deg,#6C5CE7,#00CEC9)"
}
