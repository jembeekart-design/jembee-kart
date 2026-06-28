"use client";

import ColorPicker from "./ColorPicker";
import TypographySettings from "./TypographySettings";
import BorderRadiusSettings from "./BorderRadiusSettings";
import ShadowSettings from "./ShadowSettings";
import ButtonSettings from "./ButtonSettings";

type Theme = {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  cardColor: string;
  textColor: string;
  borderColor: string;

  borderRadius: string;

  buttonRadius: number;
  cardRadius: number;
  inputRadius: number;

  fontFamily: string;
  headingSize: number;
  bodySize: number;
  fontWeight: string;

  shadow: string;
  shadowOpacity: number;
  borderWidth: number;

  buttonStyle: string;
  buttonSize: string;
  buttonHoverEffect: string;
  buttonIconPosition: string;
};
type Props = {
  theme: Theme;
  setTheme: React.Dispatch<
    React.SetStateAction<Theme>
  >;
};

export default function ThemeEditor({
  theme,
  setTheme,
}: Props) {

  return (

    <div className="grid gap-6">

      <ColorPicker
        theme={theme}
        setTheme={setTheme}
      />

      <TypographySettings
        theme={theme}
        setTheme={setTheme}
      />

      <BorderRadiusSettings
        theme={theme}
        setTheme={setTheme}
      />

      <ShadowSettings
        theme={theme}
        setTheme={setTheme}
      />

      <ButtonSettings
        theme={theme}
        setTheme={setTheme}
      />

    </div>

  );

}
