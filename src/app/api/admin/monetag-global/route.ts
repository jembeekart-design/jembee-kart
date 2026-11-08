import { NextResponse } from "next/server";
import { getAdminDb } from "@/firebase/admin";
import { verifyMonetagAdmin } from "@/lib/server/monetagAdminAuth";
import { readBoundedJson } from "@/lib/server/readBoundedJson";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function statusFor(error: unknown) {
  const code = error instanceof Error ? error.message : "";
  return code === "UNAUTHORIZED" ? 401 : code === "FORBIDDEN" ? 403 : 500;
}

export async function GET(req: Request) {
  try {
    await verifyMonetagAdmin(req);
    const snap = await getAdminDb()
      .collection("payment_settings")
      .doc("monetagGlobal")
      .get();

    return NextResponse.json(
      { success: true, enabled: snap.exists && snap.data()?.enabled === true },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    const status = statusFor(error);
    return NextResponse.json(
      { success: false, message: status === 401 ? "कृपया लॉगिन करें।" : status === 403 ? "केवल Admin यह सेटिंग बदल सकता है।" : "Monetag setting लोड नहीं हुई।" },
      { status }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const uid = await verifyMonetagAdmin(req);
    const parsed = await readBoundedJson(req, 4096);

    if (!parsed.ok) {
      return NextResponse.json(
        { success: false, message: parsed.message },
        { status: parsed.status }
      );
    }

    if (
      !parsed.value ||
      typeof parsed.value !== "object" ||
      Array.isArray(parsed.value) ||
      typeof (parsed.value as { enabled?: unknown }).enabled !== "boolean"
    ) {
      return NextResponse.json(
        { success: false, message: "enabled must be true or false." },
        { status: 400 }
      );
    }

    const enabled = (parsed.value as { enabled: boolean }).enabled;

    await getAdminDb()
      .collection("payment_settings")
      .doc("monetagGlobal")
      .set({ enabled, updatedAt: new Date(), updatedBy: uid }, { merge: true });

    return NextResponse.json(
      { success: true, enabled },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    const status = statusFor(error);
    return NextResponse.json(
      { success: false, message: status === 401 ? "कृपया लॉगिन करें।" : status === 403 ? "केवल Admin यह सेटिंग बदल सकता है।" : "Monetag setting सेव नहीं हुई।" },
      { status }
    );
  }
}
