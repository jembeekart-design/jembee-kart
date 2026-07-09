"use client";

import type { Theme } from "@/types/theme";

type Props = {
  theme: Theme;
  setTheme: React.Dispatch<
    React.SetStateAction<Theme>
  >;
};

export default function ButtonSettings({
  theme,
  setTheme,
}: Props) {

  const style =
    theme.buttonStyle ?? "filled";

  const size =
    theme.buttonSize ?? "md";

  const iconPosition =
    theme.buttonIconPosition ?? "left";

  const hoverEffect =
    theme.buttonHoverEffect ?? "scale";

  function getPadding() {

    switch (size) {

      case "sm":
        return "8px 18px";

      case "lg":
        return "16px 36px";

      default:
        return "12px 28px";

    }

  }

  function getButtonStyle() {

    switch (style) {

      case "outline":
        return {
          background: "transparent",
          color: theme.primaryColor,
          border: `2px solid ${theme.primaryColor}`,
        };

      case "soft":
        return {
          background: `${theme.primaryColor}22`,
          color: theme.primaryColor,
          border: "none",
        };

      case "gradient":
        return {
          background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
          color: "#ffffff",
          border: "none",
        };

      default:
        return {
          background: theme.primaryColor,
          color: "#ffffff",
          border: "none",
        };

    }

  }

  return (

    <div className="rounded-2xl border border-slate-700 bg-slate-950 p-6">

      <h2 className="mb-6 text-2xl font-bold">
        Button Settings
      </h2>

      <div className="grid gap-6 md:grid-cols-2">

        <div>

          <label className="mb-2 block">
            Button Style
          </label>

          <select
            value={style}
            onChange={(e) =>
              setTheme((prev) => ({
                ...prev,
                buttonStyle:
                  e.target.value as Theme["buttonStyle"],
              }))
            }
            className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3"
          >

            <option value="filled">
              Filled
            </option>

            <option value="outline">
              Outline
            </option>

            <option value="soft">
              Soft
            </option>

            <option value="gradient">
              Gradient
            </option>

          </select>

        </div>

        <div>

          <label className="mb-2 block">
            Button Size
          </label>

          <select
            value={size}
            onChange={(e) =>
              setTheme((prev) => ({
                ...prev,
                buttonSize:
                  e.target.value as Theme["buttonSize"],
              }))
            }
            className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3"
          >

            <option value="sm">
              Small
            </option>

            <option value="md">
              Medium
            </option>

            <option value="lg">
              Large
            </option>

          </select>

        </div>

        <div>

          <label className="mb-2 block">
            Icon Position
          </label>

          <select
            value={iconPosition}
            onChange={(e) =>
              setTheme((prev) => ({
                ...prev,
                buttonIconPosition:
                  e.target.value as Theme["buttonIconPosition"],
              }))
            }
            className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3"
          >

            <option value="left">
              Left
            </option>

            <option value="right">
              Right
            </option>

          </select>

        </div>

        <div>

          <label className="mb-2 block">
            Hover Effect
          </label>

          <select
            value={hoverEffect}
            onChange={(e) =>
              setTheme((prev) => ({
                ...prev,
                buttonHoverEffect:
                  e.target.value as Theme["buttonHoverEffect"],
              }))
            }
            className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3"
          >

            <option value="none">
              None
            </option>

            <option value="scale">
              Scale
            </option>

            <option value="shadow">
              Shadow
            </option>

          </select>

        </div>

      </div>

      <div className="mt-8 flex flex-wrap gap-6">

        <button
          style={{
            ...getButtonStyle(),
            padding: getPadding(),
            borderRadius:
              `${theme.buttonRadius}px`,
            transition: "all .3s",
          }}
          className={
            hoverEffect === "scale"
              ? "hover:scale-105"
              : hoverEffect === "shadow"
              ? "hover:shadow-2xl"
              : ""
          }
        >
          {iconPosition === "left" &&
            "⭐ "}
          Preview Button
          {iconPosition === "right" &&
            " ⭐"}
        </button>

        <button
          disabled
          style={{
            padding: getPadding(),
            borderRadius:
              `${theme.buttonRadius}px`,
            opacity: 0.5,
          }}
          className="bg-slate-700 text-[var(--button-text-color)]"
        >
          Disabled
        </button>

        <button
          style={{
            padding: getPadding(),
            borderRadius:
              `${theme.buttonRadius}px`,
          }}
          className="animate-pulse bg-slate-600 text-[var(--button-text-color)]"
        >
          Loading...
        </button>

      </div>

    </div>

  );

}
