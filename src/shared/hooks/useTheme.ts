"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Theme,
  defaultTheme,
  applyTheme,
  loadTheme,
  saveTheme,
} from "@/shared/core/theme";

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [isLoaded, setIsLoaded] = useState(false);

  // 🔄 Load theme (SSR safe)
  useEffect(() => {
    try {
      const savedTheme = loadTheme();
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } catch {
      applyTheme(defaultTheme);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // 🎨 FULL UPDATE (strict type)
  const updateTheme = useCallback((newTheme: Theme) => {
    setTheme(newTheme);
    applyTheme(newTheme);
    saveTheme(newTheme);
  }, []);

  // ⚡ PARTIAL UPDATE (RECOMMENDED)
  const updatePartialTheme = useCallback(
    (partial: Partial<Theme>) => {
      setTheme((prev) => {
        const updated = { ...prev, ...partial };
        applyTheme(updated);
        saveTheme(updated);
        return updated;
      });
    },
    []
  );

  return {
    theme,
    isLoaded,             // hydration control (important)
    updateTheme,
    updatePartialTheme,
  };
};
