// src/lib/admin-config/useMLMConfig.ts

"use client";

import { useAdminConfig } from "./provider";
import { DEFAULT_MLM_CONFIG } from "./mlmDefaults";

export function useMLMConfig() {
  const admin = useAdminConfig();

  // Agar Firestore me mlmConfig add ho chuka hai to use karo,
  // warna default config use hogi.
  const mlm =
    (admin as any).mlmConfig ??
    DEFAULT_MLM_CONFIG;

  return {
    admin,
    mlm,

    pages: mlm.pages,
    cashback: mlm.cashback,

    isMLMEnabled: () => mlm.enabled,

    isPageEnabled: (
      page: keyof typeof mlm.pages
    ) => {
      return mlm.pages[page].enabled;
    },
  };
}

export default useMLMConfig;
