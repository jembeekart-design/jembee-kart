import { NextResponse } from "next/server";
import { db } from "@/firebase/config";
import { collection, getDocs } from "firebase/firestore";

export async function GET() {
  try {
    const collections = ["users", "products", "orders", "notifications"];
    const result: Record<string, number> = {};

    for (const name of collections) {
      try {
        const snap = await getDocs(collection(db, name));
        result[name] = snap.size;
      } catch {
        result[name] = -1; // Collection read failed
      }
    }

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (e: any) {
    return NextResponse.json(
      {
        success: false,
        code: e.code,
        message: e.message,
      },
      { status: 500 }
    );
  }
}
