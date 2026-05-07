import { useState } from "react";

export const useTheme = () => {
  const [theme, setTheme] = useState("light");

  return {
    theme,
    setTheme,
  };
};

// THEME ADMIN PANEL SE CHANGE HOGA
