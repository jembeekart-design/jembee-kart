import { NextResponse } from "next/server";
import { adminDb } from "@/firebase/admin";

export async function GET() {
  try {
    const collections = await adminDb.listCollections();

    return NextResponse.json({
      success: true,
      collections: collections.map(c => c.id),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}
