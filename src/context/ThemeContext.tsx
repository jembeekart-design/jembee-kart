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

const ThemeContext =
  createContext<any>(null);

export function ThemeProvider({
  children
}: {
  children: React.ReactNode;
}) {

  const [theme, setTheme] =
    useState({
      primaryColor: "#4F46E5",
      secondaryColor: "#7C3AED",
      backgroundColor: "#F8F9FE",
      cardColor: "#FFFFFF",
      textColor: "#111827"
    });

  useEffect(() => {

    async function loadTheme() {

      try {

        const snap = await getDoc(
          doc(
            db,
            "settings",
            "global_theme"
          )
        );

        if (snap.exists()) {

          const data = snap.data();

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

        console.log(error);

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

export const useTheme = () =>
  useContext(ThemeContext);
