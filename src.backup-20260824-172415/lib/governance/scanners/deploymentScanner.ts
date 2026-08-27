import type { ScanResult } from "../runSystemScan";

import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";

export async function deploymentScanner(): Promise<ScanResult[]> {
  const results: ScanResult[] = [];

  try {
    // Environment
    const environment = process.env.NODE_ENV;

    results.push({
      id: "deployment-environment",
      name: "Application Environment",

      status: environment ? "PASS" : "FAIL",

      message: environment
        ? `Running in ${environment} mode.`
        : "Environment not detected.",

      severity: environment ? "LOW" : "HIGH",

      file: "/src/lib/governance/scanners/deploymentScanner.ts",
      line: 15,

      ...(environment
        ? {}
        : {
            autoFix: true,

            patchId: "deployment-environment-fix",

            suggestion:
              "Configure NODE_ENV correctly.",

            currentCode:
              "process.env.NODE_ENV = undefined",

            fixedCode:
              "process.env.NODE_ENV = 'production'",
          }),
    });

    // Vercel Deployment
    const isVercel = !!process.env.NEXT_PUBLIC_VERCEL_URL;

    results.push({
      id: "deployment-vercel",
      name: "Vercel Deployment",

      status: isVercel ? "PASS" : "WARNING",

      message: isVercel
        ? "Application deployed on Vercel."
        : "Vercel deployment not detected.",

      severity: isVercel ? "LOW" : "MEDIUM",

      file: "/src/lib/governance/scanners/deploymentScanner.ts",
      line: 45,

      ...(isVercel
        ? {}
        : {
            autoFix: true,

            patchId: "deployment-vercel-fix",

            suggestion:
              "Deploy the application on Vercel.",

            currentCode:
              "NEXT_PUBLIC_VERCEL_URL is missing.",

            fixedCode:
              "NEXT_PUBLIC_VERCEL_URL=https://your-project.vercel.app",
          }),
    });

    // Build Version
    const versionSnap = await getDoc(
      doc(db, "settings", "version")
    );

    const version = versionSnap.exists()
      ? versionSnap.data().appVersion || "Unknown"
      : "Unknown";

    results.push({
      id: "deployment-version",
      name: "Application Version",

      status: version !== "Unknown" ? "PASS" : "WARNING",

      message: `Current Version: ${version}`,

      severity: version !== "Unknown" ? "LOW" : "MEDIUM",

      file: "/src/lib/governance/scanners/deploymentScanner.ts",
      line: 85,

      ...(version !== "Unknown"
        ? {}
        : {
            autoFix: true,

            patchId: "deployment-version-fix",

            suggestion:
              "Create the version document in Firestore.",

            currentCode:
              "// settings/version document missing",

            fixedCode: `{
  "appVersion": "1.0.0"
}`,
          }),
    });

    // HTTPS
    const secure =
      typeof window === "undefined"
        ? true
        : window.location.protocol === "https:";

    results.push({
      id: "deployment-https",
      name: "HTTPS",

      status: secure ? "PASS" : "FAIL",

      message: secure
        ? "Secure HTTPS connection."
        : "Application is not using HTTPS.",

      severity: secure ? "LOW" : "HIGH",

      file: "/src/lib/governance/scanners/deploymentScanner.ts",
      line: 120,

      ...(secure
        ? {}
        : {
            autoFix: true,

            patchId: "deployment-https-fix",

            suggestion:
              "Enable HTTPS for the application.",

            currentCode:
              "http://",

            fixedCode:
              "https://",
          }),
    });

    return results;
  } catch (error) {
    console.error("Deployment Scanner Error:", error);

    return [
      {
        id: "deployment",
        name: "Deployment Scanner",

        status: "FAIL",

        severity: "HIGH",

        message: "Unable to verify deployment status.",

        file: "/src/lib/governance/scanners/deploymentScanner.ts",
        line: 150,

        autoFix: true,

        patchId: "deployment-scanner-fix",

        suggestion:
          "Verify deployment configuration and Firestore version document.",

        currentCode:
          "// Deployment verification failed.",

        fixedCode: `{
  "appVersion": "1.0.0",
  "environment": "production"
}`,
      },
    ];
  }
}
