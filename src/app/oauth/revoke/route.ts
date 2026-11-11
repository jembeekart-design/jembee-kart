import { NextResponse } from "next/server";
import { getAdminDb } from "@/firebase/admin";
import { hashOpaqueToken, noStoreHeaders } from "@/lib/mcp/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const rawBody = await req.text();
  if (rawBody.length > 4096) return new NextResponse(null, { status: 200, headers: noStoreHeaders() });
  const form = new URLSearchParams(rawBody);
  const token = form.get("token") || "";
  if (token && token.length <= 512) {
    const db = getAdminDb();
    const hashed = hashOpaqueToken(token);
    const accessRef = db.collection("mcpOAuthAccessTokens").doc(hashed);
    const refreshRef = db.collection("mcpOAuthRefreshTokens").doc(hashed);
    const [access, refresh] = await Promise.all([accessRef.get(), refreshRef.get()]);
    const familyId = access.data()?.familyId || refresh.data()?.familyId;
    if (typeof familyId === "string" && familyId) {
      const [accessFamily, refreshFamily] = await Promise.all([
        db.collection("mcpOAuthAccessTokens").where("familyId", "==", familyId).get(),
        db.collection("mcpOAuthRefreshTokens").where("familyId", "==", familyId).get(),
      ]);
      const batch = db.batch();
      accessFamily.docs.forEach((doc) => batch.delete(doc.ref));
      refreshFamily.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
    } else {
      await Promise.all([accessRef.delete().catch(() => undefined), refreshRef.delete().catch(() => undefined)]);
    }
  }
  return new NextResponse(null, { status: 200, headers: noStoreHeaders() });
}
