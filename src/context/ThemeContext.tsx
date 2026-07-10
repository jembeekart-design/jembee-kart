"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import type { Theme } from "@/types/theme";

interface ThemeContextType {
  theme: Theme;
  setTheme: React.Dispatch<React.SetStateAction<Theme>>;
}

export const ThemeContext = createContext<ThemeContextType>({} as ThemeContextType);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // यहाँ एक सुरक्षित डिफ़ॉल्ट स्टेट रखें ताकि ऐप क्रैश न हो
  const [theme, setTheme] = useState<Theme | null>(null);

  // 1. Firebase से डेटा लोड करें
  useEffect(() => {
    async function loadTheme() {
      try {
        const docSnap = await getDoc(doc(db, "admin_settings", "customize"));
        if (docSnap.exists()) {
          setTheme(docSnap.data() as Theme);
        }
      } catch (error) {
        console.error("Theme load error:", error);
      }
    }
    loadTheme();
  }, []);

  // 2. थीम बदलते ही CSS variables को ब्राउज़र में अप्लाई करें
  useEffect(() => {
    if (!theme) return; // जब तक थीम लोड न हो, कुछ न करें

    const root = document.documentElement;
    root.style.setProperty("--primary-color", theme.primaryColor);
    root.style.setProperty("--secondary-color", theme.secondaryColor);
    root.style.setProperty("--background-color", theme.backgroundColor);
    root.style.setProperty("--card-color", theme.cardColor);
    root.style.setProperty("--text-color", theme.textColor);
    // इसी तरह अन्य सभी प्रॉपर्टीज़ यहाँ लिखें...
    
  }, [theme]); // यह useEffect तब चलेगा जब भी 'theme' बदलेगा

  // जब तक थीम लोड नहीं होती, तब तक null या loading दिखाएं
  if (!theme) return null; 

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
