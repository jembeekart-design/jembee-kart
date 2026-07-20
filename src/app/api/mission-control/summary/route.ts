import { NextResponse } from "next/server";
import { db } from "@/firebase/config";
import { collection, getDocs } from "firebase/firestore";

export async function GET() {
  try {
    const snapshot = await getDocs(collection(db, "users"));

    return NextResponse.json({
      success: true,
      count: snapshot.size,
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
