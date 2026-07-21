import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,

    health: {
      cpu: {
        usage: 18,
        status: "Healthy",
      },

      memory: {
        usage: 42,
        status: "Healthy",
      },

      api: {
        status: "Online",
        health: "Operational",
      },

      database: {
        status: "Connected",
        health: "Healthy",
      },

      server: {
        status: "Running",
        health: "Healthy",
      },

      security: {
        status: "Protected",
        health: "Secure",
      },
    },

    updatedAt: new Date().toISOString(),
  });
}
