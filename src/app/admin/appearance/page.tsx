"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import { updateThemeConfig } from "@/firestore/settings/updateThemeConfig";

import {
  Palette,
  Save,
  Sun,
  Moon,
  Monitor
} from "lucide-react";

export default function AppearancePage() {
  const { theme, setTheme } = useTheme();

  const [localTheme, setLocalTheme] = useState(theme);

  useEffect(() => {
    if (theme) {
      setLocalTheme(theme);
    }
  }, [theme]);

  async function saveAppearance() {
    try {
      await updateThemeConfig(localTheme);
      setTheme(localTheme);
      alert("Appearance Settings Saved");
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save settings");
    }
  }

  if (!localTheme) return <div>Loading...</div>;

  return (
    <main
      className="min-h-screen p-4 text-[var(--button-text-color)]"
      style={{
        background: localTheme.backgroundColor,
      }}
    >
      {/* HEADER */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-[24px]"
            style={{
              background: localTheme.primaryColor,
            }}
          >
            <Palette size={30} />
          </div>
          <div>
            <h1 className="text-3xl font-black">
              Appearance Settings
            </h1>
            <p className="mt-1 text-sm text-[var(--muted-text-color)]">
              Customize app design & theme
            </p>
          </div>
        </div>
        <button
          onClick={saveAppearance}
          className="flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold text-[var(--button-text-color)]"
          style={{
            background: localTheme.primaryColor,
          }}
        >
          <Save size={18} />
          Save Settings
        </button>
      </div>

      {/* SETTINGS */}
      <div className="space-y-5">
        {/* THEME */}
        <div className="rounded-[30px] bg-[var(--primary-color)] p-5">
          <div className="mb-5 flex items-center gap-3">
            <Monitor
              size={24}
              className="text-[var(--primary-color)]"
            />
            <h2 className="text-2xl font-black">
              Select Theme
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => setLocalTheme({ ...localTheme, mode: "light" } as any)}
              className={`rounded-2xl p-4 ${
                localTheme.mode === "light"
                  ? "border-2 border-[var(--border-color)]"
                  : "bg-[var(--card-color)]"
              }`}
            >
              <Sun
                size={28}
                className="mx-auto"
              />
              <p className="mt-2 text-sm font-bold">
                Light
              </p>
            </button>
            <button
              onClick={() => setLocalTheme({ ...localTheme, mode: "dark" } as any)}
              className={`rounded-2xl p-4 ${
                localTheme.mode === "dark"
                  ? "border-2 border-[var(--border-color)]"
                  : "bg-[var(--card-color)]"
              }`}
            >
              <Moon
                size={28}
                className="mx-auto"
              />
              <p className="mt-2 text-sm font-bold">
                Dark
              </p>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
