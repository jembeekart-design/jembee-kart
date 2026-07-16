// src/lib/governance/ai-fix/registry.ts

import type { FixSuggestion } from "./types";

export const FIX_REGISTRY: Record<
  string,
  Omit<FixSuggestion, "scannerId">
> = {
  "theme-config": {
    title: "Repair Theme Configuration",
    description:
      "Create or repair the Firestore theme configuration document.",

    confidence: 99,

    estimatedTime: "15 Seconds",

    patch: {
      id: "theme-config-fix",

      file:
        "/src/lib/governance/scanners/themeScanner.ts",

      lineStart: 1,

      type: "replace",

      title: "Repair Theme Scanner",

      description:
        "Update theme scanner to use settings/theme.",

      autoApplicable: true,

      newCode: "",
    },
  },

  "wallet-config": {
    title: "Repair Wallet Configuration",

    description:
      "Create missing wallet fields automatically.",

    confidence: 98,

    estimatedTime: "20 Seconds",

    patch: {
      id: "wallet-config-fix",

      file:
        "/src/lib/governance/scanners/walletScanner.ts",

      lineStart: 1,

      type: "replace",

      title: "Repair Wallet Scanner",

      description:
        "Update wallet scanner and seed configuration.",

      autoApplicable: true,

      newCode: "",
    },
  },

  "feature-flags": {
    title: "Repair Feature Flags",

    description:
      "Create missing feature flag configuration.",

    confidence: 99,

    estimatedTime: "10 Seconds",

    patch: {
      id: "feature-flags-fix",

      file:
        "/src/lib/governance/scanners/featureFlagScanner.ts",

      lineStart: 1,

      type: "replace",

      title: "Repair Feature Flags",

      description:
        "Restore missing feature flags.",

      autoApplicable: true,

      newCode: "",
    },
  },

  "deployment-version": {
    title: "Repair Version Configuration",

    description:
      "Read application version from Firestore.",

    confidence: 99,

    estimatedTime: "15 Seconds",

    patch: {
      id: "deployment-version-fix",

      file:
        "/src/lib/governance/scanners/deploymentScanner.ts",

      lineStart: 1,

      type: "replace",

      title: "Repair Deployment Scanner",

      description:
        "Read version from settings/version.",

      autoApplicable: true,

      newCode: "",
    },
  },
};
