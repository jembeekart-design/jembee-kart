"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/config";

const DEFAULT_THEME = {
  headerBackground: "#ffffff",
  searchBarColor: "#f3f4f6",
  buttonColor: "#4f46e5",
  cardBorderColor: "#e5e7eb",
};

const cssMap: Record<string, string> = {
  headerBackground: "--header-color",
  searchBarColor: "--search-bar-color",
  buttonColor: "--primary-color",
  cardBorderColor: "--border-color",
};

export default function ThemePage() {
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  async function loadTheme() {
    const ref = doc(db, "admin_settings", "customize");
    const snap = await getDoc(ref);

    if (snap.exists()) {
      const data = {
        ...DEFAULT_THEME,
        ...snap.data(),
      };

      setTheme(data);

      Object.entries(cssMap).forEach(([field, css]) => {
        document.documentElement.style.setProperty(
          css,
          (data as any)[field]
        );
      });
    } else {
      await setDoc(ref, DEFAULT_THEME);
      setTheme(DEFAULT_THEME);
    }

    setLoading(false);
  }

  async function changeColor(field: string, value: string) {
    setTheme((prev) => ({
      ...prev,
      [field]: value,
    }));

    document.documentElement.style.setProperty(
      cssMap[field],
      value
    );

    await updateDoc(
      doc(db, "admin_settings", "customize"),
      {
        [field]: value,
      }
    );
  }

  if (loading)
    return (
      <div className="p-10 text-center">
        Loading...
      </div>
    );

  return (
    <main className="min-h-screen p-6 bg-gray-100">
      <div className="max-w-4xl mx-auto rounded-3xl bg-white shadow-xl p-8">

        <h1 className="text-3xl font-black mb-8">
          Theme Builder
        </h1>

        {Object.entries(theme).map(([key, value]) => (
          <div
            key={key}
            className="mb-6"
          >
            <label className="block mb-2 font-bold">
              {key}
            </label>

            <input
              type="color"
              value={value}
              onChange={(e) =>
                changeColor(
                  key,
                  e.target.value
                )
              }
              className="h-14 w-full"
            />
          </div>
        ))}
      </div>
    </main>
  );
}
