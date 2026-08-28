import { db } from "@/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { DEFAULT_BUSINESS_RULES } from "@/firestore/businessRules/defaults";
import { BusinessRulesConfig } from "@/firestore/businessRules/types";

// Simple in-memory cache
let cache: { data: BusinessRulesConfig | null; expires: number } = {
  data: null,
  expires: 0,
};

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function getBusinessRulesConfig(): Promise<BusinessRulesConfig> {
  if (cache.data && Date.now() < cache.expires) {
    return cache.data;
  }

  try {
    // We fetch only the core documents needed for MLM/Payouts
    // To minimize reads, we could fetch them individually or in a batch if implemented
    const referralSnap = await getDoc(doc(db, "business_rules", "referral"));
    const creatorEconomySnap = await getDoc(doc(db, "business_rules", "creatorEconomy"));
    const signupSnap = await getDoc(doc(db, "business_rules", "signup"));
    const featureFlagsSnap = await getDoc(doc(db, "business_rules", "featureFlags"));

    const config: BusinessRulesConfig = {
      ...DEFAULT_BUSINESS_RULES,
      referral: {
        ...DEFAULT_BUSINESS_RULES.referral,
        ...(referralSnap.exists() ? referralSnap.data() : {}),
      },
      creatorEconomy: {
        ...DEFAULT_BUSINESS_RULES.creatorEconomy,
        ...(creatorEconomySnap.exists() ? creatorEconomySnap.data() : {}),
      },
      signup: {
        ...DEFAULT_BUSINESS_RULES.signup,
        ...(signupSnap.exists() ? signupSnap.data() : {}),
      },
      featureFlags: {
        ...DEFAULT_BUSINESS_RULES.featureFlags,
        ...(featureFlagsSnap.exists() ? featureFlagsSnap.data() : {}),
      },
    };

    cache = {
      data: config,
      expires: Date.now() + CACHE_TTL_MS,
    };

    return config;
  } catch (error) {
    console.error("Error fetching business rules:", error);
    return DEFAULT_BUSINESS_RULES;
  }
}
