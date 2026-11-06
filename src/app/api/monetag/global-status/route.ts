import { NextResponse } from "next/server";
import { getAdminDb } from "@/firebase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const snap = await getAdminDb()
      .collection("payment_settings")
      .doc("monetagGlobal")
      .get();

    return NextResponse.json(
      { enabled: snap.exists && snap.data()?.enabled === true },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch {
    return NextResponse.json(
      { enabled: false },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  }
}
