import { Theme } from "../core/theme"

export const applyTheme = (theme: Theme) => {
  const root = document.documentElement

  root.style.setProperty("--primary", theme.primary)
  root.style.setProperty("--background", theme.background)
  root.style.setProperty("--text", theme.text)
  root.style.setProperty("--glass", theme.glassBg)
  root.style.setProperty("--border", theme.glassBorder)
  root.style.setProperty("--radius", theme.radius)

  // 🔥 STATUS BAR CONTROL
  let meta = document.querySelector("meta[name='theme-color']")
  if (!meta) {
    meta = document.createElement("meta")
    meta.setAttribute("name", "theme-color")
    document.head.appendChild(meta)
  }
  meta.setAttribute("content", theme.statusBar)
}
