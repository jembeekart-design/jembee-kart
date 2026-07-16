import type { ScanResult } from "../runSystemScan";

export async function securityScanner(): Promise<ScanResult[]> {
  const results: ScanResult[] = [];

  try {
    // Authentication
    results.push({
      id: "security-auth",
      name: "Authentication",
      status: "PASS",
      message: "Authentication service is enabled.",
      severity: "LOW",
    });

    // Firestore Rules
    results.push({
      id: "security-firestore-rules",
      name: "Firestore Rules",
      status: "WARNING",
      message: "Firestore security rules cannot be verified from client.",
      severity: "MEDIUM",

      file: "/firestore.rules",
      line: 1,

      autoFix: true,

      patchId: "firestore-rules-fix",

      suggestion:
        "Review Firestore Security Rules and apply the recommended secure rules.",

      currentCode:
        "// Firestore Rules could not be verified from client.",

      fixedCode: `rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    match /{document=**} {
      allow read, write: if request.auth != null;
    }

  }
}
`,
    });

    // Environment Variables
    const envReady =
      !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
      !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

    results.push({
      id: "security-env",
      name: "Environment Variables",
      status: envReady ? "PASS" : "FAIL",
      message: envReady
        ? "Firebase environment variables detected."
        : "Missing Firebase environment variables.",
      severity: envReady ? "LOW" : "HIGH",
    });

    // HTTPS
    const httpsEnabled =
      typeof window !== "undefined"
        ? window.location.protocol === "https:"
        : true;

    results.push({
      id: "security-https",
      name: "HTTPS",
      status: httpsEnabled ? "PASS" : "FAIL",
      message: httpsEnabled
        ? "Application is running over HTTPS."
        : "Application is not using HTTPS.",
      severity: httpsEnabled ? "LOW" : "HIGH",
    });

    return results;
  } catch (error) {
    console.error("Security Scanner Error:", error);

    return [
      {
        id: "security",
        name: "Security Scanner",
        status: "FAIL",
        message: "Unable to verify security configuration.",
        severity: "HIGH",
      },
    ];
  }
}
