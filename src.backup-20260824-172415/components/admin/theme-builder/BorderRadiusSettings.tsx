"use client";

import type { Theme } from "@/types/theme";

type Props = {
  theme: Theme;
  setTheme: React.Dispatch<
    React.SetStateAction<Theme>
  >;
};

export default function BorderRadiusSettings({
  theme,
  setTheme,
}: Props) {

  return (

    <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--card-color)] p-6">

      <h2 className="mb-6 text-2xl font-bold">
        Border Radius
      </h2>

      <div className="grid gap-6 md:grid-cols-3">

        <div>

          <label className="mb-2 block font-medium">
            Button Radius
          </label>

          <input
            type="range"
            min="0"
            max="50"
            value={theme.buttonRadius}
            onChange={(e) =>
              setTheme((prev) => ({
                ...prev,
                buttonRadius: Number(
                  e.target.value
                ),
              }))
            }
            className="w-full"
          />

          <p className="mt-2 text-sm text-[var(--text-color)]">
            {theme.buttonRadius}px
          </p>

        </div>

        <div>

          <label className="mb-2 block font-medium">
            Card Radius
          </label>

          <input
            type="range"
            min="0"
            max="50"
            value={theme.cardRadius ?? 24}
            onChange={(e) =>
              setTheme((prev) => ({
                ...prev,
                cardRadius: Number(
                  e.target.value
                ),
              }))
            }
            className="w-full"
          />

          <p className="mt-2 text-sm text-[var(--text-color)]">
            {theme.cardRadius ?? 24}px
          </p>

        </div>

        <div>

          <label className="mb-2 block font-medium">
            Input Radius
          </label>

          <input
            type="range"
            min="0"
            max="50"
            value={theme.inputRadius ?? 12}
            onChange={(e) =>
              setTheme((prev) => ({
                ...prev,
                inputRadius: Number(
                  e.target.value
                ),
              }))
            }
            className="w-full"
          />

          <p className="mt-2 text-sm text-[var(--text-color)]">
            {theme.inputRadius ?? 12}px
          </p>

        </div>

      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-3">

        <button
          className="px-6 py-4 font-bold text-[var(--text-color)]"
          style={{
            background: theme.primaryColor,
            borderRadius: `${theme.buttonRadius}px`,
          }}
        >
          Button Preview
        </button>

        <div
          className="border p-6"
          style={{
            background: theme.cardColor,
            borderColor: theme.borderColor,
            borderRadius: `${
              theme.cardRadius ?? 24
            }px`,
            color: theme.textColor,
          }}
        >
          Card Preview
        </div>

        <input
          type="text"
          placeholder="Input Preview"
          className="border px-4 py-3 outline-none"
          style={{
            background: theme.backgroundColor,
            borderColor: theme.borderColor,
            borderRadius: `${
              theme.inputRadius ?? 12
            }px`,
            color: theme.textColor,
          }}
        />

      </div>

    </div>

  );

}
