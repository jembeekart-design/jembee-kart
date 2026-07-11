export interface Theme {
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
  fontFamily: string;
  headingFont: string;
  bodyFont: string;
  headingSize: number;
  bodySize: number;
  letterSpacing: string;
  lineHeight: number;
  textTransform: "none" | "uppercase" | "capitalize" | "lowercase";
  fontWeight: string;
  borderRadius: string | number;
  buttonRadius: number;
  cardRadius: number;
  inputRadius: number;
  borderWidth: number;
  shadow: string;
  shadowOpacity: number;
  buttonStyle: "filled" | "outline" | "soft" | "ghost" | "gradient" | "glass" | "3d";
  buttonSize: "sm" | "md" | "lg";
  buttonHoverEffect: "scale" | "lift" | "shadow" | "none";
  buttonIconPosition: "left" | "right";
  animationStyle: "fade" | "scale" | "slide" | "rotate" | "bounce";
  // Header
headerBackground: string;
headerTextColor: string;
headerIconColor: string;

// Search Bar
searchBarColor: string;
searchBarTextColor: string;
searchBarPlaceholderColor: string;
searchBarBorderColor: string;

// Buttons
buttonColor: string;
buttonHoverColor: string;

// Cards
cardBorderColor: string;
cardShadowColor: string;

// Navigation
navbarColor: string;
bottomNavColor: string;
bottomNavActiveColor: string;

// Banner
bannerBackground: string;

// Category
categoryBackground: string;
categoryTextColor: string;

// Product
productCardColor: string;
priceColor: string;
offerColor: string;

// Footer
footerBackground: string;
footerTextColor: string;
}
