"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";

import {
  doc,
  getDoc
} from "firebase/firestore";

import { db } from "@/firebase/config";

interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  cardColor: string;
  textColor: string;
}

const defaultTheme: ThemeConfig = {
  primaryColor: "#4F46E5",
  secondaryColor: "#7C3AED",
  backgroundColor: "#F8F9FE",
  cardColor: "#FFFFFF",
  textColor: "#111827"
};

const ThemeContext =
  createContext<ThemeConfig>(
    defaultTheme
  );

export function ThemeProvider({
  children
}: {
  children: React.ReactNode;
}) {

  const [theme, setTheme] =
    useState<ThemeConfig>(
      defaultTheme
    );

  useEffect(() => {

    async function loadTheme() {

      try {

        const snap =
          await getDoc(
            doc(
              db,
              "settings",
              "global_theme"
            )
          );

        if (snap.exists()) {

          const data =
            snap.data() as ThemeConfig;

          setTheme(data);

          document.documentElement.style.setProperty(
            "--primary-color",
            data.primaryColor
          );

          document.documentElement.style.setProperty(
            "--secondary-color",
            data.secondaryColor
          );

          document.documentElement.style.setProperty(
            "--background-color",
            data.backgroundColor
          );

          document.documentElement.style.setProperty(
            "--card-color",
            data.cardColor
          );

          document.documentElement.style.setProperty(
            "--text-color",
            data.textColor
          );

        }

      } catch (error) {

        console.log(
          "Theme load error:",
          error
        );

      }
    }

    loadTheme();

  }, []);

  return (

    <ThemeContext.Provider
      value={theme}
    >

      {children}

    </ThemeContext.Provider>

  );
}

export function useTheme() {

  return useContext(
    ThemeContext
  );

}
