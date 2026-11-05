import { NextResponse } from "next/server";
import { requireAdmin, isAdminIdentity } from "@/lib/server/requireAdmin";
import { getAdminDb } from "@/firebase/admin";
import { DEFAULT_BUSINESS_RULES } from "@/firestore/businessRules/defaults";

export async function GET(req: Request) {
  const identity = await requireAdmin(req);
  if (!isAdminIdentity(identity)) return identity;
  try {
    const snap = await getAdminDb().collection("business_rules").doc("featureFlags").get();
    const flags = { ...DEFAULT_BUSINESS_RULES.featureFlags, ...(snap.data() || {}) };
    return NextResponse.json(Object.entries(flags).map(([id, enabled]) => ({ id, name: id, enabled: enabled === true })));
  } catch {
    return NextResponse.json({ success: false, message: "Unable to load feature flags" }, { status: 500 });
  }
}
