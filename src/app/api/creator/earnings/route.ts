import { NextResponse } from "next/server";
import { getAdminAuth } from "@/firebase/admin";
import { extractEarningsBearerToken } from "@/modules/learning/earnings-access-contracts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store, max-age=0", "Vary": "Authorization" };

/**
 * Deliberately fail-closed until the canonical reconciled ledger repository and
 * Firestore schema are approved and integrated. Never substitute Monetag raw
 * earnings or payment collections for the settlement ledger.
 */
export async function GET(req: Request) {
  const token = extractEarningsBearerToken(req.headers.get("authorization"));
  if (!token) return NextResponse.json({ success: false, code: "UNAUTHORIZED" }, { status: 401, headers });
  try {
    await getAdminAuth().verifyIdToken(token, true);
  } catch {
    return NextResponse.json({ success: false, code: "UNAUTHORIZED" }, { status: 401, headers });
  }
  return NextResponse.json({
    success: false,
    code: "EARNINGS_LEDGER_NOT_CONFIGURED",
    message: "Earnings history is unavailable until the reconciled ledger repository is configured.",
  }, { status: 503, headers });
}
