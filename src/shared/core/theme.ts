// 🌈 THEME SYSTEM (FINAL FIXED)

export type Theme = {
  id: string;

  primary: string;
  secondary: string;
  accent: string;

  bg: string;
  bgSoft: string;

  card: string;
  border: string;

  text: string;
  textSoft: string;

  success: string;
  warning: string;
  error: string;

  blur: string;
  glassOpacity: string;

  mode: "light" | "dark";
};

// ✅ DEFAULT THEME
export const defaultTheme: Theme = {
  id: "dark-pro",

  primary: "#6366f1",
  secondary: "#8b5cf6",
  accent: "#22c55e",

  bg: "#0f172a",
  bgSoft: "#111827",

  card: "rgba(255,255,255,0.08)",
  border: "rgba(255,255,255,0.1)",

  text: "#ffffff",
  textSoft: "#94a3b8",

  success: "#22c55e",
  warning: "#f59e0b",
  error: "#ef4444",

  blur: "20px",
  glassOpacity: "0.08",

  mode: "dark",
};

// 🎨 APPLY THEME
export function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;

  root.style.setProperty("--primary", theme.primary);
  root.style.setProperty("--secondary", theme.secondary);
  root.style.setProperty("--accent", theme.accent);

  root.style.setProperty("--bg", theme.bg);
  root.style.setProperty("--bg-soft", theme.bgSoft);

  root.style.setProperty("--card", theme.card);
  root.style.setProperty("--border", theme.border);

  root.style.setProperty("--text", theme.text);
  root.style.setProperty("--text-soft", theme.textSoft);

  root.style.setProperty("--success", theme.success);
  root.style.setProperty("--warning", theme.warning);
  root.style.setProperty("--error", theme.error);

  root.style.setProperty("--blur", theme.blur);
  root.style.setProperty("--glass-opacity", theme.glassOpacity);
}

// 💾 SAVE THEME
export function saveTheme(theme: Theme) {
  if (typeof window === "undefined") return;
  localStorage.setItem("app-theme", JSON.stringify(theme));
}

// 📦 LOAD THEME
export function loadTheme(): Theme {
  if (typeof window === "undefined") return defaultTheme;

  const saved = localStorage.getItem("app-theme");

  if (!saved) return defaultTheme;

  try {
    return JSON.parse(saved);
  } catch {
    return defaultTheme;
  }
}
