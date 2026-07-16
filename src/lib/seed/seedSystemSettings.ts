import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebase/config";

const SETTINGS_COLLECTION = "settings";

const DEFAULT_SETTINGS = {
  global_config: {
    appName: "JembeeKart",
    appVersion: "1.0.0",
    environment: "production",
    maintenanceMode: false,
    supportEmail: "",
    supportPhone: "",
    website: "",
    createdAt: new Date().toISOString(),
  },

  feature_flags: {
    ecommerce: true,
    referral: true,
    mlm: true,
    wallet: true,
    watchEarn: true,
    creatorEconomy: true,
    cashback: true,
    coinSystem: true,
    loyaltyProgram: true,
    sellerModule: true,
    advertisement: true,
    affiliate: true,
  },

  theme: {
  // Brand
  primaryColor: "#22c55e",
  secondaryColor: "#16a34a",
  accentColor: "#0ea5e9",

  // Backgrounds
  backgroundColor: "#ffffff",
  surfaceColor: "#f8fafc",
  cardColor: "#ffffff",
  sidebarColor: "#ffffff",
  headerColor: "#ffffff",
  footerColor: "#ffffff",

  // Text
  textColor: "#111827",
  headingColor: "#111827",
  subTextColor: "#6b7280",
  mutedTextColor: "#9ca3af",
  linkColor: "#2563eb",

  // Borders
  borderColor: "#e5e7eb",
  dividerColor: "#f1f5f9",

  // Buttons
  buttonColor: "#22c55e",
  buttonHoverColor: "#16a34a",
  buttonTextColor: "#ffffff",
  buttonBorderColor: "#22c55e",

  // Inputs
  inputBackground: "#ffffff",
  inputBorder: "#d1d5db",
  inputText: "#111827",
  inputPlaceholder: "#9ca3af",
  inputFocusBorder: "#22c55e",

  // Navigation
  navbarBackground: "#ffffff",
  navbarText: "#111827",
  navbarActive: "#22c55e",

  // Sidebar
  sidebarBackground: "#ffffff",
  sidebarText: "#374151",
  sidebarActive: "#22c55e",

  // Status Colors
  successColor: "#22c55e",
  warningColor: "#f59e0b",
  errorColor: "#ef4444",
  infoColor: "#3b82f6",

  // Typography
  fontFamily: "Inter",
  headingFont: "Inter",
  fontSize: 16,
  borderRadius: 12,

  // Effects
  shadow: "0 1px 3px rgba(0,0,0,0.1)",
  transition: "300ms",

  // Modes
  darkMode: false,
  rtl: false,
},

  wallet: {
  commissionWalletEnabled: true,
  cashbackWalletEnabled: true,
  rewardWalletEnabled: true,
  withdrawEnabled: true,

  minWithdraw: 200,
  maxWithdraw: 50000,
  autoApprove: false,
},

  mlm: {
    enabled: true,
    maxLevels: 10,
  },

  watch_earn: {
    enabled: true,
    videosRequired: 100,
    rewardAmount: 50,
  },

  referral: {
  enabled: true,
  referralBonus: 50,
  maxReferralLevels: 10,
},
  
  security: {
    twoFactor: false,
    loginAttempts: 5,
    sessionTimeout: 60,
  },

  homepage: {
    layout: "default",
    bannerEnabled: true,
    featuredProducts: true,
  },

  version: {
    appVersion: "1.0.0",
    build: 1,
    releaseChannel: "production",
  },
};

export async function seedSystemSettings() {
  console.log("🌱 Initializing System Settings...");

  const entries = Object.entries(DEFAULT_SETTINGS);

  for (const [documentId, documentData] of entries) {
    try {
      const reference = doc(db, SETTINGS_COLLECTION, documentId);

      const snapshot = await getDoc(reference);
if (snapshot.exists()) {
  await setDoc(reference, documentData, {
    merge: true,
  });

  console.log(`🔄 Updated settings/${documentId}`);
} else {
  await setDoc(reference, documentData);

  console.log(`✅ Created settings/${documentId}`);
}

} catch (error) {
      console.error(
        `❌ Failed to create settings/${documentId}`,
        error
      );
    }
  }

  console.log("🎉 System Settings initialization completed.");
}
