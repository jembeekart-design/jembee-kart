"use client";

type Theme = {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  cardColor: string;
  textColor: string;
  borderColor: string;
  buttonRadius: number;
  fontFamily: string;
};

type Props = {
  theme: Theme;
  setTheme: React.Dispatch<
    React.SetStateAction<Theme>
  >;
};

type ColorField =
  | "primaryColor"
  | "secondaryColor"
  | "backgroundColor"
  | "cardColor"
  | "textColor"
  | "borderColor";

function ColorInput({
  label,
  field,
  theme,
  setTheme,
}: {
  label: string;
  field: ColorField;
  theme: Theme;
  setTheme: React.Dispatch<
    React.SetStateAction<Theme>
  >;
}) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">

      <label className="mb-3 block font-medium">
        {label}
      </label>

      <div className="flex items-center gap-4">

        <input
          type="color"
          value={theme[field]}
          onChange={(e) =>
            setTheme((prev) => ({
              ...prev,
              [field]: e.target.value,
            }))
          }
          className="h-14 w-14 cursor-pointer rounded-lg border border-slate-600"
        />

        <input
          type="text"
          value={theme[field]}
          onChange={(e) =>
            setTheme((prev) => ({
              ...prev,
              [field]: e.target.value,
            }))
          }
          className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-3"
        />

      </div>

    </div>
  );
}

export default function ColorPicker({
  theme,
  setTheme,
}: Props) {

  return (

    <div className="rounded-2xl border border-slate-700 bg-slate-950 p-6">

      <h2 className="mb-6 text-2xl font-bold">
        Theme Colors
      </h2>

      <div className="grid gap-5 md:grid-cols-2">

        <ColorInput
          label="Primary Color"
          field="primaryColor"
          theme={theme}
          setTheme={setTheme}
        />

        <ColorInput
          label="Secondary Color"
          field="secondaryColor"
          theme={theme}
          setTheme={setTheme}
        />

        <ColorInput
          label="Background Color"
          field="backgroundColor"
          theme={theme}
          setTheme={setTheme}
        />

        <ColorInput
          label="Card Color"
          field="cardColor"
          theme={theme}
          setTheme={setTheme}
        />

        <ColorInput
          label="Text Color"
          field="textColor"
          theme={theme}
          setTheme={setTheme}
        />

        <ColorInput
          label="Border Color"
          field="borderColor"
          theme={theme}
          setTheme={setTheme}
        />

      </div>

    </div>

  );

}
