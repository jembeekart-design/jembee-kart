export const FEATURES = {
  CART: "cart",
  AFFILIATE: "affiliate",
  WHATSAPP: "whatsapp",
  REVIEWS: "reviews",
  VOICE_SEARCH: "voice_search",
} as const;

export type FeatureKey = typeof FEATURES[keyof typeof FEATURES];