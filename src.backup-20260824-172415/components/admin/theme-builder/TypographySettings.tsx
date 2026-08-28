"use client";


import type { Theme } from "@/types/theme";

type Props = {
  theme: Theme;
  setTheme: React.Dispatch<
    React.SetStateAction<Theme>
  >;
};

export default function TypographySettings({
  theme,
  setTheme,
}: Props) {

  return (

    <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--card-color)] p-6">

      <h2 className="mb-6 text-2xl font-bold">
        Typography
      </h2>

      <div className="grid gap-6 md:grid-cols-2">

        <div>

          <label className="mb-2 block font-medium">
            Font Family
          </label>

          <select
            value={theme.fontFamily}
            onChange={(e) =>
              setTheme((prev) => ({
                ...prev,
                fontFamily: e.target.value,
              }))
            }
            className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-color)] px-4 py-3"
          >
            <option value="Inter">
              Inter
            </option>

            <option value="Poppins">
              Poppins
            </option>

            <option value="Roboto">
              Roboto
            </option>

            <option value="Outfit">
              Outfit
            </option>

          </select>

        </div>

        <div>

          <label className="mb-2 block font-medium">
            Heading Size
          </label>

          <input
            type="number"
            value={theme.headingSize ?? 32}
            onChange={(e) =>
              setTheme((prev) => ({
                ...prev,
                headingSize: Number(
                  e.target.value
                ),
              }))
            }
            className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-color)] px-4 py-3"
          />

        </div>

        <div>

          <label className="mb-2 block font-medium">
            Body Size
          </label>

          <input
            type="number"
            value={theme.bodySize ?? 16}
            onChange={(e) =>
              setTheme((prev) => ({
                ...prev,
                bodySize: Number(
                  e.target.value
                ),
              }))
            }
            className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-color)] px-4 py-3"
          />

        </div>

        <div>

          <label className="mb-2 block font-medium">
            Font Weight
          </label>

          <select
            value={
              theme.fontWeight ??
              "400"
            }
            onChange={(e) =>
              setTheme((prev) => ({
                ...prev,
                fontWeight:
                  e.target.value,
              }))
            }
            className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-color)] px-4 py-3"
          >

            <option value="300">
              Light
            </option>

            <option value="400">
              Regular
            </option>

            <option value="500">
              Medium
            </option>

            <option value="600">
              Semi Bold
            </option>

            <option value="700">
              Bold
            </option>

            <option value="800">
              Extra Bold
            </option>

          </select>

        </div>

      </div>

      <div className="mt-8 rounded-xl border border-[var(--border-color)] bg-[var(--card-color)] p-5">

        <h1
          style={{
            fontFamily: theme.fontFamily,
            fontSize: `${
              theme.headingSize ?? 32
            }px`,
            fontWeight:
              theme.fontWeight ??
              "400",
          }}
        >
          JembeeKart Theme Preview
        </h1>

        <p
          className="mt-3"
          style={{
            fontFamily: theme.fontFamily,
            fontSize: `${
              theme.bodySize ?? 16
            }px`,
          }}
        >
          This is a live typography preview.
        </p>

      </div>

    </div>

  );

}
