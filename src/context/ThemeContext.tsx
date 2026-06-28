"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import { db } from "@/firebase/config";

export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  borderRadius: string;
  cardColor: string;
  textColor: string;
  fontFamily?: string;
  darkMode?: boolean;
  siteTitle?: string;
  logoUrl?: string;
}

const defaultTheme: ThemeConfig = {
  primaryColor: "#4F46E5",
  secondaryColor: "#7C3AED",
  backgroundColor: "#F8F9FE",
  borderRadius: "24",
  cardColor: "#FFFFFF",
  textColor: "#111827",
};

interface ThemeContextType {
  theme: ThemeConfig;
  setTheme: React.Dispatch<
    React.SetStateAction<ThemeConfig>
  >;
}

const ThemeContext =
  createContext<ThemeContextType>({
    theme: defaultTheme,
    setTheme: () => {},
  });

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {

  const [theme, setTheme] =
    useState<ThemeConfig>(defaultTheme);

  useEffect(() => {

    async function loadTheme() {

      try {

        const snap = await getDoc(
          doc(
            db,
            "admin_settings",
            "customize"
          )
        );

        if (!snap.exists()) return;

        const mergedTheme = {
          ...defaultTheme,
          ...snap.data(),
        } as ThemeConfig;

        setTheme(mergedTheme);

        document.documentElement.style.setProperty(
          "--primary-color",
          mergedTheme.primaryColor
        );

        document.documentElement.style.setProperty(
          "--secondary-color",
          mergedTheme.secondaryColor
        );

        document.documentElement.style.setProperty(
          "--background-color",
          mergedTheme.backgroundColor
        );

        document.documentElement.style.setProperty(
          "--border-radius",
          `${mergedTheme.borderRadius}px`
        );

        document.documentElement.style.setProperty(
          "--card-color",
          mergedTheme.cardColor
        );

        document.documentElement.style.setProperty(
          "--text-color",
          mergedTheme.textColor
        );

      } catch (error) {

        console.error(
          "Theme load error",
          error
        );

      }

    }

    loadTheme();

  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );

}

export function useTheme() {
  return useContext(ThemeContext);
}
