"use client";

import { useEffect, useState } from "react";
import { themeStore } from "@/shared/store/themeStore";

export const useTheme = () => {
  const [theme, setTheme] = useState(themeStore.get());

  useEffect(() => {
    return themeStore.subscribe(setTheme);
  }, []);

  return {
    theme,
    setTheme: themeStore.set,
  };
};