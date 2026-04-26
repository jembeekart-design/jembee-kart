// src/types/theme.ts

export type ThemeMode = "light" | "dark";

export type ThemeColors = {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  border: string;
};

export type GlassConfig = {
  blur: number;          // px
  opacity: number;       // 0 - 1
  borderOpacity: number; // 0 - 1
};

export type Theme = {
  id?: string;

  name: string;          // "Default Dark", "Blue Glass"
  mode: ThemeMode;

  colors: ThemeColors;

  glass: GlassConfig;

  isActive?: boolean;

  createdAt?: any;
  updatedAt?: any;
};
