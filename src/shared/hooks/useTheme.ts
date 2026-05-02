"use client";

import { useEffect, useState } from "react";
import { themeStore } from "@/store/themeStore";

export const useTheme = () => {
  const [theme, setTheme] = useState(themeStore.get());

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved) themeStore.set(JSON.parse(saved));

    return themeStore.subscribe(setTheme);
  }, []);

  return {
    theme,
    updateTheme: themeStore.set,
  };
};
