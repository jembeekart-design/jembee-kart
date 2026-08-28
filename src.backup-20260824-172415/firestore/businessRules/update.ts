import {
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/firebase/config";

import type {
  ProfitabilityRules,
} from "./types";

import {
  BUSINESS_RULES_COLLECTION,
  BUSINESS_RULE_DOCUMENTS,
} from "./defaults";

export async function updateProfitabilityRules(
  rules: ProfitabilityRules
) {
  await updateDoc(
    doc(
      db,
      BUSINESS_RULES_COLLECTION,
      BUSINESS_RULE_DOCUMENTS.profitability
    ),
    {
      ...rules,
      updatedAt: serverTimestamp(),
    }
  );
}
