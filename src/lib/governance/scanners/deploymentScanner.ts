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
    });

    // HTTPS Check
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
    });

    return results;
  } catch (error) {
    console.error("Deployment Scanner Error:", error);

    return [
      {
        id: "deployment",
        name: "Deployment Scanner",
        status: "FAIL",
        message: "Unable to verify deployment status.",
        severity: "HIGH",
      },
    ];
  }
}
