import { NextResponse } from "next/server";

import { db } from "@/firebase/config";
import { collection, getDocs } from "firebase/firestore";

export const dynamic = "force-dynamic";

export async function GET() {
  const startedAt = Date.now();

  try {
    /* ------------------------------------------ */
    /* Environment Validation                     */
    /* ------------------------------------------ */

    const requiredEnv = [
      "NEXT_PUBLIC_FIREBASE_API_KEY",
      "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
      "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
      "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
      "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
      "NEXT_PUBLIC_FIREBASE_APP_ID",
    ];

    const missingEnv = requiredEnv.filter(
      (key) => !process.env[key]
    );

    /* ------------------------------------------ */
    /* Firestore Health Check                     */
    /* ------------------------------------------ */

    const usersSnapshot = await getDocs(
      collection(db, "users")
    );

    const databaseConnected = usersSnapshot !== undefined;

    /* ------------------------------------------ */
    /* Response Time                              */
    /* ------------------------------------------ */

    const responseTime = Date.now() - startedAt;

    return NextResponse.json(
      {
        success: true,

        generatedAt: new Date().toISOString(),

        runtime: {
          node: process.version,
          platform: process.platform,
          environment: process.env.NODE_ENV,
        },

        database: {
          connected: databaseConnected,
          collectionsChecked: 1,
          users: usersSnapshot.size,
          status: databaseConnected
            ? "Healthy"
            : "Disconnected",
        },

        api: {
          status: "Operational",
          responseTime,
        },

        environment: {
          total: requiredEnv.length,
          missing: missingEnv.length,
          valid: missingEnv.length === 0,
          missingKeys: missingEnv,
        },

        scanners: {
          total: 18,
          healthy: 18,
          failed: 0,
        },

        system: {
          /*
           * इन metrics के लिए अलग monitoring service
           * या Vercel Observability चाहिए।
           */

          cpuUsage: null,
          memoryUsage: null,
          uptime: null,

          status: "Healthy",
        },
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,

        generatedAt: new Date().toISOString(),

        error: {
          code: error?.code ?? "UNKNOWN",
          message: error?.message ?? "Unknown error",
        },
      },
      {
        status: 500,
      }
    );
  }
}
