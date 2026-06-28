"use client";

type Theme = {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  cardColor: string;
  textColor: string;
  borderColor: string;
  buttonRadius: number;
  cardRadius: number;
  inputRadius: number;
  fontFamily: string;
  shadow: string;
  shadowOpacity: number;
  borderWidth: number;
};

type Props = {
  theme: Theme;
  setTheme: React.Dispatch<
    React.SetStateAction<Theme>
  >;
};

function getShadow(
  shadow: Theme["shadow"],
  opacity: number
) {
  switch (shadow) {

    case "sm":
      return `0 1px 4px rgba(0,0,0,${opacity})`;

    case "md":
      return `0 4px 10px rgba(0,0,0,${opacity})`;

    case "lg":
      return `0 10px 24px rgba(0,0,0,${opacity})`;

    case "xl":
      return `0 18px 40px rgba(0,0,0,${opacity})`;

    default:
      return "none";
  }
}

export default function ShadowSettings({
  theme,
  setTheme,
}: Props) {

  const shadow =
    theme.shadow ?? "md";

  const opacity =
    theme.shadowOpacity ?? 0.25;

  const borderWidth =
    theme.borderWidth ?? 1;

  return (

    <div className="rounded-2xl border border-slate-700 bg-slate-950 p-6">

      <h2 className="mb-6 text-2xl font-bold">
        Shadow Settings
      </h2>

      <div className="grid gap-6 md:grid-cols-3">

        <div>

          <label className="mb-2 block font-medium">
            Shadow Style
          </label>

          <select
            value={shadow}
            onChange={(e) =>
              setTheme((prev) => ({
                ...prev,
                shadow: e.target
                  .value as Theme["shadow"],
              }))
            }
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3"
          >

            <option value="none">
              None
            </option>

            <option value="sm">
              Small
            </option>

            <option value="md">
              Medium
            </option>

            <option value="lg">
              Large
            </option>

            <option value="xl">
              Extra Large
            </option>

          </select>

        </div>

        <div>

          <label className="mb-2 block font-medium">
            Shadow Opacity
          </label>

          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={opacity}
            onChange={(e) =>
              setTheme((prev) => ({
                ...prev,
                shadowOpacity: Number(
                  e.target.value
                ),
              }))
            }
            className="w-full"
          />

          <p className="mt-2 text-sm text-slate-400">
            {opacity}
          </p>

        </div>

        <div>

          <label className="mb-2 block font-medium">
            Border Width
          </label>

          <input
            type="range"
            min="0"
            max="6"
            step="1"
            value={borderWidth}
            onChange={(e) =>
              setTheme((prev) => ({
                ...prev,
                borderWidth: Number(
                  e.target.value
                ),
              }))
            }
            className="w-full"
          />

          <p className="mt-2 text-sm text-slate-400">
            {borderWidth}px
          </p>

        </div>

      </div>

      <div className="mt-8">

        <div
          className="max-w-md p-6"
          style={{
            background: theme.cardColor,
            color: theme.textColor,
            borderColor:
              theme.borderColor,
            borderStyle: "solid",
            borderWidth:
              `${borderWidth}px`,
            borderRadius:
              `${theme.cardRadius ?? 24}px`,
            boxShadow: getShadow(
              shadow,
              opacity
            ),
          }}
        >

          <h3 className="text-xl font-bold">
            Shadow Preview
          </h3>

          <p className="mt-3">
            Live preview of the
            current shadow settings.
          </p>

          <button
            className="mt-5 px-6 py-3 font-bold text-black"
            style={{
              background:
                theme.primaryColor,
              borderRadius:
                `${theme.buttonRadius}px`,
            }}
          >
            Preview Button
          </button>

        </div>

      </div>

    </div>

  );

}
