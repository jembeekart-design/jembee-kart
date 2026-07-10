// types/theme.ts

export interface Theme {
  // --- Colors ---
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  surfaceColor: string;
  cardColor: string;
  textColor: string;
  mutedTextColor: string;
  headingColor: string;
  borderColor: string;
  successColor: string;
  warningColor: string;
  dangerColor: string;
  infoColor: string;
  buttonTextColor: string;
  inputBackgroundColor: string;
  inputBorderColor: string;
  sidebarColor: string;
  headerColor: string;
  footerColor: string;
  linkColor: string;
  hoverColor: string;
  activeColor: string;

  // --- Typography ---
  fontFamily: string;
  headingFont: string;
  bodyFont: string;
  headingSize: number;
  bodySize: number;
  letterSpacing: string;
  lineHeight: number;
  textTransform: "none" | "uppercase" | "capitalize" | "lowercase";
  fontWeight: string;

  // --- Components & Effects ---
  borderRadius: number;
  buttonRadius: number;
  cardRadius: number;
  inputRadius: number;
  borderWidth: number;
  shadow: string;
  shadowOpacity: number;
  
  // Button Builder Fields
  buttonStyle: "filled" | "outline" | "ghost" | "gradient" | "glass" | "3d";
  buttonSize: "sm" | "md" | "lg";
  buttonHoverEffect: "scale" | "lift" | "none";
  buttonIconPosition?: "left" | "right"; // Error Fix: Added this
  
  // Animations & Others
  animationStyle: "fade" | "scale" | "slide" | "rotate" | "bounce";
}
