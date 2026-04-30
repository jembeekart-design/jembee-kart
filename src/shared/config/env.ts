// src/shared/config/env.ts

export const ENV = {
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || "JembeeKart",
  API_URL: process.env.NEXT_PUBLIC_API_URL || "",
  FIREBASE_PROJECT: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",

  // Feature toggles
  ENABLE_AI: process.env.NEXT_PUBLIC_ENABLE_AI === "true",
  ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true",
};