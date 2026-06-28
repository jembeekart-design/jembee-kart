export type Theme = {
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

  shadow: "none" | "sm" | "md" | "lg" | "xl";
  shadowOpacity: number;
  borderWidth: number;

  buttonStyle: "filled" | "outline" | "soft" | "gradient";
  buttonSize: string;
  buttonHoverEffect: string;
  buttonIconPosition: string;
};
