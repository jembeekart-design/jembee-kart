import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    {
      id: "1",
      title: "Build Completed",
      message: "Production build completed successfully.",
      type: "success",
      read: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: "2",
      title: "Scanner Finished",
      message: "All governance scanners passed.",
      type: "info",
      read: true,
      createdAt: new Date().toISOString(),
    },
  ]);
}
