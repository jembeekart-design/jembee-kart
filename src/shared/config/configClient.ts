// src/shared/config/configClient.ts

export type AppConfig = {
  theme: {
    primary: string;
    mode: "light" | "dark";
    blur: number;
    opacity: number;
  };
  ui: {
    glass: boolean;
    radius: number;
  };
  features: Record<string, boolean>;
};

let config: AppConfig = {
  theme: {
    primary: "#6366f1",
    mode: "dark",
    blur: 12,
    opacity: 0.1,
  },
  ui: {
    glass: true,
    radius: 16,
  },
  features: {},
};

export const getConfig = () => config;

export const setConfig = (newConfig: Partial<AppConfig>) => {
  config = { ...config, ...newConfig };
  applyTheme(config.theme);
};

const applyTheme = (theme: AppConfig["theme"]) => {
  const root = document.documentElement;

  root.style.setProperty("--primary", theme.primary);
  root.style.setProperty("--blur", `${theme.blur}px`);
  root.style.setProperty("--opacity", `${theme.opacity}`);
  root.dataset.theme = theme.mode;
};